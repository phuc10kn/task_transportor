# affected_by

| Field | Value |
|-------|-------|
| **name** | `affected_by` |
| **canonical direction** | Source --affected_by--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `affected_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Stakeholder --affected_by--> Problem
```

## non-examples

```text
Target --affected_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Stakeholder --affected_by--> Problem
```
