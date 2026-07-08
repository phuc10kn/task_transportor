# implemented_by

| Field | Value |
|-------|-------|
| **name** | `implemented_by` |
| **canonical direction** | Source --implemented_by--> Target |
| **inverse** | `implements` |

## meaning

Source liên hệ với Target theo semantic `implemented_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
UseCase --implemented_by--> Feature
InteractionFlow --implemented_by--> ExecutionMechanism
```

## non-examples

```text
Target --implemented_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
UseCase --implemented_by--> Feature
```
