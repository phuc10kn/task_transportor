# owns

| Field | Value |
|-------|-------|
| **name** | `owns` |
| **canonical direction** | Source --owns--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source giữ ownership kiến trúc đối với Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Module --owns--> StateOwner
```

## non-examples

```text
Folder --owns--> File   (file ownership vật lý không phải architecture ownership)
Team --owns--> Module   (team ownership cần relation/target riêng nếu được chốt)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `owns` thay cho `contains`, `hosts` hoặc `governed_by`.

## valid usage (from entity types)

```text
Module --owns--> StateOwner
```
