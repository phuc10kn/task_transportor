# AGENT_SKILLS - Docs Operating Skills

## Mục Đích

`docs/AGENT_SKILLS/` là home cho checklist và agent skills khi Codex, Cursor hoặc agent runner khác làm việc với hệ thống docs.

Folder này không thay `docs/guide` và không định nghĩa rule mới. Mọi standard agent bắt đầu từ [Luồng vận hành chuẩn](../guide/README.md#luồng-vận-hành-chuẩn).

## Canonical Boundaries

```text
docs/guide/        -> manual vận hành docs
docs/meta/         -> schema, rule, relation, convention canonical
docs/app/          -> app truth của CIS
docs/theories/     -> reasoning foundation
docs/guide/reference/entity-maps/packs/ -> reusable taxonomy/template, không phải app truth
docs/workbench/    -> workspace hỗ trợ, chưa được đi vào hoạt động
docs/AGENT_SKILLS/ -> agent checklist, không thay guide/meta
```

## Phân Loại Agent

### Standard Agent

Đây là đường mặc định cho mọi task docs. Các skill đang active trong index bên dưới đọc guide, làm việc với canonical home và không dùng workbench.

### Workbench-Support Agent

Workbench agent là một nhóm tách riêng, chỉ hỗ trợ standard agent sau khi project local đã kích hoạt workbench. `task_transportor` chưa có workbench-support agent active; không được dùng hoặc tạo workbench item trong task docs thông thường.

## Standard Skill Index

| Skill | Khi dùng | Path |
| --- | --- | --- |
| `doc-navigate` | Đọc app documentation theo task | [doc-navigate/SKILL.md](doc-navigate/SKILL.md) |
| `doc-create-entity` | Tạo draft entity instance trong `docs/app` | [doc-create-entity/SKILL.md](doc-create-entity/SKILL.md) |
| `meta-validate` | Validate schema, placement, relation, ID | [meta-validate/SKILL.md](meta-validate/SKILL.md) |
| `graph-materialize` | Materialize graph slice theo trace need local đã chốt | [graph-materialize/SKILL.md](graph-materialize/SKILL.md) |
| `theory-find` | Tìm theory liên quan task | [theory-find/SKILL.md](theory-find/SKILL.md) |
| `theory-review` | Review docs/code theo theory | [theory-review/SKILL.md](theory-review/SKILL.md) |
| `theory-challenge` | Ghi challenge khi theory có vấn đề | [theory-challenge/SKILL.md](theory-challenge/SKILL.md) |
| `theory-refine` | Đề xuất refine theory | [theory-refine/SKILL.md](theory-refine/SKILL.md) |
| `theory-impact` | Trace impact khi theory đổi | [theory-impact/SKILL.md](theory-impact/SKILL.md) |

## Chọn Standard Skill

Bắt đầu bằng [Luồng vận hành chuẩn](../guide/README.md#luồng-vận-hành-chuẩn), rồi chọn skill phù hợp:

- Chỉ đọc app knowledge: [doc-navigate](doc-navigate/SKILL.md).
- Tạo hoặc sửa entity: [doc-create-entity](doc-create-entity/SKILL.md) và [meta-validate](meta-validate/SKILL.md).
- Materialize canonical app relation: [graph-materialize](graph-materialize/SKILL.md), rồi [meta-validate](meta-validate/SKILL.md).
- Có relation hoặc impact: [meta-validate](meta-validate/SKILL.md) và [trace-impact.md](../guide/workflows/trace-impact.md).
- Liên quan theory: [theory-find](theory-find/SKILL.md), [theory-review](theory-review/SKILL.md) hoặc [theory-impact](theory-impact/SKILL.md).
- Theory có vấn đề: [theory-challenge](theory-challenge/SKILL.md) hoặc [theory-refine](theory-refine/SKILL.md).

## Nguyên Tắc Bắt Buộc

- Agent output là proposal/draft/report, không tự chốt canonical truth.
- Khi guide mâu thuẫn với meta, ưu tiên `docs/meta`.
- Khi guide mâu thuẫn với app truth, ưu tiên `docs/app`.
- Không tự tạo schema, entity type, relation slot, relation type, valid triple hoặc ID prefix.
- Không dùng `docs/workbench` làm source of truth vì workbench chưa được đi vào hoạt động.
- Standard agent là mặc định; workbench-support agent chỉ có thể hỗ trợ sau local activation và phải handoff về standard flow.
- Không coi guide pack là app truth; chỉ dùng `docs/guide/reference/entity-maps/packs/` như reusable taxonomy/template.

## Guides Và Reference

| File | Nội dung |
| --- | --- |
| [guides/system-overview.md](guides/system-overview.md) | Vai trò các vùng docs |
| [guides/reading-strategy.md](guides/reading-strategy.md) | Progressive disclosure |
| [guides/mandatory-rules.md](guides/mandatory-rules.md) | Rules bắt buộc cho agent |
| [guides/note-types.md](guides/note-types.md) | NOTE vocabulary |
| [guides/cursor-installation.md](guides/cursor-installation.md) | Dùng/cài skill cho Codex, Cursor hoặc agent runner khác |
| [reference/layer-routing.md](reference/layer-routing.md) | Routing phụ, canonical vẫn ở guide folder-structure |
| [reference/entity-instance-template.md](reference/entity-instance-template.md) | Template phụ, canonical vẫn ở meta schema + guide unit structure |
| [reference/theory-file-structure.md](reference/theory-file-structure.md) | Structure theory package |

Manual đầy đủ: [../guide/README.md](../guide/README.md).
