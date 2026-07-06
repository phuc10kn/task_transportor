# contains

| Field | Value |
|-------|-------|
| **name** | `contains` |
| **canonical direction** | Source --contains--> Target |
| **inverse** | `part_of` |

## meaning

Source bao gồm Target như một phần.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Aggregate --contains--> DomainEntity
```

## non-examples

```text
Target --contains--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Aggregate --contains--> DomainEntity
Journey --contains--> UserFlow
```
