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

Chỉ dùng cho case có semantic governance độc lập đã được chốt bằng valid triple.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

Không có triple `Module --governed_by--> ModuleBoundary` active trong `task_transportor`; architecture dùng `ModuleBoundary --constrains--> Module`.

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

Không có active valid triple trong contract hiện tại của `task_transportor`.
