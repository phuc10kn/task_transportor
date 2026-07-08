# affects

| Field | Value |
|-------|-------|
| **name** | `affects` |
| **canonical direction** | Source --affects--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source có ảnh hưởng lên Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Problem --affects--> Stakeholder
```

## non-examples

```text
Target --affects--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Problem --affects--> Stakeholder
Assumption --affects--> entities
CrossCuttingRule --affects--> Module
```
