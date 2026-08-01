#!/usr/bin/env python3
"""Three.js r185 学习手册数据构建管线。

从官方仓库 docs/ 目录提取全部 1749 个主题的 Markdown 正文，
转换为白名单 HTML，机翻为中文后注入 threejs-knowledge-map.html 的 DOCS 数据块。

用法:
  python3 tools/build_manual.py           # 构建并中文化正文
  python3 tools/build_manual.py --skip-zh # 跳过翻译（调试用）

缓存: tools/.cache-threejs/（docs 稀疏克隆 + zh-text-cache.json 译文缓存）
"""
import json
import re
import subprocess
import sys
from pathlib import Path

# 同目录导入
sys.path.insert(0, str(Path(__file__).resolve().parent))
from zh_translate import translate_docs  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "tools" / ".cache-threejs"
TARGET = ROOT / "threejs-knowledge-map.html"
REPO = "https://github.com/mrdoob/three.js.git"
REF = "r185"

# ---------- 1. 获取官方 docs（稀疏克隆，仅 docs/ 目录） ----------

def ensure_docs():
    if (CACHE / "docs" / "pages").is_dir():
        return
    CACHE.parent.mkdir(exist_ok=True)
    if CACHE.exists():
        sys.exit(f"缓存目录 {CACHE} 不完整，请删除后重试")
    subprocess.run(
        ["git", "clone", "--depth", "1", "--branch", REF, "--filter=blob:none",
         "--sparse", REPO, str(CACHE)],
        check=True,
    )
    subprocess.run(["git", "sparse-checkout", "set", "docs"], cwd=CACHE, check=True)

# ---------- 2. 解析侧栏，建立 主题标题 -> href 映射 ----------

def parse_sidebar():
    html = (CACHE / "docs" / "index.html").read_text()
    sections = re.split(r"<h2>(Core|Addons|TSL|Global)</h2>", html)[1:]
    sidebar = {}
    for i in range(0, len(sections), 2):
        domain, body = sections[i], sections[i + 1]
        cats = re.findall(r"<h3>([^<]+)</h3>\s*<ul>(.*?)</ul>", body, re.S)
        if cats:
            sidebar[domain] = {
                cat.strip(): [(t.strip(), h) for h, t in
                              re.findall(r'<a href="([^"]+)"[^>]*>([^<]+)</a>', b)
                              if "${" not in h]
                for cat, b in cats
            }
        else:
            sidebar[domain] = [(t.strip(), h) for h, t in
                               re.findall(r'<a href="([^"]+)"[^>]*>([^<]+)</a>', body)
                               if "${" not in h]
    return sidebar

# ---------- 3. Markdown -> 白名单 HTML ----------

def esc(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def slug(text):
    return re.sub(r"[^a-z0-9]+", "", text.lower())

def member_anchor(name):
    """成员锚点：两侧统一归一化（event:added 与 .added、debug / x 与 .debug.x 均对齐）。"""
    name = re.sub(r"^event:", "", name)
    return "m-" + re.sub(r"[^a-z0-9]+", "", name.lower())

unresolved = []
page_to_node = {}

def make_inline(page_node_id):
    """生成行内格式转换函数（链接改写依赖当前页节点 id）。"""
    def convert(text):
        text = esc(text)
        codes = []

        def stash_code(m):
            codes.append(m.group(1))
            return f"\x00{len(codes) - 1}\x00"

        text = re.sub(r"`([^`\n]+)`", stash_code, text)

        def link(m):
            label, target = m.group(1), m.group(2)
            if target.startswith("http://") or target.startswith("https://"):
                return f'<a href="{target}" target="_blank" rel="noreferrer">{label}</a>'
            page, _, anchor = target.partition("#")
            if page:  # Name.html 或 Name.html#member
                node_id = page_to_node.get(page)
                if node_id:
                    suffix = f"!m-{slug(anchor)}" if anchor else ""
                    return f'<a href="#/docs/{node_id}{suffix}">{label}</a>'
                unresolved.append(target)
                return f"<span>{label}</span>"
            if anchor:  # 页内锚点
                return f'<a href="#/docs/{page_node_id}!m-{slug(anchor)}">{label}</a>'
            unresolved.append(target)
            return f"<span>{label}</span>"

        text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, text)
        text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"\*(\S(?:[^*]*\S)?)\*", r"<em>\1</em>", text)
        text = re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{codes[int(m.group(1))]}</code>", text)
        return text.replace(r"\[", "[").replace(r"\]", "]")

    return convert

