# governs

| Field | Value |
|-------|-------|
| **name** | `governs` |
| **canonical direction** | Source --governs--> Target |
| **inverse** | `governed_by` |

## meaning

Source kiểm soát rule hoặc pattern của Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DesignSystem --governs--> UIComponent
```

## non-examples

```text
Target --governs--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
DesignSystem --governs--> UIComponent
```
