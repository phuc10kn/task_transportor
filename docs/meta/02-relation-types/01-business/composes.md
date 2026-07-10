# composes

| Field | Value |
|-------|-------|
| **name** | `composes` |
| **canonical direction** | Source --composes--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source kết hợp Target như thành phần trong một composition end-to-end.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Scenario --composes--> Process
```

## non-examples

```text
Process --composes--> Scenario   (sai canonical direction)
Process --part_of--> Scenario    (không ghi inverse canonical)
```

## anti-patterns

Không dual-write `Process --part_of--> Scenario` cho cùng fact composition.
Reverse trace từ Process tới Scenario được derive từ `Scenario --composes--> Process`.

## valid usage (from entity types)

```text
Scenario --composes--> Process
```
