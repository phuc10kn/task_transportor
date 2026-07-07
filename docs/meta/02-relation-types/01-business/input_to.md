# input_to

| Field | Value |
|-------|-------|
| **name** | `input_to` |
| **canonical direction** | Source --input_to--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `input_to`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Metric --input_to--> SuccessCriterion
```

## non-examples

```text
Target --input_to--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Metric --input_to--> SuccessCriterion
```
