# derived_from

| Field | Value |
|-------|-------|
| **name** | `derived_from` |
| **canonical direction** | Source --derived_from--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source được suy ra, tạo ra hoặc justified bởi Target như provenance/source của Source.

## allowed semantic

Chỉ dùng khi Source cần khai báo provenance đã chốt về Target.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
BusinessRequirement --derived_from--> Problem
```

## non-examples

```text
Target --derived_from--> Source   (sai canonical direction)
Reverse trace từ Problem tới BusinessRequirement chỉ để đọc ngược, không tạo relation canonical riêng.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không tạo inverse canonical chỉ để query từ source/provenance sang artifact được sinh ra.

## valid usage (from entity types)

```text
BusinessRequirement --derived_from--> Problem
```
