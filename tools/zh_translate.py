#!/usr/bin/env python3
"""将 build_manual 产出的英文 HTML 正文译为中文。

策略：
- 仅翻译可见文本节点；保留标签、id、href、code/pre 内容
- 成员签名（以 . 或 new 开头）不翻译
- 常见章节标题走固定词典（保证用词统一）
- 译文按原文 SHA1 落盘缓存，支持断点续跑

依赖: pip install deep-translator
"""
from __future__ import annotations

import hashlib
import html as html_lib
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path

CACHE_FILE = Path(__file__).resolve().parent / ".cache-threejs" / "zh-text-cache.json"

# 官方文档高频章节标题 — 固定译法，不走机翻
FIXED_TERMS = {
    "Constructor": "构造函数",
    "Properties": "属性",
    "Methods": "方法",
    "Events": "事件",
    "Import": "导入",
    "Code Example": "代码示例",
    "Source": "源码",
    "Static Methods": "静态方法",
    "Static Properties": "静态属性",
    "Type Definitions": "类型定义",
    "Classes": "类",
    "Note": "注意",
    "Notes": "注意",
    "See also": "参见",
    "Example": "示例",
    "Examples": "示例",
    "Parameters": "参数",
    "Returns": "返回值",
    "Throws": "抛出",
    "Deprecated": "已弃用",
    "Experimental": "实验性",
    "Inherited": "继承",
    "Overrides": "覆盖",
    "Default": "默认值",
    "Readonly": "只读",
    "Optional": "可选",
    "Abstract": "抽象",
    "Arguments": "参数",
}

SKIP_TAGS = frozenset({"code", "pre"})
SIG_RE = re.compile(r"^\s*(\.|new\s+)")


def _sha(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()


class _Cache:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.data = {}
        if path.is_file():
            try:
                self.data = json.loads(path.read_text())
            except json.JSONDecodeError:
                self.data = {}
        self._dirty = 0

    def get(self, text: str):
        return self.data.get(_sha(text))

    def put(self, text: str, zh: str):
        self.data[_sha(text)] = zh
        self._dirty += 1
        if self._dirty >= 40:
            self.flush()

    def flush(self):
        if self._dirty:
            self.path.write_text(json.dumps(self.data, ensure_ascii=False, separators=(",", ":")))
            self._dirty = 0


def should_skip_text(text: str) -> bool:
    s = text.strip()
    if not s:
        return True
    if SIG_RE.match(s):
        return True
    if re.fullmatch(r"[\d\s\-–—./|:;,+*()\[\]{}'\"`~!@#$%^&=<>?\\]+", s):
        return True
    if re.search(r"[\u4e00-\u9fff]", s):
        return True
    return False


class _Collector(HTMLParser):
    """收集需要翻译的文本节点（去重保序）。"""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.skip = 0
        self.needed = []
        self._seen = set()

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if self.skip:
            return
        mid = data.strip()
        if should_skip_text(mid) or mid in FIXED_TERMS:
            return
        if mid not in self._seen:
            self._seen.add(mid)
            self.needed.append(mid)


class _Rewriter(HTMLParser):
    """按字典改写文本节点，重建 HTML。"""

    def __init__(self, mapping: dict):
        super().__init__(convert_charrefs=False)
        self.mapping = mapping
        self.skip = 0
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip += 1
        attr = "".join(f' {k}="{html_lib.escape(v, quote=True)}"' for k, v in attrs)
        self.out.append(f"<{tag}{attr}>")

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and self.skip:
            self.skip -= 1
        self.out.append(f"</{tag}>")

    def handle_startendtag(self, tag, attrs):
        attr = "".join(f' {k}="{html_lib.escape(v, quote=True)}"' for k, v in attrs)
        self.out.append(f"<{tag}{attr} />")

    def handle_data(self, data):
        if self.skip or not data.strip():
            self.out.append(data)
            return
        lead_len = len(data) - len(data.lstrip(" \t"))
        trail_len = len(data) - len(data.rstrip(" \t"))
        lead = data[:lead_len]
        trail = data[len(data) - trail_len :] if trail_len else ""
        mid = data.strip()
        if mid in FIXED_TERMS:
            zh = FIXED_TERMS[mid]
        elif should_skip_text(mid):
            zh = mid
        else:
            zh = self.mapping.get(mid, mid)
        self.out.append(f"{lead}{zh}{trail}")

    def handle_entityref(self, name):
        self.out.append(f"&{name};")

    def handle_charref(self, name):
        self.out.append(f"&#{name};")


def _translate_batch(texts: list[str], retries: int = 4) -> list[str]:
    """将多条短文本合并为一次请求，显著减少往返。"""
    from deep_translator import GoogleTranslator

    translator = GoogleTranslator(source="en", target="zh-CN")
    sep = "\n⟦§⟧\n"
    last_err = None

    def translate_one(t: str) -> str:
        if len(t) <= 4200:
            return translator.translate(t)
        chunks, buf = [], ""
        for part in re.split(r"(?<=[.!?])\s+", t):
            if len(buf) + len(part) > 4000 and buf:
                chunks.append(buf)
                buf = part
            else:
                buf = f"{buf} {part}".strip() if buf else part
        if buf:
            chunks.append(buf)
        return "".join(translator.translate(c) for c in chunks)

    def translate_group(group: list[str]) -> list[str]:
        if len(group) == 1:
            return [translate_one(group[0])]
        joined = sep.join(group)
        if len(joined) > 4200:
            # 过大则对半拆
            mid = len(group) // 2
            return translate_group(group[:mid]) + translate_group(group[mid:])
        zh = translator.translate(joined)
        parts = zh.split(sep)
        if len(parts) != len(group):
            # 分隔符被吞时退回逐条
            return [translate_one(t) for t in group]
        return parts

    for attempt in range(retries):
        try:
            # 按长度贪心打包到 ~3800 字符
            out, bucket, size = [], [], 0
            for t in texts:
                extra = len(t) + len(sep)
                if bucket and size + extra > 3800:
                    out.extend(translate_group(bucket))
                    time.sleep(0.08)
                    bucket, size = [], 0
                bucket.append(t)
                size += extra
            if bucket:
                out.extend(translate_group(bucket))
            return out
        except Exception as err:  # noqa: BLE001 — 网络抖动统一重试
            last_err = err
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"翻译失败: {last_err}")


