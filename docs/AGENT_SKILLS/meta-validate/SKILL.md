---
name: meta-validate
description: Validates documentation structure, entity placement, relation references, and ID patterns against docs/meta/ rules. Use when creating entities, reviewing folder structure, checking broken references, or resolving placement ambiguity.
---

# meta-validate

Validate structure, relation, ID, và placement theo `docs/meta/`.

## Trigger

```text
tạo Entity Type hoặc instance mới
tạo Relation
validate structure trước commit
kiểm tra broken references
review documentation model
resolve placement ambiguity
sau doc-create-entity
```

## Workflow

```text
Task Progress:
- [ ] Đọc docs/meta/README.md
- [ ] Load relevant Entity Type definition từ 01-entity-types/
- [ ] Nếu có relations → 02-relation-types/ + 03-rules/
- [ ] Kiểm tra ID, naming, folder path theo 04-conventions/
- [ ] Liệt kê violations và warnings
- [ ] Đề xuất fix — không tự canonical hóa Meta
```

## Luồng đọc Meta

```text
docs/meta/README.md
    ↓
01-entity-types/<type>.md (khi validate entity)
    ↓
02-relation-types/ (khi validate relation)
    ↓
03-rules/ (valid combinations, cardinality)
    ↓
04-conventions/ (ID pattern, folder naming)
```

## Checklist validation

### Structure

```text
- [ ] Path: docs/app/<layer>/<concern>/<entity-type-plural>/<id>/README.md
- [ ] Layer number và concern folder khớp layer README
- [ ] README.md tồn tại làm entry point
- [ ] Không có concern wrapper vô nghĩa (chỉ 1 entity type, không routing value)
```

### Entity Type

```text
- [ ] Entity Type được định nghĩa trong Meta (hoặc NOTE-CANDIDATE nếu chưa)
- [ ] Required fields trong frontmatter đủ
- [ ] ID khớp pattern (prefix, numbering)
- [ ] Instance không chứa Pure Theory content
```

### Relations

```text
- [ ] Relation Type canonical trong Meta (hoặc Open Relation Question)
- [ ] Direction rule từ 03-rules/ được tuân thủ
- [ ] Không tự bịa relation type name
- [ ] Cross-layer relations hợp lệ theo rules
```

### References

```text
- [ ] theory_basis IDs tồn tại trong docs/theories/
- [ ] decision_basis IDs tồn tại trong docs/app/10-decisions/
- [ ] Related entity paths resolve được
```

## Output template

```markdown
## meta-validate result

### Target
[path hoặc mô tả scope]

### Passed
- [item]

### Violations (must fix)
- [rule ref] — [mô tả]

### Warnings
- [ambiguous placement, NOTE-CANDIDATE items]

### Open questions
- NOTE-OPEN: [...]

### Suggested fixes
- [đề xuất — không apply tự động nếu ảnh hưởng Meta canonical]
```

## Khi Meta chưa chốt

```text
không tự bịa schema
không tự bịa relation
không tự bịa ID prefix
không tự bịa cardinality
```

Dùng NOTE-CANDIDATE / NOTE-OPEN.

## Ràng buộc

- Validator logic derive từ Meta — Meta Markdown là source of truth
- Agent không sửa `docs/meta/` canonical definitions trừ khi explicit task
- Output = validation report

## Anti-patterns

```text
coi NOTE-CANDIDATE như đã pass validation
validate mà không đọc entity type definition
bỏ qua relation direction rules
```

## Thêm

- System overview: [../guides/system-overview.md](../guides/system-overview.md)
- Mandatory rules: [../guides/mandatory-rules.md](../guides/mandatory-rules.md)
- Entity template: [../reference/entity-instance-template.md](../reference/entity-instance-template.md)
