# specializes

| Field | Value |
|-------|-------|
| **name** | `specializes` |
| **canonical direction** | Source --specializes--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source là khái niệm chuyên biệt hơn Target.

## allowed semantic

Chỉ dùng khi Source cần khai báo quan hệ chuyên biệt hóa đã chốt với Target.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DomainConcept --specializes--> GlossaryTerm
```

## non-examples

```text
GlossaryTerm --specializes--> DomainConcept   (sai canonical direction)
Reverse trace từ GlossaryTerm tới DomainConcept chỉ để đọc ngược, không tạo relation canonical riêng.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không tạo inverse canonical chỉ để query từ GlossaryTerm sang DomainConcept.

## valid usage (from entity types)

```text
DomainConcept --specializes--> GlossaryTerm
```
