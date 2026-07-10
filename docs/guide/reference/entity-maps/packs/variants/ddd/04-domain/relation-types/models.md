# models

| Field | Value |
|-------|-------|
| **name** | `models` |
| **canonical direction** | Source --models--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `models`.

## allowed semantic

Chỉ dùng khi combination có trong [valid-triples](../valid-triples.md).

## examples

```text
DomainConcept --models--> DomainEntity
```

## non-examples

```text
Target --models--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
DomainConcept --models--> DomainEntity
```
