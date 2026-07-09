# ModuleBoundary

| Field | Value |
|-------|-------|
| **name** | ModuleBoundary |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `module-boundaries/` |
| **ID pattern** | `MB-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Boundary contract ràng buộc module ownership, read/write model và cross-module access.

## instance criteria

Dùng type này khi một boundary thay đổi ownership, dependency policy hoặc data access của nhiều phần trong app.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope, protected_assets

## optional fields

allowed_dependencies, forbidden_dependencies, read_exceptions, write_policy, theory_basis, decision_basis

## lifecycle

draft -> active -> superseded

## structure extends

Base: `entity-instance/v1`

Section bắt buộc:

- Meaning
- Why this boundary matters
- Statement
- Protected assets
- Allowed / forbidden
- Architectural consequences
- Related entities
- Evidence

Section tùy chọn:

- Typical violations this boundary prevents
- Anti-pattern signals

Validation bổ sung:

- Boundary phải nói rõ điều gì được phép và điều gì bị cấm.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| constrains | `constrains` | Module | allowed_when_known | 0..n |
| constrains_state_owner | `constrains` | StateOwner | allowed_when_known | 0..n |

Relation slot hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/05-architecture/valid-triples.md`.

## validation

- Boundary phải làm rõ gì bị cấm hoặc được phép.
- Boundary không được mô tả chi tiết code import path.
