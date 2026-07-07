# part_of

| Field | Value |
|-------|-------|
| **name** | `part_of` |
| **canonical direction** | Source --part_of--> Target |
| **inverse** | `contains` |

## meaning

Source là thành phần của Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Process --part_of--> Scenario
```

## non-examples

```text
Target --part_of--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Process --part_of--> Scenario
```
