# Scope

| Field | Value |
|-------|-------|
| **name** | Scope |
| **layer** | `00-context` |
| **concern** | `02-scope` |
| **folder** | `scopes/` |
| **ID pattern** | `SCOPE-{NNN}-{slug}` |

## meaning

Ranh giới phạm vi: điều gì thuộc / không thuộc scope.

## instance criteria

Khi cần document ranh giới rõ ràng (phase, release, subsystem).

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, in_scope, out_of_scope, applies_to

## optional fields

time_boundary, release_reference, related_applications, theory_basis

## lifecycle

draft → active → superseded → closed

## allowed relations (candidate)

```text
Scope → Application (applies_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phải có cả in-scope và out-of-scope
- Không nhầm với Product Feature scope
