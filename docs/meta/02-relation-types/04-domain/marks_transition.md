# marks_transition

| Field | Value |
|-------|-------|
| **name** | `marks_transition` |
| **canonical direction** | Source --marks_transition--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `marks_transition`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DomainEvent --marks_transition--> Lifecycle
```

## non-examples

```text
Target --marks_transition--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
DomainEvent --marks_transition--> Lifecycle
```
