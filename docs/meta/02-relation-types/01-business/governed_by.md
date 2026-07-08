# governed_by

| Field | Value |
|-------|-------|
| **name** | `governed_by` |
| **canonical direction** | Source --governed_by--> Target |
| **inverse** | `governs` |

## meaning

Source liên hệ với Target theo semantic `governed_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Process --governed_by--> BusinessRule
Module --governed_by--> ModuleBoundary
```

## non-examples

```text
Target --governed_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Process --governed_by--> BusinessRule
```
