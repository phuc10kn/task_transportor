# specializes

| Field | Value |
|-------|-------|
| **name** | `specializes` |
| **canonical direction** | Source --specializes--> Target |
| **inverse** | `generalized_by` |

## meaning

Source liên hệ với Target theo semantic `specializes`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DomainConcept --specializes--> GlossaryTerm
```

## non-examples

```text
Target --specializes--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
DomainConcept --specializes--> GlossaryTerm
```
