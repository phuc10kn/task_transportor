# governs

| Field | Value |
|-------|-------|
| **name** | `governs` |
| **canonical direction** | Source --governs--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source đặt rule, policy, standard hoặc governing pattern mà Target phải tuân thủ.

## allowed semantic

Chỉ dùng khi Source có authority hoặc rule chi phối hành vi, cấu trúc hoặc cách Target được thực hiện.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
BusinessRule --governs--> Process
DesignSystem --governs--> UIComponent
```

## non-examples

```text
Process --governs--> BusinessRule   (sai canonical direction)
Process --governed_by--> BusinessRule (KHÔNG DÙNG: mirror passive của BusinessRule --governs--> Process)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `governs` cho relation liên quan mơ hồ hoặc chỉ cùng phạm vi.
Không tạo inverse canonical chỉ để query từ Target về Source.

## valid usage (from entity types)

```text
BusinessRule --governs--> Process
DesignSystem --governs--> UIComponent
```
