# refined_from

| Field | Value |
|-------|-------|
| **name** | `refined_from` |
| **canonical direction** | Source --refined_from--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source là bản tinh chỉnh domain của Target.

## allowed semantic

Chỉ dùng khi Source cần khai báo provenance đã chốt rằng nó được refine từ Target.

Chỉ dùng khi combination có trong [valid-triples](../../valid-triples.md).

## examples

```text
Invariant --refined_from--> BusinessRule
```

## non-examples

```text
BusinessRule --refined_from--> Invariant   (sai canonical direction)
Reverse trace từ BusinessRule tới Invariant chỉ để đọc ngược, không tạo relation canonical riêng.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không tạo inverse canonical chỉ để query từ BusinessRule sang Invariant.

## valid usage (from entity types)

```text
Invariant --refined_from--> BusinessRule
```
