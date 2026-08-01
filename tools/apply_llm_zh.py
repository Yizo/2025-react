#!/usr/bin/env python3
"""将大模型产出的 seg-*.zh.json 合并进缓存，并重写 DOCS 为中文。"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from zh_translate import (  # noqa: E402
    CACHE_FILE,
    FIXED_TERMS,
    _Cache,
    collect_needed,
    translate_html,
)

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "threejs-knowledge-map.html"
SEG_DIR = ROOT / "tools" / ".cache-threejs" / "llm-segs"


def load_zh_maps() -> dict[str, str]:
    mapping = dict(FIXED_TERMS)
    for path in sorted(SEG_DIR.glob("seg-*.zh.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        items = data.items() if isinstance(data, dict) else data
        for en, zh in items:
            if en and zh and str(zh).strip():
                mapping[str(en)] = str(zh).strip()
    return mapping


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    docs = json.loads(re.search(r"const DOCS = (\{.*?\});\n", text, re.S).group(1))
    needed = collect_needed(docs)
    mapping = load_zh_maps()

    cache = _Cache(CACHE_FILE)
    for en, zh in mapping.items():
        if en not in FIXED_TERMS:
            cache.put(en, zh)
    cache.flush()

    missing = [t for t in needed if t not in mapping]
    print(f"mapped={len(mapping)} needed={len(needed)} missing={len(missing)}")

    out = {nid: (translate_html(html, mapping) if html else html) for nid, html in docs.items()}

    refs = re.search(r"    const MEMBER_REFS = \{.*?\};\n", text, re.S).group(0)
    links = re.search(r"    const OFFICIAL_LINKS = \{.*?\};\n", text, re.S).group(0)
    full = (
        "    // __DOCS_PAYLOAD_START__\n"
        "    const DOCS = "
        + json.dumps(out, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
        + ";\n"
        + refs
        + links
        + "    // __DOCS_PAYLOAD_END__\n"
    )
    new_text, n = re.subn(
        r"    // __DOCS_PAYLOAD_START__\n.*?    // __DOCS_PAYLOAD_END__\n",
        lambda _: full,
        text,
        count=1,
        flags=re.S,
    )
    if n != 1:
        sys.exit("无法注入 DOCS 数据块")
    TARGET.write_text(new_text, encoding="utf-8")
    cjk = sum(1 for v in out.values() if re.search(r"[\u4e00-\u9fff]", v or ""))
    print(f"pages_with_cjk={cjk}/{len(out)} bytes={TARGET.stat().st_size}")


if __name__ == "__main__":
    main()
