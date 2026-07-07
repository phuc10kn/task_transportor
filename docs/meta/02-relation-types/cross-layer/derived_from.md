# derived_from

| Field | Value |
|-------|-------|
| **name** | `derived_from` |
| **canonical direction** | Source --derived_from--> Target |
| **inverse** | `source_for` |

## meaning

Source được suy ra hoặc bắt nguồn từ Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
BusinessRequirement --derived_from--> Problem
```

## non-examples

```text
Target --derived_from--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
BusinessRequirement --derived_from--> Problem
```
