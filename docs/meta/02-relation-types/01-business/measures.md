# measures

| Field | Value |
|-------|-------|
| **name** | `measures` |
| **canonical direction** | Source --measures--> Target |
| **inverse** | `measured_by` |

## meaning

Source liên hệ với Target theo semantic `measures`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Metric --measures--> Goal
```

## non-examples

```text
Target --measures--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Metric --measures--> Goal
```
