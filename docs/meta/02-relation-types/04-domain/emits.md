# emits

| Field | Value |
|-------|-------|
| **name** | `emits` |
| **canonical direction** | Source --emits--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `emits`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Lifecycle --emits--> DomainEvent
```

## non-examples

```text
Target --emits--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Lifecycle --emits--> DomainEvent
```