def ensure_translations(texts: list[str], cache: _Cache, progress_every: int = 100) -> dict:
    mapping = {}
    pending = []
    for t in texts:
        if t in FIXED_TERMS:
            mapping[t] = FIXED_TERMS[t]
            continue
        hit = cache.get(t)
        if hit:
            mapping[t] = hit
        else:
            pending.append(t)

    total = len(pending)
    print(f"zh-translate: unique={len(texts)} cached={len(texts) - total} pending={total}")
    batch = 40
    done = 0
    for i in range(0, total, batch):
        chunk = pending[i : i + batch]
        try:
            zh_list = _translate_batch(chunk)
        except Exception as err:  # noqa: BLE001
            print(f"zh-translate: batch failed ({err}), fallback keep-en for {len(chunk)}")
            zh_list = chunk
        for en, zh in zip(chunk, zh_list):
            if not zh or not str(zh).strip():
                zh = en
            mapping[en] = zh
            cache.put(en, zh)
        done += len(chunk)
        if done % progress_every < batch or done >= total:
            print(f"zh-translate: {done}/{total}", flush=True)
        time.sleep(0.12)
    cache.flush()
    return mapping


def translate_html(html: str, mapping: dict) -> str:
    if not html.strip():
        return html
    rewriter = _Rewriter(mapping)
    rewriter.feed(html)
    rewriter.close()
    return "".join(rewriter.out)


def collect_needed(html_pages: dict[str, str]) -> list[str]:
    seen = set()
    ordered = []
    for html in html_pages.values():
        if not html:
            continue
        c = _Collector()
        c.feed(html)
        c.close()
        for t in c.needed:
            if t not in seen:
                seen.add(t)
                ordered.append(t)
    return ordered


def translate_docs(docs_html: dict[str, str]) -> dict[str, str]:
    """翻译全部文档 HTML，返回新字典。"""
    needed = collect_needed(docs_html)
    cache = _Cache(CACHE_FILE)
    mapping = ensure_translations(needed, cache)
    mapping.update(FIXED_TERMS)
    out = {}
    for node_id, html in docs_html.items():
        out[node_id] = translate_html(html, mapping) if html else html
    cache.flush()
    return out
