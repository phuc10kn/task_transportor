# applies_to

| Field | Value |
|-------|-------|
| **name** | `applies_to` |
| **canonical direction** | Source --applies_to--> Target |
| **inverse** | `has_scope` |

## meaning

Source áp dụng cho Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Invariant --applies_to--> DomainEntity
```

## non-examples

```text
Target --applies_to--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Invariant --applies_to--> DomainEntity
BusinessRule --applies_to--> Process
Scope --applies_to--> Application
AccessibilityRequirement --applies_to--> Screen
```
