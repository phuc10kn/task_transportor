# may_refine_to

| Field | Value |
|-------|-------|
| **name** | `may_refine_to` |
| **canonical direction** | Source --may_refine_to--> Target |
| **inverse** | `may_be_refined_by` |

## meaning

Source liên hệ với Target theo semantic `may_refine_to`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
BusinessRule --may_refine_to--> Invariant
```

## non-examples

```text
Target --may_refine_to--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
BusinessRule --may_refine_to--> Invariant
```
