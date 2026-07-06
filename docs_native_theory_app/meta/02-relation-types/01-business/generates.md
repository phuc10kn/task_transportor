# generates

| Field | Value |
|-------|-------|
| **name** | `generates` |
| **canonical direction** | Source --generates--> Target |
| **inverse** | `generated_by` |

## meaning

Source liên hệ với Target theo semantic `generates`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Policy --generates--> BusinessRule
```

## non-examples

```text
Target --generates--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Policy --generates--> BusinessRule
```
