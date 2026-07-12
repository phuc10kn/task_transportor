---
name: doc-create-entity
description: Draft a new docs/app entity instance using docs/meta schemas, docs/guide unit structure, folder-structure, and relation validation.
---

# doc-create-entity

Tạo draft entity instance trong `docs/app`.

## Workflow

```text
Task Progress:
- [ ] Đọc [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn)
- [ ] Đọc docs/guide/workflows/write-docs.md
- [ ] Xác định canonical home
- [ ] Chọn schema canonical: docs/meta/00-schemas/entity-instance.md
- [ ] Chọn unit template: docs/guide/unit-structure/entity/README.md
- [ ] Xác định layer/concern bằng docs/guide/reference/folder-structure.md và entity type từ `docs/meta` hoặc cấu trúc local đã được project chốt
- [ ] Xác nhận entity type trong docs/meta/01-entity-types/ hoặc layer-local type hợp lệ
- [ ] Chạy Type Contract Gate với `--type` của entity type đích; nếu type legacy, chuẩn hóa type trước khi tạo instance
- [ ] Xác nhận ID/status/naming theo docs/meta/04-conventions/
- [ ] Draft file theo schema, không tự thêm field ngoài schema
- [ ] Nếu có relation, chỉ dùng slot đã có trong entity type relations_template
- [ ] Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`
- [ ] Chạy Type Contract Gate với `--instance` sau khi draft instance tồn tại
- [ ] (Optional local) `npm run verify:entity-instance -- --instance <path>`
- [ ] (Optional local) `npm run verify:relations -- --instance <path>` nếu có `relations:`
- [ ] (Optional local) `npm run verify:references -- --instance <path>` nếu có basis fields
- [ ] Emit write-docs result full form (xem Output); map Drafted/Validation sang Classification/Changes/Relations/Evidence
- [ ] Validate semantic/boundary/evidence bằng docs/guide/workflows/trace-impact.md và meta-validate; rồi validate-after-change
```

## Path Chuẩn

```text
docs/app/<NN-layer>/<NN-concern>/<NN-entity-type-folder>/<ID-slug>/README.md
```

Không copy placeholder path thành file thật. Khi tạo entity, lấy layer/concern từ `docs/guide/reference/folder-structure.md`, entity type folder từ contract active trong `docs/meta` hoặc cấu trúc local đã được project chốt, rồi áp dụng ID convention trong `docs/meta`.

## Required Sources

| Cần biết | Đọc |
| --- | --- |
| Schema entity instance | `docs/meta/00-schemas/entity-instance.md` |
| Unit template | `docs/guide/unit-structure/entity/README.md` |
| Folder structure | `docs/guide/reference/folder-structure.md` |
| Entity type | `docs/meta/01-entity-types/` |
| Relation slot | entity type `relations_template` |
| Relation type | `docs/meta/02-relation-types/` |
| Valid triple | `docs/meta/03-rules/` |
| Convention | `docs/meta/04-conventions/` |

## Output

Skill này là specialization của [write-docs](../../guide/workflows/write-docs.md) cho entity instance mới. Emit **full form** `write-docs result` (không short form). Map field nội bộ sang full form như sau.

```md
## write-docs result

### Classification
- Task:
- Canonical home: <docs/app/.../README.md>
- Unit type: entity instance
- Schema / template used: docs/meta/00-schemas/entity-instance.md + docs/guide/unit-structure/entity/README.md
- Existing file reused: no
- New unit (if any): <path> + reason

### Changes
- Paths:
- App truth changed: yes
- Meta contract changed: no (trừ khi task đồng thời sửa meta — ngoài skill này)
- Theory / decision changed: no/yes + path

### Relations
- Added: <slot> -> <target> | none
- Intentionally not added: + reason
- Rejected: + reason

### Evidence / decisions
- Sync result referenced: yes/no + verdict
- Sources:
- Decision/theory basis:
- Open conflicts / questions:
  - Schema / entity type / type contract notes (nếu còn mở)

### Handoff
- trace-impact: yes/no + reason
- validate-after-change: required
- Next: trace-impact | validate-after-change | workbench-intake | clarification
```

Alias nội bộ (optional log trước khi emit full form):

| Field cũ `doc-create-entity result` | Full form |
| --- | --- |
| Drafted.Path / ID / Entity type / Layer | Classification + Changes.Paths |
| Validation.* | Evidence / decisions.Open conflicts; Relations |
| Suggested next | Handoff.Next |

Suggested next mặc định: `trace-impact` nếu có relation hoặc impact cross-layer; luôn kèm `validate-after-change`.

## Guardrails

- Không tạo entity type mới trong `docs/app`.
- Không bịa schema, ID prefix, relation slot, relation type hoặc valid triple.
- Không ghi relation nếu entity type chưa có slot tương ứng.
- Không tạo outbound relation từ Assumption hoặc ContextConstraint tới mọi entity.
- Chỉ tạo relation tới Assumption/ContextConstraint khi entity bị ảnh hưởng có slot cụ thể và valid triple cụ thể.
- Không tạo workbench item chỉ vì tiện; chỉ khi undetermined-placement và DEC-003/policy cho phép.
- Nếu chưa chắc relation, reject relation khỏi entity draft; không ghi relation nghi ngờ.
- Không tạo instance cho entity type legacy; chuẩn hóa type trước theo Type Contract Gate.
- Nếu chưa có canonical home, dừng tạo entity và chuyển `workbench-intake`.

## References

- Entity template helper: [../reference/entity-instance-template.md](../reference/entity-instance-template.md)
- Meta validate: [../meta-validate/SKILL.md](../meta-validate/SKILL.md)
- Note types: [../guides/note-types.md](../guides/note-types.md)
