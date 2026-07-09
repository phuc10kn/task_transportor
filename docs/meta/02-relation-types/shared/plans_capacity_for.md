# plans_capacity_for

| Field | Value |
|-------|-------|
| **name** | `plans_capacity_for` |
| **canonical direction** | Source --plans_capacity_for--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source lập kế hoạch năng lực, limit, growth, threshold hoặc scaling strategy cho Target.

## allowed semantic

Chỉ dùng khi Source là capacity plan hoặc planning artifact và Target là runtime/resource cần được lập kế hoạch năng lực.

Chỉ dùng ở entity instance khi combination có trong [03-rules/](../../03-rules/). App variant candidate phải được canonical hóa trước khi trở thành valid usage.

## examples

```text
CapacityPlan --plans_capacity_for--> RuntimeEnvironment
```

## non-examples

```text
RuntimeEnvironment --plans_capacity_for--> CapacityPlan   (sai canonical direction)
CapacityPlan --plans_capacity_for--> RuntimeEnvironment   (sai nếu chỉ ghi snapshot usage, không có planning intent)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `plans_capacity_for` cho monitoring, deployment hoặc incident relation.
Không dùng relation này khi Source chỉ là metric/signal hiện trạng.
Không tạo inverse canonical chỉ để query từ RuntimeEnvironment về CapacityPlan.

## valid usage (from entity types)

```text
No active meta valid usage.
Candidate only: CapacityPlan --plans_capacity_for--> RuntimeEnvironment
```
