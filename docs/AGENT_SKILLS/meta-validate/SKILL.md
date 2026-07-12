---
name: meta-validate
description: Validate documentation schema, placement, relation references, ID patterns, and canonical boundaries against docs/meta and docs/guide.
---

# meta-validate

Validate structure, relation, ID và placement theo `docs/meta` và `docs/guide`.

## Workflow

```text
Task Progress:
- [ ] Đọc [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn)
- [ ] Đọc docs/guide/workflows/write-docs.md nếu validate unit mới/sửa
- [ ] Đọc docs/guide/workflows/trace-impact.md nếu có relation/impact
- [ ] Đọc docs/meta/README.md
- [ ] Đọc schema liên quan trong docs/meta/00-schemas/
- [ ] Đọc entity type liên quan trong docs/meta/01-entity-types/
- [ ] Nếu có relation, đọc docs/meta/02-relation-types/ và docs/meta/03-rules/
- [ ] Đọc convention liên quan trong docs/meta/04-conventions/
- [ ] Báo passed, violations, warnings, open questions
```

## Checklist

### Schema

- [ ] Nếu target là schema-managed unit, unit có schema canonical.
- [ ] Nếu target là schema-managed unit, frontmatter có required fields.
- [ ] Nếu target là schema-managed unit, không có field tự phát ngoài schema.
- [ ] (Optional local) `verify:entity-instance` có thể cover structural frontmatter/sections; skill này vẫn kiểm semantic/boundary.

Lưu ý: schema gate không áp dụng máy móc cho mọi Markdown file. README layer, guide workflow, guide reference, checklist agent và prose guide chỉ cần validate theo placement/boundary/link liên quan, trừ khi file đó tự khai báo hoặc được meta quy định là schema-managed unit.

### Placement

- [ ] Layer/concern khớp universal baseline trong `docs/guide/reference/folder-structure.md` hoặc local extension đã được chốt.
- [ ] Entity type/path bên dưới concern khớp contract active trong `docs/meta` hoặc cấu trúc local đã được project chốt.
- [ ] README layer không phình thành generic theory.

### Entity Type

- [ ] Entity type resolve được trong `docs/meta/01-entity-types/` hoặc layer-local type hợp lệ.
- [ ] ID prefix/status/naming đúng convention.
- [ ] Nếu tạo/sửa entity type, type có explicit `schema` và `## structure extends`.
- [ ] Nếu tạo instance, entity type đích pass Type Contract Gate trước khi draft và mapping `--instance` pass sau khi tạo.

### Relation

- [ ] Relation slot tồn tại trong entity type `relations_template`.
- [ ] Relation type tồn tại.
- [ ] Source/target entity type đúng slot.
- [ ] Valid triple tồn tại.
- [ ] Direction đúng canonical direction.
- [ ] Target instance tồn tại nếu slot được điền.
- [ ] Frontmatter `relations` dùng đúng slot shape.
- [ ] Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`.
- [ ] Broad premise như Assumption/ContextConstraint không có outbound relation tới mọi entity.
- [ ] (Optional local) `verify:relations` cover structural slot/triple/target; vẫn phải review trace need và evidence.

### Boundary

- [ ] Guide không chứa app truth thay `docs/app`.
- [ ] Meta không chứa app-specific detail.
- [ ] Theory không chứa implementation cụ thể.
- [ ] Workbench không được dùng như source of truth.
- [ ] App variants không được dùng như app truth.

## Output

```md
## meta-validate result

### Target
[path/scope]

### Passed
- ...

### Violations
- [must fix]

### Warnings
- [review]

### Open questions
- NOTE-OPEN: ...
```

## Guardrails

- Output là validation report, không tự apply fix nếu fix làm đổi canonical rule.
- Không coi `NOTE-CANDIDATE` là pass.
- Không coi relation thiếu slot là warning; đó là violation/reject.
- Không coi pseudo target là warning; đó là violation/reject.
- Không sửa `docs/meta` trừ khi task yêu cầu rõ.

## References

- Mandatory rules: [../guides/mandatory-rules.md](../guides/mandatory-rules.md)
- System overview: [../guides/system-overview.md](../guides/system-overview.md)
