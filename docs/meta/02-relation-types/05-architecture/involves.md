# involves

| Field | Value |
|-------|-------|
| **name** | `involves` |
| **canonical direction** | Source --involves--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source bao hàm Target như một participant kiến trúc trong flow hoặc coordination.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
InteractionFlow --involves--> Module
```

## non-examples

```text
Module --involves--> InteractionFlow   (sai canonical direction)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `involves` cho mọi liên hệ mơ hồ; chỉ dùng khi Target là participant thật của Source.
Không ghi `Module --participates_in--> InteractionFlow` như inverse canonical; reverse trace được derive từ `InteractionFlow --involves--> Module`.

## valid usage (from entity types)

```text
InteractionFlow --involves--> Module
```
