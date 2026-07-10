# CrossCuttingRule

| Field | Value |
|-------|-------|
| **name** | CrossCuttingRule |
| **layer** | `05-architecture` |
| **concern** | `07-cross-cutting` |
| **folder** | `cross-cutting-rules/` |
| **ID pattern** | `CCR-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Luật kiến trúc áp dụng xuyên nhiều module và/hoặc concern, đồng thời ràng buộc cách hệ thống được tiến hóa.

## instance criteria

Dùng type này khi một rule bao phủ nhiều unit một cách nhất quán và ảnh hưởng cross-component behavior như auth, audit, observability hoặc ownership discipline.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope, purpose

## optional fields

affected_units, enforcement_points, quality_impact, theory_basis, decision_basis

## lifecycle

draft -> active -> superseded

## structure extends

Base: `entity-instance/v1`

Section bắt buộc:

- Meaning
- Why this rule exists
- Statement
- Scope
- Design consequences
- Review questions this rule forces
- Anti-patterns avoided
- Evidence

Section tùy chọn:

- Related entities
- Anti-pattern signals

Validation bổ sung:

- Rule phải actionable và có phạm vi áp dụng rõ.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| constrains | `constrains` | Module | allowed_when_known | 0..n |
| constrains_state_owner | `constrains` | StateOwner | allowed_when_known | 0..n |

Relation slot hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/05-architecture/valid-triples.md`.

## validation

- Rule phải không chung chung, có thể kiểm chứng bằng việc hỏi một câu duy nhất.
- Rule phải có evidence hoặc source-of-truth rõ.
