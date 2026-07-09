# InteractionFlow

| Field | Value |
|-------|-------|
| **name** | InteractionFlow |
| **layer** | `05-architecture` |
| **concern** | `03-interactions` |
| **folder** | `interaction-flows/` |
| **ID pattern** | `AF-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Luồng ở mức kiến trúc nối giữa module, external system hoặc deployment unit.

## instance criteria

Dùng type này khi flow là đường đi chính của capability, integration hoặc critical side effect.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, path, outcome

## optional fields

participants, sync_mode, failure_points, owner_modules, theory_basis

## lifecycle

planned -> active -> changed

## structure extends

Base: `entity-instance/v1`

Section bắt buộc:

- Meaning
- Architectural role
- Trigger
- Path
- Outcome
- Boundaries respected
- Anti-patterns avoided
- Related entities
- Evidence

Section tùy chọn:

- Architectural payoff
- Failure and retry notes
- Why this flow exists

Validation bổ sung:

- Không nhét controller hoặc code-level detail vào type instance này.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| involves | `involves` | Module | allowed_when_known | 0..n |

Relation slot hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/05-architecture/valid-triples.md`.

## validation

- Không mô tả chi tiết payload hay schema implementation.
- Flow phải có trigger, path, và outcome rõ ràng.
