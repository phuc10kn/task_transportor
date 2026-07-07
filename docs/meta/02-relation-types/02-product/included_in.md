# included_in

| Field | Value |
|-------|-------|
| **name** | `included_in` |
| **canonical direction** | Source --included_in--> Target |
| **inverse** | `includes` |

## meaning

Source liên hệ với Target theo semantic `included_in`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Feature --included_in--> Release
```

## non-examples

```text
Target --included_in--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Feature --included_in--> Release
```
