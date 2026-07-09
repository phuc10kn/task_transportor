# README Structure

Schema canonical: [entity-instance.md](../00-schemas/entity-instance.md) và [structure-extends.md](../00-schemas/structure-extends.md).

Entity Instance `README.md` base phải có:

```markdown
---
[frontmatter]
---

# {ID} - {Title}

## Summary
## Meaning
## Relations
## Validation Notes
```

Entity type đặc thù có thể thêm section qua `structure extends`.

Nếu entity type không khai báo extension, dùng core sections mặc định:

```markdown
## Responsibility
## Rules
```

Ví dụ `Process`:

```markdown
## Trigger
## Participants
## Steps
## Outcomes
```

## Relations

Relation canonical phải nằm trong YAML frontmatter field `relations`, dùng slot name từ `relations_template` của entity type.

Body `## Relations` chỉ giải thích link cho người đọc, không thay thế canonical relation.

Nếu entity type chưa có slot phù hợp, relation bị reject. Không ghi relation nghi ngờ vào entity README.

Ví dụ:

```yaml
relations:
  governs:
    - PROC-001
```

## Không bắt buộc

Duplicate theory content, full code, revision history (Git là history).
