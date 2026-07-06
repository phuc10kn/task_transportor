# AGENT_SKILLS — Theory Governance Lite

## Mục đích

`AGENT_SKILLS/` là canonical source cho hướng dẫn và Cursor Agent Skills khi làm việc với hệ thống documentation Theory Governance Lite.

```text
docs/meta/      → định nghĩa luật
docs/theories/  → nguyên lý suy luận
docs/app/       → application knowledge
AGENT_SKILLS/   → dạy agent cách đọc và sửa Markdown đúng luật
```

Cursor **không** tự discover skills từ thư mục này. Cài thủ công theo [guides/cursor-installation.md](guides/cursor-installation.md) khi cần.

---

## Skill Index

| Skill | Khi nào dùng | Path |
|-------|--------------|------|
| `theory-find` | Tìm Theory liên quan task | [theory-find/SKILL.md](theory-find/SKILL.md) |
| `theory-review` | Kiểm tra docs/code có mâu thuẫn Theory | [theory-review/SKILL.md](theory-review/SKILL.md) |
| `theory-challenge` | Tạo Challenge khi Theory có vấn đề | [theory-challenge/SKILL.md](theory-challenge/SKILL.md) |
| `theory-refine` | Đề xuất thay đổi Theory | [theory-refine/SKILL.md](theory-refine/SKILL.md) |
| `theory-impact` | Tìm docs bị ảnh hưởng khi Theory đổi | [theory-impact/SKILL.md](theory-impact/SKILL.md) |
| `doc-navigate` | Đọc app documentation theo task | [doc-navigate/SKILL.md](doc-navigate/SKILL.md) |
| `doc-create-entity` | Tạo entity instance mới trong docs/app | [doc-create-entity/SKILL.md](doc-create-entity/SKILL.md) |
| `meta-validate` | Validate structure, relation, ID, placement | [meta-validate/SKILL.md](meta-validate/SKILL.md) |

---

## Chọn skill

```text
Task mới
    │
    ├─ Liên quan Theory?
    │   ├─ Tìm theory liên quan        → theory-find
    │   ├─ Review alignment            → theory-review
    │   ├─ Theory có vấn đề              → theory-challenge
    │   ├─ Đề xuất sửa theory            → theory-refine
    │   └─ Theory đã thay đổi            → theory-impact
    │
    └─ Không liên quan Theory trực tiếp
        ├─ Đọc app knowledge             → doc-navigate
        ├─ Tạo entity mới                → doc-create-entity
        └─ Validate structure/meta       → meta-validate
```

---

## Progressive Disclosure

Agent không đọc toàn bộ `docs/`. Mở rộng context theo level:

```text
Level 1 — Task Docs       → layer/concern/entity liên quan
Level 2 — Theory Summary  → docs/theories/<theory>/README.md hoặc agent.md
Level 3 — Full Theory     → theory.md (conflict, challenge, sửa theory)
Level 4 — Governance      → governance.md (challenge, decision, reference note)
```

Chi tiết: [guides/reading-strategy.md](guides/reading-strategy.md)

---

## Nguyên tắc chung

```text
Agent output = proposal / draft
Markdown trong Git = canonical source
Không tự chốt Entity Type, Relation Type, ID prefix khi Meta chưa canonical
Không fill gap bằng assumption ẩn
```

Chi tiết: [guides/mandatory-rules.md](guides/mandatory-rules.md)

---

## Guides và Reference

| File | Nội dung |
|------|----------|
| [guides/system-overview.md](guides/system-overview.md) | Meta / Theory / App — vai trò và ranh giới |
| [guides/reading-strategy.md](guides/reading-strategy.md) | 4 levels progressive disclosure |
| [guides/mandatory-rules.md](guides/mandatory-rules.md) | Rules bắt buộc |
| [guides/note-types.md](guides/note-types.md) | NOTE-OPEN, NOTE-CANDIDATE, ... |
| [guides/cursor-installation.md](guides/cursor-installation.md) | Cài skill vào Cursor |
| [reference/layer-routing.md](reference/layer-routing.md) | Task → layer → concern |
| [reference/theory-file-structure.md](reference/theory-file-structure.md) | Cấu trúc file Theory |
| [reference/entity-instance-template.md](reference/entity-instance-template.md) | Template entity instance |

---

## Đường dẫn docs

Skills tham chiếu đường dẫn triển khai chuẩn:

```text
docs/app/
docs/meta/
docs/theories/
```

Spec thiết kế nằm tại `docs_native_theory_app/` trong repo này.
