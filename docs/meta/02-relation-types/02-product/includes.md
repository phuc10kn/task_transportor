# includes

| Field | Value |
|-------|-------|
| **name** | `includes` |
| **canonical direction** | Source --includes--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

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
Feature --includes--> Release   (sai direction; dùng derived inverse khi cần trace ngược)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Release --includes--> Feature
```
