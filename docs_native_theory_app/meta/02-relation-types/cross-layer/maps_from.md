# maps_from

| Field | Value |
|-------|-------|
| **name** | `maps_from` |
| **canonical direction** | Source --maps_from--> Target |
| **inverse** | `maps_to` |

## meaning

Source được ánh xạ từ Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Persona --maps_from--> Stakeholder
```

## non-examples

```text
Target --maps_from--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Persona --maps_from--> Stakeholder
```
