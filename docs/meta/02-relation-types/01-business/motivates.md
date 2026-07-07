# motivates

| Field | Value |
|-------|-------|
| **name** | `motivates` |
| **canonical direction** | Source --motivates--> Target |
| **inverse** | `addresses` |

## meaning

Source liên hệ với Target theo semantic `motivates`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Problem --motivates--> Goal
```

## non-examples

```text
Target --motivates--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Problem --motivates--> Goal
```
