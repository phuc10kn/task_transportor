# informs

| Field | Value |
|-------|-------|
| **name** | `informs` |
| **canonical direction** | Source --informs--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `informs`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Process --informs--> UseCase
```

## non-examples

```text
Target --informs--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Process --informs--> UseCase
```
