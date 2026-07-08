# Unit Structure - Relation Type

Template này dùng cho relation type definition trong `docs/meta/02-relation-types/`.

Schema canonical: [relation-type-definition.md](../../../meta/00-schemas/relation-type-definition.md).

## YAML Structure

```yaml
relation_type_definition:
  name: governed_by
  canonical_direction: Source --governed_by--> Target
  inverse: governs
  inverse_kind: paired
  meaning: Source bị chi phối bởi rule, policy hoặc governing entity ở Target.
  allowed_semantic:
    - Target có authority hoặc rule ảnh hưởng trực tiếp tới Source.
  examples:
    - Process --governed_by--> BusinessRule
  non_examples:
    - BusinessRule --governed_by--> Process
  anti_patterns:
    - Dùng relation này khi chỉ có liên quan mơ hồ.
  valid_usage:
    - source: Process
      relation: governed_by
      target: BusinessRule
```

## Markdown Definition Skeleton

```md
# governed_by

| Field | Value |
| --- | --- |
| **name** | `governed_by` |
| **canonical direction** | Source --governed_by--> Target |
| **inverse** | `governs` |
| **inverse kind** | paired |

## meaning

## allowed semantic

## examples

## non-examples

## anti-patterns

## valid usage
```
