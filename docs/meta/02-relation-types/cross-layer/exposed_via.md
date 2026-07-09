# exposed_via

| Field | Value |
|-------|-------|
| **name** | `exposed_via` |
| **canonical direction** | Source --exposed_via--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source được expose hoặc surface tới người dùng thông qua Target.

## allowed semantic

Chỉ dùng khi Source cần khai báo bề mặt hiển thị/tương tác đã chốt qua Target.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Feature --exposed_via--> Screen
```

## non-examples

```text
Screen --exposed_via--> Feature   (sai canonical direction)
Reverse trace từ Screen tới Feature chỉ để đọc ngược, không tạo relation canonical riêng.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không tạo inverse canonical chỉ để query từ Screen sang Feature.

## valid usage (from entity types)

```text
Feature --exposed_via--> Screen
```
