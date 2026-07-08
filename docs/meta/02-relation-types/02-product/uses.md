# uses

| Field | Value |
|-------|-------|
| **name** | `uses` |
| **canonical direction** | Source --uses--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `uses`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
UseCase --uses--> Capability
InteractionFlow --uses--> Interface
```

## non-examples

```text
Target --uses--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
UseCase --uses--> Capability
```
