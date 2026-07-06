# submits_via

| Field | Value |
|-------|-------|
| **name** | `submits_via` |
| **canonical direction** | Source --submits_via--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `submits_via`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Form --submits_via--> Interaction
```

## non-examples

```text
Target --submits_via--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Form --submits_via--> Interaction
```
