# aligns_with

| Field | Value |
|-------|-------|
| **name** | `aligns_with` |
| **canonical direction** | Source --aligns_with--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `aligns_with`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Release --aligns_with--> Scope
```

## non-examples

```text
Target --aligns_with--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Release --aligns_with--> Scope
```
