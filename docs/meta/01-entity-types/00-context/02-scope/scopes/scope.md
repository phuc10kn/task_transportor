# Scope

| Field | Value |
|-------|-------|
| **name** | Scope |
| **layer** | `00-context` |
| **concern** | `02-scope` |
| **folder** | `scopes/` |
| **ID pattern** | `SCOPE-{NNN}` |
| **Instance folder pattern** | `SCOPE-{NNN}-{slug}` |

## meaning

Ranh giới phạm vi: điều gì thuộc / không thuộc scope.

## instance criteria

Khi cần document ranh giới rõ ràng (phase, release, subsystem).

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, in_scope, out_of_scope

## optional fields

time_boundary, release_reference, related_applications, theory_basis

## lifecycle

draft → active → superseded → closed

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phải có cả in-scope và out-of-scope
- Không nhầm với Product Feature scope

