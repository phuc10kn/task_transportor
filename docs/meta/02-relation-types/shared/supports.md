# supports

| Field | Value |
|-------|-------|
| **name** | `supports` |
| **canonical direction** | Source --supports--> Target |
| **inverse** | `supported_by` |

## meaning

Source liên hệ với Target theo semantic `supports`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Capability --supports--> BusinessRequirement
```

## non-examples

```text
Target --supports--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Capability --supports--> BusinessRequirement
Screen --supports--> Feature
CrossCuttingRule --supports--> QualityObjective
```
