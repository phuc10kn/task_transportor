# addresses

| Field | Value |
|-------|-------|
| **name** | `addresses` |
| **canonical direction** | Source --addresses--> Target |
| **inverse** | `motivates` |

## meaning

Source nhắm tới / giải quyết vấn đề hoặc gap của Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Goal --addresses--> Problem
```

## non-examples

```text
Target --addresses--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Goal --addresses--> Problem
```
