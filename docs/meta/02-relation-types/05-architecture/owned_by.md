# owned_by

| Field | Value |
|-------|-------|
| **name** | `owned_by` |
| **canonical direction** | Source --owned_by--> Target |
| **inverse** | `owns` |

## meaning

Source thuộc ownership kiến trúc của Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
StateOwner --owned_by--> Module
```

## non-examples

```text
StateOwner --owned_by--> Database   (database không phải owner kiến trúc)
StateOwner --owned_by--> RuntimeEnvironment   (runtime không quyết định ownership)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không mirror cùng một fact ở cả hai chiều trong entity instance nếu không có lý do review rõ ràng.

## valid usage (from entity types)

```text
StateOwner --owned_by--> Module
```
