# validates

| Field | Value |
|-------|-------|
| **name** | `validates` |
| **canonical direction** | Source --validates--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source xác nhận Target đã đạt điều kiện.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
SuccessCriterion --validates--> Goal
```

## non-examples

```text
Target --validates--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
SuccessCriterion --validates--> Goal
```
