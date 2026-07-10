# raised_by

| Field | Value |
|-------|-------|
| **name** | `raised_by` |
| **canonical direction** | Source --raised_by--> Target |
| **inverse** | `raises` |

## meaning

Source liên hệ với Target theo semantic `raised_by`.

## allowed semantic

Chỉ dùng khi combination có trong [valid-triples](../valid-triples.md).

## examples

```text
DomainEvent --raised_by--> Aggregate
```

## non-examples

```text
Target --raised_by--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
DomainEvent --raised_by--> Aggregate
```
