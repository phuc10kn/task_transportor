# has_scope

| Field | Value |
|-------|-------|
| **name** | `has_scope` |
| **canonical direction** | Source --has_scope--> Target |
| **inverse** | `applies_to` |

## meaning

Source liên hệ với Target theo semantic `has_scope`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Application --has_scope--> Scope
```

## non-examples

```text
Target --has_scope--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Application --has_scope--> Scope
```
