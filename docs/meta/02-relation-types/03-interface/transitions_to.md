# transitions_to

| Field | Value |
|-------|-------|
| **name** | `transitions_to` |
| **canonical direction** | Source --transitions_to--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `transitions_to`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Interaction --transitions_to--> UIState
```

## non-examples

```text
Target --transitions_to--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Interaction --transitions_to--> UIState
```
