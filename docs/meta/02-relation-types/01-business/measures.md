# measures

| Field | Value |
|-------|-------|
| **name** | `measures` |
| **canonical direction** | Source --measures--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source là đại lượng đo định lượng gắn với Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Metric --measures--> Goal
```

## non-examples

```text
Goal --measures--> Metric                    (sai canonical direction)
Goal --measured_by--> SuccessCriterion       (fact khác; không phải inverse của measures)
```

## anti-patterns

Không dùng `measures` làm inverse của `measured_by`.
`Metric --measures--> Goal` độc lập với `Goal --measured_by--> SuccessCriterion`.

## valid usage (from entity types)

```text
Metric --measures--> Goal
```
