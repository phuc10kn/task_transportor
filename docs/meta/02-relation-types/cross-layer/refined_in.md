# refined_in

| Field | Value |
|-------|-------|
| **name** | `refined_in` |
| **canonical direction** | Source --refined_in--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `refined_in`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
UseCase --refined_in--> UserFlow
```

## non-examples

```text
Target --refined_in--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
UseCase --refined_in--> UserFlow
```
