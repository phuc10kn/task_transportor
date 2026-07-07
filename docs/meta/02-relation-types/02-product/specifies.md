# specifies

| Field | Value |
|-------|-------|
| **name** | `specifies` |
| **canonical direction** | Source --specifies--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `specifies`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
FunctionalRequirement --specifies--> Feature
```

## non-examples

```text
Target --specifies--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
FunctionalRequirement --specifies--> Feature
```
