# participates_in

| Field | Value |
|-------|-------|
| **name** | `participates_in` |
| **canonical direction** | Source --participates_in--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `participates_in`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Stakeholder --participates_in--> Process
```

## non-examples

```text
Target --participates_in--> Source   (sai direction nếu inverse được định nghĩa)
Module --participates_in--> InteractionFlow   (architecture dùng InteractionFlow --involves--> Module)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Stakeholder --participates_in--> Process
```
