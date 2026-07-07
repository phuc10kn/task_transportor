# verified_by

| Field | Value |
|-------|-------|
| **name** | `verified_by` |
| **canonical direction** | Source --verified_by--> Target |
| **inverse** | `verifies` |

## meaning

Source liên hệ với Target theo semantic `verified_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
FunctionalRequirement --verified_by--> AcceptanceCriterion
```

## non-examples

```text
Target --verified_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
FunctionalRequirement --verified_by--> AcceptanceCriterion
```
