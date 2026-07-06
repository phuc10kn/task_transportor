---
name: doc-navigate
description: Navigates docs/app/ documentation using Layer, Concern, Entity Type, and Entity Instance routing. Use when reading app knowledge, scoping context for implementation tasks, or finding related Theory and Decision references without reading all of docs/.
---

# doc-navigate

Đọc app documentation theo task — progressive disclosure từ layer xuống entity instance.

## Input

```text
task description
optional: known entity ID (MOD-001, FE-012, PROB-003, ...)
```

## Workflow

```text
Task Progress:
- [ ] Đọc docs/app/README.md — meta-model và layer list
- [ ] Xác định Layer phù hợp task
- [ ] Đọc Layer README (ví dụ docs/app/05-architecture/README.md)
- [ ] Xác định Concern trong layer
- [ ] Xác định Entity Type folder
- [ ] Đọc Entity Instance README.md
- [ ] Follow theory_basis / decision_basis / related entities nếu cần
- [ ] Mở theory-find hoặc theory-review khi gặp TH-* cần hiểu sâu
```

## Routing nhanh

| Task hint | Layer | Ví dụ concern |
|-----------|-------|---------------|
| business problem, process | `01-business/` | discovery, behavior |
| feature, requirement | `02-product/` | delivery, specification |
| screen, flow, UX | `03-ui/` | structure, interaction |
| domain concept, invariant | `04-domain/` | model, rules |
| module, boundary | `05-architecture/` | structure, boundaries |
| API, DB, security | `06-technical/` | interfaces, persistence |
| code organization | `07-implementation/` | organization, contracts |
| test, risk, defect | `08-quality/` | verification, risks |
| incident, observability | `09-operation/` | incidents, observability |
| why we chose X | `10-decisions/` | decisions |

Bảng đầy đủ: [../reference/layer-routing.md](../reference/layer-routing.md)

## Luồng đọc

```text
docs/app/README.md
    ↓
<NN-layer>/README.md
    ↓
<concern>/<entity-type>/<instance-id>/README.md
    ↓
theory_basis → theory-find (Level 2)
decision_basis → docs/app/10-decisions/...
Related Entities → expand chỉ khi cần
```

## Output template

```markdown
## doc-navigate result

### Task
[mô tả]

### Reading path
1. docs/app/...
2. ...

### Primary entities
| ID | Path | Summary |
|----|------|---------|
| MOD-001 | docs/app/05-architecture/.../MOD-001-.../README.md | [1 dòng] |

### Related references
- Theory: TH-XXX-NN → [path]
- Decision: DEC-XXX → [path]

### Context sufficient?
[Yes / No — cần expand layer X hoặc theory Level 3]

### Suggested next skill
[theory-find | theory-review | doc-create-entity | none]
```

## Ràng buộc

```text
read narrow first
expand context only when necessary
```

- Không đọc toàn bộ `docs/app/`
- Không đọc layer không liên quan task
- Không copy full entity content vào output — tóm tắt + path

## Anti-patterns

```text
đọc all layers cho task nhỏ
bỏ qua layer README — đi thẳng vào instance sai concern
assume placement khi ambiguous — dùng NOTE-OPEN
```

## Thêm

- Reading strategy: [../guides/reading-strategy.md](../guides/reading-strategy.md)
- Layer routing table: [../reference/layer-routing.md](../reference/layer-routing.md)
