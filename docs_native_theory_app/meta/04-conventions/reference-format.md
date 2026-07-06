# Reference Format

## Entity reference (markdown link)

```markdown
[PROB-001](../../01-business/01-discovery/problems/PROB-001-slug/README.md)
```

## ID reference (inline)

```text
PROB-001, FE-012, TH-MOD-05
```

## Broken reference rule

Referenced ID phải resolve tới file tồn tại hoặc NOTE-OPEN nếu planned.

## Cross-layer trace

```text
Problem → BusinessRequirement → Capability → Feature → Screen
```

Mỗi hop phải dùng Relation Type hợp lệ trong `03-rules/`.
