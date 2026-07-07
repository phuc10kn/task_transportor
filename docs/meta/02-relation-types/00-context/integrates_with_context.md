# integrates_with_context

| Field | Value |
|-------|-------|
| **name** | `integrates_with_context` |
| **canonical direction** | Source --integrates_with_context--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `integrates_with_context`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
ExternalSystem --integrates_with_context--> Application
```

## non-examples

```text
Target --integrates_with_context--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
ExternalSystem --integrates_with_context--> Application
```
