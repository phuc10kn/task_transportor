# maps_from

| Field | Value |
|-------|-------|
| **name** | `maps_from` |
| **canonical direction** | Source --maps_from--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source được ánh xạ từ Target.

## allowed semantic

Chỉ dùng khi Source cần khai báo grounding/provenance đã chốt về Target.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Persona --maps_from--> Stakeholder
```

## non-examples

```text
Stakeholder --maps_from--> Persona   (sai canonical direction)
Reverse trace từ Stakeholder tới Persona chỉ để đọc ngược, không tạo relation canonical riêng.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không tạo inverse canonical chỉ để query từ Stakeholder sang Persona.

## valid usage (from entity types)

```text
Persona --maps_from--> Stakeholder
```
