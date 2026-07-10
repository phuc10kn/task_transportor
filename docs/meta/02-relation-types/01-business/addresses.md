# addresses

| Field | Value |
|-------|-------|
| **name** | `addresses` |
| **canonical direction** | Source --addresses--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source nhắm tới / giải quyết vấn đề hoặc gap của Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Goal --addresses--> Problem
```

## non-examples

```text
Problem --addresses--> Goal          (sai canonical direction)
Problem --motivates--> Goal          (không ghi inverse canonical cho cùng linkage)
```

## anti-patterns

Không dual-write `Problem --motivates--> Goal` cho cùng fact Problem–Goal linkage.
Reverse trace từ Problem tới Goal được derive từ `Goal --addresses--> Problem`.
Chỉ xem xét `motivates` như fact độc lập khi có evidence Problem P1 motivate Goal nhưng Goal address Problem P2 khác.

## valid usage (from entity types)

```text
Goal --addresses--> Problem
```
