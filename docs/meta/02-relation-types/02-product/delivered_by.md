# delivered_by

| Field | Value |
|-------|-------|
| **name** | `delivered_by` |
| **canonical direction** | Source --delivered_by--> Target |
| **inverse** | `delivers` |

## meaning

Source liên hệ với Target theo semantic `delivered_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Capability --delivered_by--> Feature
```

## non-examples

```text
Target --delivered_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Capability --delivered_by--> Feature
```
