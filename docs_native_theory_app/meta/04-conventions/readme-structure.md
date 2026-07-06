# README Structure

Entity Instance `README.md` nên có:

```markdown
---
[frontmatter]
---

# {ID} — {Title}

## Meaning
## Responsibility / Purpose
## Key properties
## Rules / constraints
## Behavior (nếu có)
## Related Entities
## Open Relation Question (nếu relation chưa canonical)
## Open questions (NOTE-OPEN)
```

## Related Entities

Khi Relation Type chưa chốt:

```markdown
## Related Entities
- [MOD-001](../path) — mô tả

## Open Relation Question
> NOTE-CANDIDATE: relation type X→Y chưa có trong Meta
```

## Không bắt buộc

Duplicate Theory content, full code, revision history (Git là history).
