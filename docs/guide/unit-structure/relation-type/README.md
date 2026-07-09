# Unit Structure - Relation Type

Template này dùng cho relation type definition trong `docs/meta/02-relation-types/`.

Schema canonical: [relation-type-definition.md](../../../meta/00-schemas/relation-type-definition.md).

## YAML Structure

```yaml
relation_type_definition:
  name: governs
  canonical_direction: Source --governs--> Target
  inverse: none
  inverse_kind: derived
  meaning: Source đặt rule, policy, standard hoặc governing pattern mà Target phải tuân thủ.
  allowed_semantic:
    - Source có authority hoặc rule ảnh hưởng trực tiếp tới Target.
  examples:
    - BusinessRule --governs--> Process
  non_examples:
    - Process --governs--> BusinessRule
  anti_patterns:
    - Dùng relation này khi chỉ có liên quan mơ hồ.
  valid_usage:
    - source: BusinessRule
      relation: governs
      target: Process
```

## Markdown Definition Skeleton

```md
# governs

| Field | Value |
| --- | --- |
| **name** | `governs` |
| **canonical direction** | Source --governs--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

## allowed semantic

## examples

## non-examples

## anti-patterns

## valid usage
```

`inverse kind` bắt buộc cho mọi file mới và file relation type được chỉnh sửa.
File legacy chưa có trường này được chấp nhận tạm theo luật suy diễn (`inverse` có giá trị → `paired`, không có `inverse` → `none`) cho đến khi file đó được chỉnh sửa.
