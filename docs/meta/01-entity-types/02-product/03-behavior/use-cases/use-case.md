# UseCase

| Field | Value |
|-------|-------|
| **name** | UseCase |
| **layer** | `02-product` |
| **concern** | `03-behavior` |
| **folder** | `use-cases/` |
| **ID pattern** | `UC-{NNN}` |
| **Instance folder pattern** | `UC-{NNN}-{slug}` |

## meaning

Cách actor tương tác với Product để đạt mục tiêu.

## instance criteria

Khi cần document product behavior ở mức actor-goal.

## required fields

id, slug, entity_type, layer, concern, status

Body: actor, goal, main_flow

## optional fields

preconditions, trigger, alternative_flows, exceptions, postconditions, related_capabilities

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| uses | `uses` | Capability | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

Trace Feature/UserFlow cover UseCase bằng reverse query từ fact gốc `implements` (ví dụ `UserFlow --implements--> UseCase`). Không dùng `UseCase --implemented_by--> Feature` như inverse của `implements`.

## validation

- Không mô tả UI detail (button color, position)


