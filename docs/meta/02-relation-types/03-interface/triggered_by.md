# triggered_by

| Field | Value |
|-------|-------|
| **name** | `triggered_by` |
| **canonical direction** | Source --triggered_by--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `triggered_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
UIState --triggered_by--> Interaction
```

## non-examples

```text
Target --triggered_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
UIState --triggered_by--> Interaction
```
