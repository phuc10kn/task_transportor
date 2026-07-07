# measured_by

| Field | Value |
|-------|-------|
| **name** | `measured_by` |
| **canonical direction** | Source --measured_by--> Target |
| **inverse** | `measures` |

## meaning

Source liên hệ với Target theo semantic `measured_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Goal --measured_by--> SuccessCriterion
```

## non-examples

```text
Target --measured_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Goal --measured_by--> SuccessCriterion
```