def md_to_html(md, node_id):
    inline = make_inline(node_id)
    out, para, in_code, code_buf, in_list = [], [], False, [], False

    def flush_para():
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para.clear()

    def close_list():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    for line in md.splitlines():
        if in_code:
            if line.strip().startswith("```"):
                out.append(f"<pre><code>{esc(chr(10).join(code_buf))}</code></pre>")
                code_buf, in_code = [], False
            else:
                code_buf.append(line)
            continue
        if line.strip().startswith("```"):
            flush_para()
            close_list()
            in_code = True
            continue
        if not line.strip():
            flush_para()
            close_list()
            continue
        bullet = re.match(r"^\*\s{1,3}(\S.*)$", line)
        if bullet:
            flush_para()
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{inline(bullet.group(1))}</li>")
            continue
        close_list()
        h = re.match(r"^(#{1,5})\s+(.+)$", line)
        if h:
            flush_para()
            close_list()
            level, title = len(h.group(1)) + 1, h.group(2).strip()  # 页首 h1 已移除，整体降一级从 h3 起
            if title.startswith("new "):
                anchor = "m-constructor"
            elif level == 4:  # ### .name : type / ### .name( ... ) -> 成员锚点
                head_name = re.split(r"[(]|\s+:", title)[0]
                anchor = member_anchor(head_name)
            else:
                anchor = f"s-{slug(title)}"
            out.append(f'<h{level} id="{anchor}">{inline(title)}</h{level}>')
            continue
        para.append(line.strip())
    flush_para()
    close_list()
    if in_code:
        sys.exit("代码围栏未闭合")
    return "\n".join(out)

# ---------- 4. 内容提取 ----------

def read_page(href):
    path = CACHE / "docs" / "pages" / f"{href}.md"
    if not path.is_file():
        return None
    md = path.read_text()
    return re.sub(r"^#[^\n]*\n", "", md, count=1).strip()  # 去掉 # 标题行，页头由界面渲染

def extract_section(source_md, anchor):
    lines = source_md.splitlines()
    start = None
    level = 0
    for idx, line in enumerate(lines):
        h = re.match(r"^(#{1,5})\s+(.+)$", line)
        if not h:
            continue
        name = re.match(r"\s*\.?([A-Za-z0-9_]+)", h.group(2))
        if start is None:
            if name and name.group(1).lower() == anchor.lower():
                start, level = idx, len(h.group(1))
        elif len(h.group(1)) <= level:
            return "\n".join(lines[start:idx])
    return "\n".join(lines[start:]) if start is not None else None

# ---------- 5. 主流程 ----------

