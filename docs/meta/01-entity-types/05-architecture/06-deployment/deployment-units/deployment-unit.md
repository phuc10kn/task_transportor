# DeploymentUnit

| Field | Value |
|-------|-------|
| **name** | DeploymentUnit |
| **layer** | `05-architecture` |
| **concern** | `06-deployment` |
| **folder** | `deployment-units/` |
| **ID pattern** | `DU-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Runtime component được deploy hoặc vận hành như một topology unit tương đối tách biệt.

## instance criteria

Dùng type này khi runtime topology của app cần deployment mapping rõ ràng như web app, worker, scheduler hoặc storage runtime.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, runtime_role, boundaries

## optional fields

hosted_modules, dependencies, scaling_notes, failure_impact

## lifecycle

planned -> active -> deprecated

## structure extends

Base: `entity-instance/v1`

Section bắt buộc:

- Meaning
- Runtime role
- Why this unit matters
- Hosted modules
- Boundary notes
- Operational implications
- Evidence

Section tùy chọn:

- Evolution notes
- Anti-pattern signals

Validation bổ sung:

- DeploymentUnit không mô tả kỹ thuật vận hành chi tiết.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| hosts | `hosts` | Module | allowed_when_known | 0..n |

Relation slot hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/05-architecture/valid-triples.md`.

## validation

- DeploymentUnit phải mô tả ranh giới vận hành/chức năng rõ.
- Không dùng file này để nêu số liệu production instance.
