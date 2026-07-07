# includes

| Field | Value |
|-------|-------|
| **name** | `includes` |
| **canonical direction** | Source --includes--> Target |
| **inverse** | `included_in` |

## meaning

Source liên hệ với Target theo semantic `includes`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Release --includes--> Feature
```

## non-examples

```text
Target --includes--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Release --includes--> Feature
```
