# refined_from

| Field | Value |
|-------|-------|
| **name** | `refined_from` |
| **canonical direction** | Source --refined_from--> Target |
| **inverse** | `refines` |

## meaning

Source liên hệ với Target theo semantic `refined_from`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Invariant --refined_from--> BusinessRule
```

## non-examples

```text
Target --refined_from--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Invariant --refined_from--> BusinessRule
```
