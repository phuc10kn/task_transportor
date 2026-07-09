# Unit Structure - Valid Triple

Template này dùng cho valid triple rule trong `docs/meta/03-rules/**/valid-triples.md`.

Schema canonical: [valid-triple-rule.md](../../../meta/00-schemas/valid-triple-rule.md).

## YAML Structure

```yaml
valid_triple_rule:
  scope: 01-business
  triples:
    - source: BusinessRule
      relation: governs
      target: Process
      cardinality: 0..n
      notes: Rule chi phối process.
```

## Markdown Table

```md
| Source | Relation | Target | Cardinality | Notes |
| --- | --- | --- | --- | --- |
| BusinessRule | `governs` | Process | 0..n | Rule chi phối process. |
```

## Rule

- `Source` và `Target` phải là entity type.
- `Relation` phải là relation type canonical.
- Valid triple không chứa app instance ID.
- Cardinality mặc định `0..n` nếu file legacy chưa có cột này.
