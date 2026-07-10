# used_by

| Field | Value |
|-------|-------|
| **name** | `used_by` |
| **canonical direction** | Source --used_by--> Target |
| **inverse** | `none` |
| **inverse kind** | `none` |

## meaning

Source được Target sử dụng.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

Không có active valid triple trong contract hiện tại của `task_transportor` cho ValueObject/DomainEntity.

Domain usage ghi `DomainEntity --uses--> ValueObject`.

## non-examples

```text
ValueObject --used_by--> DomainEntity   (không còn active; cùng fact với uses)
```

## anti-patterns

Không dùng `used_by` làm inverse canonical của `uses`.
Không gắn `used_by` với product relation `uses` như paired inverse.

## valid usage (from entity types)

Không có active valid usage trong domain model hiện tại.
