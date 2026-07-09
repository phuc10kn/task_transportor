# governed_by

| Field | Value |
|-------|-------|
| **name** | `governed_by` |
| **canonical direction** | Source --governed_by--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source bị chi phối bởi Target trong một context đã có valid triple riêng.

## allowed semantic

Chỉ dùng cho legacy hoặc layer-specific case đã được chốt bằng valid triple.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Module --governed_by--> ModuleBoundary
```

## non-examples

```text
Process --governed_by--> BusinessRule (KHÔNG DÙNG: business governance dùng BusinessRule --governs--> Process)
Target --governed_by--> Source   (sai canonical direction nếu valid triple đã chốt chiều khác)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `governed_by` làm inverse canonical chỉ để đọc ngược từ target.
Không dùng cho business process governance mới; dùng `BusinessRule --governs--> Process`.

## valid usage (from entity types)

```text
Module --governed_by--> ModuleBoundary
```
