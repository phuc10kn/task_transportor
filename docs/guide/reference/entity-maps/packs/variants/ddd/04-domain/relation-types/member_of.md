# member_of

| Field | Value |
|-------|-------|
| **name** | `member_of` |
| **canonical direction** | Source --member_of--> Target |
| **inverse** | `none` |
| **inverse kind** | `none` |

## meaning

Source là thành viên của Target.

## allowed semantic

Chỉ dùng khi combination có trong [valid-triples](../valid-triples.md).

## examples

Không có active valid triple trong DDD pack hiện tại.

Aggregate membership ghi `Aggregate --contains--> DomainEntity`.

## non-examples

```text
DomainEntity --member_of--> Aggregate   (không còn active; cùng fact với contains)
```

## anti-patterns

Không dùng `member_of` làm inverse canonical của `contains`.

## valid usage (from entity types)

Không có active valid usage.
