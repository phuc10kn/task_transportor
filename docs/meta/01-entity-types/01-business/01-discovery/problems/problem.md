# Problem

| Field | Value |
|-------|-------|
| **name** | Problem |
| **layer** | `01-business` |
| **concern** | `01-discovery` |
| **folder** | `problems/` |
| **ID pattern** | `PROB-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Vấn đề business cần hiểu trước khi xác định solution.

## instance criteria

Khi business pain đã được xác định hoặc cần validate.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Statement, Affected Stakeholders, Current Impact, Relations, Validation Notes

## optional fields

evidence, known_causes, frequency, severity, related_processes, theory_basis

## lifecycle

identified → validated → addressed → closed

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Statement`
- `Affected Stakeholders`
- `Current Impact`

Optional sections:

- `Evidence`
- `Known Causes`
- `Frequency`
- `Severity`

Additional validation:

- Không viết problem như feature request hoặc solution thiếu.
- Nếu chưa có evidence, ghi `NOTE-EVIDENCE`.

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| affects | `affects` | Stakeholder | allowed_when_known | 0..n |

Không có slot `motivates`. Linkage Problem–Goal ghi từ `Goal --addresses--> Problem`.

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Mô tả business pain, không viết 'hệ thống chưa có X'
- Cần evidence hoặc NOTE-EVIDENCE nếu chưa có