def main():
    ensure_docs()
    sidebar = parse_sidebar()
    text = TARGET.read_text()
    m = re.search(r"const knowledgeData = (\{.*?\});\n    const datasetMeta =", text, re.S)
    data = json.loads(m.group(1))

    docs, member_refs, official_links = {}, {}, {}
    stats = {"topics": 0, "pages": 0, "sections": 0, "missing": []}
    tsl_md = (CACHE / "docs" / "pages" / "TSL.html.md").read_text()
    global_md = (CACHE / "docs" / "pages" / "global.html.md").read_text()

    def assign(topic_node, href):
        stats["topics"] += 1
        page, _, anchor = href.partition("#")
        page_to_node[page] = topic_node["id"]
        official_links[topic_node["id"]] = f"pages/{href}"
        if anchor:
            source = tsl_md if page == "TSL.html" else global_md
            section = extract_section(source, anchor)
            if section is None:
                stats["missing"].append(href)
                return
            docs[topic_node["id"]] = section
            stats["sections"] += 1
        else:
            md = read_page(page)
            if md is None:
                stats["missing"].append(href)
                return
            docs[topic_node["id"]] = md
            stats["pages"] += 1

    for domain_node in data["children"]:
        domain = domain_node["title"]
        entries = sidebar[domain]
        if domain in ("Core", "Addons"):
            for cat_node in domain_node["children"]:
                off_terms = dict(entries[cat_node["title"]])
                for term in cat_node["children"]:
                    if term["title"] not in off_terms:
                        stats["missing"].append(f"{domain}/{cat_node['title']}/{term['title']}")
                        continue
                    assign(term, off_terms[term["title"]])
        else:
            # TSL/Global 域节点本身挂载完整参考文档
            full = tsl_md if domain == "TSL" else global_md
            docs[domain_node["id"]] = re.sub(r"^#[^\n]*\n", "", full, count=1).strip()
            off = dict(entries)
            for term in domain_node["children"]:
                if term["title"] not in off:
                    stats["missing"].append(f"{domain}/{term['title']}")
                    continue
                assign(term, off[term["title"]])

    if stats["missing"]:
        sys.exit(f"内容缺失 {len(stats['missing'])} 条: {stats['missing'][:8]}")

    # 成员/分组节点 -> 所属页锚点（Global 枚举常量等节点也带成员组，不限于 class/module）
    ref_candidates = {}

    def collect_members(topic_node):
        for group in topic_node.get("children", []):
            if group["title"] in ("Properties", "Methods", "Events"):
                # 分组本身允许下钻浏览成员列表，不写入 MEMBER_REFS
                for member in group["children"]:
                    full = member_anchor(member["title"])
                    candidates = [full]
                    if " / " in member["title"]:  # 嵌套成员（debug / x）官方只文档化到父级
                        candidates.append(member_anchor(member["title"].split(" / ")[0]))
                    candidates.append(member_anchor(topic_node["title"]))  # 枚举成员回退到所属小节
                    candidates.append("")
                    member_refs[member["id"]] = {"t": topic_node["id"], "a": full}
                    ref_candidates[member["id"]] = candidates

    def walk(node):
        collect_members(node)
        for child in node.get("children", []):
            walk(child)

    walk(data)

    # Markdown -> HTML（需在 page_to_node 建全后执行）
    docs_html = {node_id: md_to_html(md, node_id) for node_id, md in docs.items()}

    # 锚点回退：官方页面缺少对应标题时逐级降级，保证跳转总有落点
    # （在中文化之前做；翻译只改文本节点，id 保持不变）
    fallback_used = 0
    for ref_id, candidates in ref_candidates.items():
        doc = docs_html.get(member_refs[ref_id]["t"], "")
        for candidate in candidates:
            if not candidate or f'id="{candidate}"' in doc:
                if candidate != member_refs[ref_id]["a"]:
                    fallback_used += 1
                member_refs[ref_id]["a"] = candidate
                break

    if "--skip-zh" in sys.argv:
        print("zh-translate: skipped (--skip-zh)")
    else:
        docs_html = translate_docs(docs_html)
        cjk_pages = sum(1 for v in docs_html.values() if re.search(r"[\u4e00-\u9fff]", v or ""))
        print(f"zh-translate: pages_with_cjk={cjk_pages}/{len(docs_html)}")

    payload = (
        "    // __DOCS_PAYLOAD_START__\n"
        "    const DOCS = " + json.dumps(docs_html, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";\n"
        "    const MEMBER_REFS = " + json.dumps(member_refs, ensure_ascii=False, separators=(",", ":")) + ";\n"
        "    const OFFICIAL_LINKS = " + json.dumps(official_links, ensure_ascii=False, separators=(",", ":")) + ";\n"
        "    // __DOCS_PAYLOAD_END__\n"
    )
    # 幂等替换：优先按标记块整体替换，否则锚定 datasetMeta 后插入
    marker_pattern = r"    // __DOCS_PAYLOAD_START__\n.*?    // __DOCS_PAYLOAD_END__\n"
    if re.search(marker_pattern, text, flags=re.S):
        text = re.sub(marker_pattern, lambda _: payload, text, flags=re.S)
    else:
        # 兼容无标记的旧数据块（按行精确删除，避免正则跨巨型行误匹配）
        lines = text.splitlines(keepends=True)
        keep = [l for l in lines if not l.lstrip().startswith(("const DOCS = {", "const MEMBER_REFS = {", "const OFFICIAL_LINKS = {"))]
        text = "".join(keep)
        anchor_line = re.search(r"(    const datasetMeta = \{[^\n]*\n)", text)
        text = text[:anchor_line.end()] + payload + text[anchor_line.end():]
    TARGET.write_text(text)

    print(f"topics={stats['topics']} pages={stats['pages']} sections={stats['sections']}")
    print(f"docs={len(docs_html)} memberRefs={len(member_refs)} anchorFallbacks={fallback_used} unresolvedLinks={len(unresolved)}")
    if unresolved:
        from collections import Counter
        print("unresolved samples:", Counter(unresolved).most_common(8))
    print(f"payloadKB={len(payload) // 1024}")

if __name__ == "__main__":
    main()
