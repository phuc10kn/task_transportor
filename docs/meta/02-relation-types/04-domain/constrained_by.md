# constrained_by

| Field | Value |
|-------|-------|
| **name** | `constrained_by` |
| **canonical direction** | Source --constrained_by--> Target |
| **inverse** | `constrains` |

## meaning

Source liên hệ với Target theo semantic `constrained_by`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
ValueObject --constrained_by--> Invariant
```

## non-examples

```text
Target --constrained_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
ValueObject --constrained_by--> Invariant
DomainEntity --constrained_by--> Invariant
```
