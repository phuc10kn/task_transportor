# Cursor Installation

`AGENT_SKILLS/` là canonical source. Cursor discover skills từ:

```text
~/.cursor/skills/<skill-name>/SKILL.md     # personal — mọi project
.cursor/skills/<skill-name>/SKILL.md       # project — chia sẻ trong repo
```

**Không** đặt skills trong `~/.cursor/skills-cursor/` — thư mục đó dành cho Cursor built-in.

---

## Cài một skill

```bash
# Personal (khuyến nghị nếu dùng nhiều project)
mkdir -p ~/.cursor/skills/theory-find
cp docs_native_theory_app/AGENT_SKILLS/theory-find/SKILL.md ~/.cursor/skills/theory-find/

# Project (chia sẻ với team)
mkdir -p .cursor/skills/theory-find
cp docs_native_theory_app/AGENT_SKILLS/theory-find/SKILL.md .cursor/skills/theory-find/
```

Lặp lại cho từng skill cần dùng.

---

## Cài tất cả skills

```bash
SKILLS_SRC="docs_native_theory_app/AGENT_SKILLS"
DEST="$HOME/.cursor/skills"   # hoặc .cursor/skills cho project

for skill in theory-find theory-review theory-challenge theory-refine theory-impact \
             doc-navigate doc-create-entity meta-validate; do
  mkdir -p "$DEST/$skill"
  cp "$SKILLS_SRC/$skill/SKILL.md" "$DEST/$skill/"
done
```

---

## Guides và reference

Guides (`guides/`, `reference/`) **không** cần copy sang `.cursor/skills/`.

Skills link tới chúng qua đường dẫn trong repo. Khi agent chạy trong repo, đọc trực tiếp từ:

```text
docs_native_theory_app/AGENT_SKILLS/guides/
docs_native_theory_app/AGENT_SKILLS/reference/
```

Nếu cài skill personal và làm việc ngoài repo, copy cả thư mục `AGENT_SKILLS/guides/` và `reference/` vào cùng vị trí hoặc chỉnh link trong SKILL.md.

---

## Verify

1. Mở Cursor Settings → Rules / Skills
2. Skill xuất hiện với `name` và `description` từ YAML frontmatter
3. Gọi skill bằng tên (ví dụ `@theory-find`) hoặc mô tả task phù hợp trigger terms

---

## Cập nhật skill

Sau khi sửa SKILL.md trong `AGENT_SKILLS/`, copy lại sang destination đã cài.

Giữ `AGENT_SKILLS/` là source of truth; `.cursor/skills/` là bản deploy.
