# measured_by

| Field | Value |
|-------|-------|
| **name** | `measured_by` |
| **canonical direction** | Source --measured_by--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source lấy Target làm tiêu chí / thanh đo để đánh giá mức đạt.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Goal --measured_by--> SuccessCriterion
```

## non-examples

```text
SuccessCriterion --measured_by--> Goal   (sai canonical direction)
SuccessCriterion --validates--> Goal     (không ghi inverse canonical cho cùng success-bar fact)
Metric --measured_by--> Goal             (Metric dùng `measures`, không phải `measured_by`)
```

## anti-patterns

Không dual-write `SuccessCriterion --validates--> Goal` cho cùng fact “Goal có success bar”.
Không khai `measures` là inverse của `measured_by` — `Metric --measures--> Goal` là fact độc lập.
Reverse trace từ SuccessCriterion tới Goal được derive từ `Goal --measured_by--> SuccessCriterion`.

## valid usage (from entity types)

```text
Goal --measured_by--> SuccessCriterion
```
