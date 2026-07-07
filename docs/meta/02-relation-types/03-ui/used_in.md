# used_in

| Field | Value |
|-------|-------|
| **name** | `used_in` |
| **canonical direction** | Source --used_in--> Target |
| **inverse** | `uses` |

## meaning

Source liên hệ với Target theo semantic `used_in`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
UIComponent --used_in--> Screen
```

## non-examples

```text
Target --used_in--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
UIComponent --used_in--> Screen
```
