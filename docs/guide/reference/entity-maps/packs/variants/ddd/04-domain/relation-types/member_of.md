# member_of

| Field | Value |
|-------|-------|
| **name** | `member_of` |
| **canonical direction** | Source --member_of--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `member_of`.

## allowed semantic

Chỉ dùng khi combination có trong [valid-triples](../valid-triples.md).

## examples

```text
DomainEntity --member_of--> Aggregate
```

## non-examples

```text
Target --member_of--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
DomainEntity --member_of--> Aggregate
```
