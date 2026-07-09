# has_scope

| Field | Value |
|-------|-------|
| **name** | `has_scope` |
| **canonical direction** | Source --has_scope--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source có một Scope document mô tả ranh giới in-scope/out-of-scope của Source.

Relation này thể hiện ownership/container của Source đối với Scope document.
Nó không có nghĩa Scope tác động, ràng buộc hoặc govern Source.

## allowed semantic

Chỉ dùng khi Source là entity sở hữu phạm vi và Target là Scope document mô tả boundary của Source.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Application --has_scope--> Scope
```

## non-examples

```text
Scope --has_scope--> Application   (sai canonical direction)
Quan hệ ngược từ Scope về Application chỉ để đọc ngược là mirror passive.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không tạo inverse canonical chỉ để query từ Scope về Source.

## valid usage (from entity types)

```text
Application --has_scope--> Scope
```
