# occurs_on

| Field | Value |
|-------|-------|
| **name** | `occurs_on` |
| **canonical direction** | Source --occurs_on--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `occurs_on`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Interaction --occurs_on--> Screen
```

## non-examples

```text
Target --occurs_on--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Interaction --occurs_on--> Screen
```
