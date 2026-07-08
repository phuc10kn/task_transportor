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

Relation canonical nên nằm trong frontmatter `relations`. Body `## Relations` dùng để giải thích link cho người đọc.

Khi Relation Type chưa chốt:

```markdown
## Relations

- `MOD-001` - mô tả relation chưa canonical.

## Open Relation Question (nếu relation chưa canonical)
> NOTE-CANDIDATE: relation type X -> Y chưa có trong Meta.
```

## Không bắt buộc

Duplicate theory content, full code, revision history (Git là history).
