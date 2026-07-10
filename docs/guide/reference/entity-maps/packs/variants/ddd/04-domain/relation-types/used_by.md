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

Chỉ dùng khi combination có trong [valid-triples](../valid-triples.md).

## examples

Không có active valid triple trong DDD pack hiện tại.

Domain usage ghi `DomainEntity --uses--> ValueObject`.

## non-examples

```text
ValueObject --used_by--> DomainEntity   (không còn active; cùng fact với uses)
```

## anti-patterns

Không dùng `used_by` làm inverse canonical của `uses`.

## valid usage (from entity types)

Không có active valid usage.
