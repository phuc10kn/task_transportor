# depends_on

| Field | Value |
|-------|-------|
| **name** | `depends_on` |
| **canonical direction** | Source --depends_on--> Target |
| **inverse** | `depended_on_by` |

## meaning

Source phụ thuộc vào Target để tồn tại hoặc hoạt động đúng.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Module --depends_on--> Module
```

## non-examples

```text
Target --depends_on--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng cho business causality (dùng leads_to, motivates).
