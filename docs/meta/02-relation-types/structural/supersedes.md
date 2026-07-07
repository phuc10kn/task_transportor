# supersedes

| Field | Value |
|-------|-------|
| **name** | `supersedes` |
| **canonical direction** | Source --supersedes--> Target |
| **inverse** | `superseded_by` |

## meaning

Source thay thế Target; Target không còn canonical.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Decision --supersedes--> Decision
```

## non-examples

```text
Target --supersedes--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không nhầm với Git history — supersedes là semantic knowledge.
