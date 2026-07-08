# EvolutionPlan

| Field | Value |
|-------|-------|
| **name** | EvolutionPlan |
| **layer** | `07-implementation` |
| **concern** | `06-evolution` |
| **folder** | `evolution-plans/` |
| **ID pattern** | `IMPL-EVO-{NNN}-{slug}` |

## meaning

Kế hoạch thay đổi implementation, data hoặc compatibility theo cách có kiểm soát.

## instance criteria

Khi thay đổi có nhiều bước, có backfill, migration hoặc compatibility window.

## required fields

id, slug, entity_type, layer, concern, status

Body: change_goal, steps, safety_measures

## optional fields

rollback, compatibility_window, affected_entities, verification

## lifecycle

planned -> in-progress -> completed

## allowed relations (candidate)

```text
EvolutionPlan -> DataAccessComponent (changes)
EvolutionPlan -> DeploymentRunbook (rolled_out_by)
EvolutionPlan -> ReleaseGate (gated_by)
```

## validation

- Không dùng cho backlog chung không có plan kỹ thuật rõ
