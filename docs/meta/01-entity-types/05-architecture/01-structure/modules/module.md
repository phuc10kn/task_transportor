# Module

| Field | Value |
|-------|-------|
| **name** | Module |
| **layer** | `05-architecture` |
| **concern** | `01-structure` |
| **folder** | `modules/` |
| **ID pattern** | `MOD-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Đơn vị kiến trúc sở hữu một business capability và có trách nhiệm rõ trong kiến trúc Lite.

## instance criteria

Dùng type này khi app có một đơn vị với ownership ổn định, kỳ vọng public boundary rõ và hành vi cần trace dài hạn.

## required fields

id, slug, entity_type, layer, concern, status

Body: responsibility, owner

## optional fields

public_surface, owned_state, inbound_dependencies, outbound_dependencies, theory_basis, decision_basis

## lifecycle

proposed -> active -> deprecated

## structure extends

Base: `entity-instance/v1`

Section bắt buộc:

- Meaning
- Responsibility
- Key properties
- Rules / constraints
- Related entities
- Evidence

Section tùy chọn:

- Anti-pattern signals
- Questions a good instance should answer

Validation bổ sung:

- Module phải mô tả ownership, không chỉ mô tả repository structure.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| owns | `owns` | StateOwner | allowed_when_known | 0..n |

Relation slot hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/05-architecture/valid-triples.md`.

## validation

- Module không được chỉ mô tả folder tree mà không giải thích ownership.
- Module không thể biến thành canonical schema cho API hay payload.
