# constrains

| Field | Value |
|-------|-------|
| **name** | `constrains` |
| **canonical direction** | Source --constrains--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source giới hạn hoặc ràng buộc Target.

## allowed semantic

Chỉ dùng khi combination có trong [valid-triples](../../valid-triples.md).

## examples

```text
Invariant --constrains--> DomainEntity
Invariant --constrains--> ValueObject
```

## non-examples

```text
Target --constrains--> Source   (sai canonical direction)
ModuleBoundary --constrains--> Module   (không thuộc DDD pack; xem modular-monolith)
BusinessConstraint --constrains--> Process   (không thuộc DDD pack; xem meta/business)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong pack / `docs/meta/03-rules/`.
Không liệt kê cross-layer hoặc methodology khác trong DDD pack này.
Không dùng `constrains` với pseudo target như `layers/entities`, `_layer / entity_` hoặc target rộng không phải entity type canonical.

## valid usage (from entity types)

```text
Invariant --constrains--> DomainEntity
Invariant --constrains--> ValueObject
```
