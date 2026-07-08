# shared_via

| Field | Value |
|-------|-------|
| **name** | `shared_via` |
| **canonical direction** | Source --shared_via--> Target |
| **inverse** | _(none - derive by search)_ |

## meaning

Source được chia sẻ hoặc expose qua Target mà không đổi ownership canonical.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
StateOwner --shared_via--> DataFlow
```

## non-examples

```text
StateOwner --shared_via--> Module   (module ownership dùng owns/owned_by)
DataFlow --shared_via--> StateOwner   (sai direction)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `shared_via` để hợp thức hóa shared ownership hoặc cross-module write.

## valid usage (from entity types)

```text
StateOwner --shared_via--> DataFlow
```
