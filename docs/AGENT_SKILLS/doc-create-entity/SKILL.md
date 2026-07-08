---
name: doc-create-entity
description: Draft a new docs/app entity instance using docs/meta schemas, docs/guide unit structure, folder-structure, and relation validation.
---

# doc-create-entity

Tạo draft entity instance trong `docs/app`.

## Workflow

```text
Task Progress:
- [ ] Đọc docs/guide/README.md#luồng-vận-hành-chuẩn
- [ ] Đọc docs/guide/workflows/write-docs.md
- [ ] Xác định canonical home
- [ ] Chọn schema canonical: docs/meta/00-schemas/entity-instance.md
- [ ] Chọn unit template: docs/guide/unit-structure/entity/README.md
- [ ] Xác định layer/concern/entity type bằng docs/guide/reference/folder-structure.md
- [ ] Xác nhận entity type trong docs/meta/01-entity-types/ hoặc layer-local type hợp lệ
- [ ] Xác nhận ID/status/naming theo docs/meta/04-conventions/
- [ ] Draft file theo schema, không tự thêm field ngoài schema
- [ ] Validate relation bằng docs/guide/workflows/trace-impact.md và meta-validate
```

## Path Chuẩn

```text
docs/app/<NN-layer>/<NN-concern>/<NN-entity-type-folder>/<ID-slug>/README.md
```

Ví dụ:

```text
docs/app/01-business/04-behavior/01-processes/PROC-001-backlog-to-cis-lite/README.md
```

## Required Sources

| Cần biết | Đọc |
| --- | --- |
| Schema entity instance | `docs/meta/00-schemas/entity-instance.md` |
| Unit template | `docs/guide/unit-structure/entity/README.md` |
| Folder structure | `docs/guide/reference/folder-structure.md` |
| Entity type | `docs/meta/01-entity-types/` |
| Relation type | `docs/meta/02-relation-types/` |
| Valid triple | `docs/meta/03-rules/` |
| Convention | `docs/meta/04-conventions/` |

## Output

```md
## doc-create-entity result

### Drafted
- Path:
- ID:
- Entity type:
- Layer/concern:

### Validation
- Schema:
- Entity type:
- Relations:
- Open questions:

### Suggested next
meta-validate / theory-review / none
```

## Guardrails

- Không tạo entity type mới trong `docs/app`.
- Không bịa schema, ID prefix, relation type hoặc valid triple.
- Không tạo workbench item vì workbench chưa hoạt động.
- Nếu chưa chắc, dùng `NOTE-OPEN` hoặc `NOTE-CANDIDATE`.

## References

- Entity template helper: [../reference/entity-instance-template.md](../reference/entity-instance-template.md)
- Meta validate: [../meta-validate/SKILL.md](../meta-validate/SKILL.md)
- Note types: [../guides/note-types.md](../guides/note-types.md)
