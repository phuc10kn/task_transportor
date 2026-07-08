# moves

| Field | Value |
|-------|-------|
| **name** | `moves` |
| **canonical direction** | Source --moves--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source mô tả luồng di chuyển dữ liệu liên quan tới Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DataFlow --moves--> StateOwner
```

## non-examples

```text
DataFlow --moves--> Module   (module không phải dữ liệu/state được di chuyển)
DataFlow --moves--> StateOwner   nếu câu đó hàm ý đổi owner canonical
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `moves` để nói ownership transfer. Ownership canonical vẫn phải trace bằng `Module --owns--> StateOwner` và derived inverse khi cần đọc ngược.

## valid usage (from entity types)

```text
DataFlow --moves--> StateOwner
```
