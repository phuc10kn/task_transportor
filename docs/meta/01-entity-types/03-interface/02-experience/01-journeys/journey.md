# Journey

| Field | Value |
|-------|-------|
| **name** | Journey |
| **layer** | `03-interface` |
| **concern** | `02-experience` |
| **folder** | `journeys/` |
| **ID pattern** | `JNY-{NNN}` |
| **Instance folder pattern** | `JNY-{NNN}-{slug}` |

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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| contains | `contains` | UserFlow | allowed_when_known | 0..n |
| for_audience | `for_audience` | Persona | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Journey rộng hơn User Flow


