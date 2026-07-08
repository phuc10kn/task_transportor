# ContextConstraint

| Field | Value |
|-------|-------|
| **name** | ContextConstraint |
| **layer** | `00-context` |
| **concern** | `03-premises` |
| **folder** | `constraints/` |
| **ID pattern** | `CON-{NNN}-{slug}` |

## meaning

Giới hạn toàn project mà project phải tuân thủ.

## instance criteria

Khi constraint áp dụng cross-layer.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, source, scope, strength

## optional fields

affected_layers, affected_entities, exceptions, theory_basis

## lifecycle

active → relaxed | retired

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| constrains | `constrains` | layers/entities | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Assumption, ContextConstraint, BusinessConstraint
