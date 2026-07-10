# part_of

| Field | Value |
|-------|-------|
| **name** | `part_of` |
| **canonical direction** | Source --part_of--> Target |
| **inverse** | `none` |
| **inverse kind** | `none` |

## meaning

Source là thành phần của Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

Không có active valid triple trong contract hiện tại của `task_transportor`.

Composition Scenario→Process dùng `Scenario --composes--> Process`.

## non-examples

```text
Process --part_of--> Scenario   (không còn active; cùng fact với composes)
```

## anti-patterns

Không dùng `part_of` làm inverse canonical của `composes` hoặc `contains`.
Không ghi `Process --part_of--> Scenario` để đọc ngược composition.

## valid usage (from entity types)

Không có active valid usage.
