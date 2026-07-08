# Journey

| Field | Value |
|-------|-------|
| **name** | Journey |
| **layer** | `03-interface` |
| **concern** | `02-experience` |
| **folder** | `journeys/` |
| **ID pattern** | `JNY-{NNN}-{slug}` |

## meaning

Trải nghiệm end-to-end ở mức rộng.

## instance criteria

Khi cần mô tả experience qua nhiều touchpoint.

## required fields

id, slug, entity_type, layer, concern, status

Body: goal, stages

## optional fields

touchpoints, user_expectations, pain_points, channels, outcomes

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
Journey → UserFlow (contains)
Journey → Persona (for_audience)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Journey rộng hơn User Flow
