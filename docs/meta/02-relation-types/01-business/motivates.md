# motivates

| Field | Value |
|-------|-------|
| **name** | `motivates` |
| **canonical direction** | Source --motivates--> Target |
| **inverse** | `none` |
| **inverse kind** | `none` |

## meaning

Source tạo động lực / lý do cho Target tồn tại.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

Không có active valid triple trong contract hiện tại của `task_transportor`.

Linkage Problem–Goal mặc định ghi `Goal --addresses--> Problem`.

## non-examples

```text
Problem --motivates--> Goal   (không còn active cho cùng linkage với addresses)
```

## anti-patterns

Không dùng `motivates` làm inverse canonical của `addresses`.
Không dual-write chỉ để đọc từ phía Problem.

## valid usage (from entity types)

Không có active valid usage.
