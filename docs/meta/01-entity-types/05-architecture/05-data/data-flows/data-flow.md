# DataFlow

| Field | Value |
|-------|-------|
| **name** | DataFlow |
| **layer** | `05-architecture` |
| **concern** | `05-data` |
| **folder** | `data-flows/` |
| **ID pattern** | `DF-{NNN}` |
| **Instance folder pattern** | `DF-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Luồng di chuyển hoặc chia sẻ dữ liệu qua các boundary của app.

## instance criteria

Dùng type này khi dữ liệu đi qua module, runtime hoặc external system với ownership và purpose rõ ràng.

## required fields

id, slug, entity_type, layer, concern, status

Body: source, destination, data_meaning

## optional fields

canonical_status, transformation, ownership_notes, sensitivity, theory_basis

## lifecycle

planned -> active -> retired

## structure extends

Base: `entity-instance/v1`

Section bắt buộc:

- Meaning
- Architectural role
- Why this flow exists
- Source / destination
- Data path
- Transformation
- Boundary and ownership
- What changes and what does not
- Read / write tiers involved
- Anti-patterns avoided
- Evidence
- Related entities

Section tùy chọn:

- Architectural payoff
- Failure and retry notes

Validation bổ sung:

- DataFlow không được biến thành payload schema chi tiết implementation.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| moves | `moves` | StateOwner | allowed_when_known | 0..n |

Relation slot hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/05-architecture/valid-triples.md`.

## validation

- DataFlow không mô tả chi tiết schema field implementation.
- Luồng phải chỉ ra boundary chuyển owner hoặc lý do không chuyển owner.
