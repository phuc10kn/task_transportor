# implements

| Field | Value |
|-------|-------|
| **name** | `implements` |
| **canonical direction** | Source --implements--> Target |
| **inverse** | `implemented_by` |

## meaning

Source hiện thực hóa hoặc cụ thể hóa Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Feature --implements--> Capability
```

## non-examples

```text
Target --implements--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Feature --implements--> Capability
UserFlow --implements--> UseCase
```
