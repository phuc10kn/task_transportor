# displayed_on

| Field | Value |
|-------|-------|
| **name** | `displayed_on` |
| **canonical direction** | Source --displayed_on--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `displayed_on`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
UIState --displayed_on--> Screen
```

## non-examples

```text
Target --displayed_on--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
UIState --displayed_on--> Screen
```
