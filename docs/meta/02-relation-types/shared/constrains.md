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

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
BusinessConstraint --constrains--> Process
```

## non-examples

```text
Target --constrains--> Source   (sai canonical direction)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không dùng `constrains` với pseudo target như `layers/entities`, `_layer / entity_` hoặc target rộng không phải entity type canonical.

## valid usage (from entity types)

```text
BusinessConstraint --constrains--> Process
NonFunctionalRequirement --constrains--> Feature
ModuleBoundary --constrains--> Module
ModuleBoundary --constrains--> StateOwner
Invariant --constrains--> DomainEntity
Invariant --constrains--> ValueObject
AccessibilityRequirement --constrains--> Screen
```
