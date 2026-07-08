# crosses

| Field | Value |
|-------|-------|
| **name** | `crosses` |
| **canonical direction** | Source --crosses--> Target |
| **inverse** | _(none - derive by search)_ |

## meaning

Source đi qua Target như một boundary/interface kiến trúc.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DataFlow --crosses--> Interface
```

## non-examples

```text
Interface --crosses--> DataFlow   (sai direction)
DataFlow --crosses--> StateOwner   (state owner không phải crossing boundary)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `crosses` thay cho `uses` nếu chỉ muốn nói consumer gọi interface.

## valid usage (from entity types)

```text
DataFlow --crosses--> Interface
```
