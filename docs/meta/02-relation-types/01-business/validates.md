# validates

| Field | Value |
|-------|-------|
| **name** | `validates` |
| **canonical direction** | Source --validates--> Target |
| **inverse** | `none` |
| **inverse kind** | `none` |

## meaning

Source xác nhận Target đã đạt điều kiện.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

Không có active valid triple trong contract hiện tại của `task_transportor` cho Goal/SuccessCriterion.

Success bar của Goal ghi `Goal --measured_by--> SuccessCriterion`.

## non-examples

```text
SuccessCriterion --validates--> Goal   (không còn active; cùng fact với measured_by)
```

## anti-patterns

Không dùng `validates` làm inverse canonical của `measured_by` cho Goal↔SuccessCriterion.

## valid usage (from entity types)

Không có active valid usage trong business measurement graph hiện tại.
