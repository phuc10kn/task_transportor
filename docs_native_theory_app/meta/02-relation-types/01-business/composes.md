# composes

| Field | Value |
|-------|-------|
| **name** | `composes` |
| **canonical direction** | Source --composes--> Target |
| **inverse** | `part_of` |

## meaning

Source liên hệ với Target theo semantic `composes`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Scenario --composes--> Process
```

## non-examples

```text
Target --composes--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Scenario --composes--> Process
```
