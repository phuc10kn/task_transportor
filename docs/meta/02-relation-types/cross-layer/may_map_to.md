# may_map_to

| Field | Value |
|-------|-------|
| **name** | `may_map_to` |
| **canonical direction** | Source --may_map_to--> Target |
| **inverse** | `may_map_from` |

## meaning

Source có thể ánh xạ sang Target (chưa chốt).

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Stakeholder --may_map_to--> Persona
```

## non-examples

```text
Target --may_map_to--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Stakeholder --may_map_to--> Persona
```
