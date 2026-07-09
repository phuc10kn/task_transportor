# StateOwner

| Field | Value |
|-------|-------|
| **name** | StateOwner |
| **layer** | `05-architecture` |
| **concern** | `04-state` |
| **folder** | `state-owners/` |
| **ID pattern** | `SO-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Khẳng định architectural ownership canonical của một state hoặc aggregate quan trọng với workflow.

## instance criteria

Dùng type này khi state là canonical, workflow-critical hoặc rất dễ bị nhầm owner trong review.

## required fields

id, slug, entity_type, layer, concern, status

Body: state_name, owner, reason

## optional fields

consumers, write_policy, consistency_notes, read_exceptions, theory_basis

## lifecycle

draft -> active -> superseded

## structure extends

Base: `entity-instance/v1`

Section bắt buộc:

- Meaning
- Why this state is central
- Owner
- Reason
- What belongs to this state
- What does not belong here
- Write policy
- Consumers
- Architectural implications
- Evidence

Section tùy chọn:

- Anti-pattern signals
- Related entities

Validation bổ sung:

- StateOwner không phải database engine owner.
- `Cis`/module owner write phải được nêu rõ.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| shared_via | `shared_via` | DataFlow | allowed_when_known | 0..n |

Relation slot hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/05-architecture/valid-triples.md`.

## validation

- StateOwner phải nêu ownership rõ.
- State owner không phải mặc định của `Cis` engine.
