# uses

| Field | Value |
|-------|-------|
| **name** | `uses` |
| **canonical direction** | Source --uses--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source (consumer) sử dụng Target (consumed value).

## allowed semantic

Chỉ dùng khi combination có trong [valid-triples](../valid-triples.md).

## examples

```text
DomainEntity --uses--> ValueObject
```

## non-examples

```text
ValueObject --uses--> DomainEntity           (sai canonical direction)
ValueObject --used_by--> DomainEntity        (không ghi inverse canonical)
```

## anti-patterns

Không dual-write `ValueObject --used_by--> DomainEntity` cho cùng fact usage.

## valid usage (from entity types)

```text
DomainEntity --uses--> ValueObject
```
