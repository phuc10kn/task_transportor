# stored_on

| Field | Value |
|-------|-------|
| **name** | `stored_on` |
| **canonical direction** | Source --stored_on--> Target |
| **inverse** | _(none - derive by search)_ |

## meaning

Source có điểm lưu trữ hoặc persistence point trên Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DataFlow --stored_on--> DataStore
```

## non-examples

```text
DataStore --stored_on--> DataFlow   (sai direction)
DataFlow --stored_on--> Module   (module không phải storage target)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `stored_on` để mô tả schema/table/field chi tiết.

## valid usage (from entity types)

```text
DataFlow --stored_on--> DataStore
```
