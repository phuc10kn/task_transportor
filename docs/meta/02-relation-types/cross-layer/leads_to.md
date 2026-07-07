# leads_to

| Field | Value |
|-------|-------|
| **name** | `leads_to` |
| **canonical direction** | Source --leads_to--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `leads_to`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Problem --leads_to--> BusinessRequirement
```

## non-examples

```text
Target --leads_to--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Problem --leads_to--> BusinessRequirement
```
