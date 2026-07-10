# contains

| Field | Value |
|-------|-------|
| **name** | `contains` |
| **canonical direction** | Source --contains--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source bao gồm Target như một phần.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Aggregate --contains--> DomainEntity
Journey --contains--> UserFlow
```

## non-examples

```text
DomainEntity --contains--> Aggregate           (sai canonical direction)
DomainEntity --member_of--> Aggregate          (không ghi inverse canonical)
```

## anti-patterns

Không dual-write `DomainEntity --member_of--> Aggregate` cho cùng fact membership.
Không dùng `part_of` làm inverse canonical của `contains`.
Reverse trace từ DomainEntity tới Aggregate được derive từ `Aggregate --contains--> DomainEntity`.

## valid usage (from entity types)

```text
Aggregate --contains--> DomainEntity
Journey --contains--> UserFlow
```
