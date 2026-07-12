# Application

| Field | Value |
|-------|-------|
| **name** | Application |
| **layer** | `00-context` |
| **concern** | `01-overview` |
| **folder** | `applications/` |
| **ID pattern** | `APP-{NNN}` |
| **Instance folder pattern** | `APP-{NNN}-{slug}` |

## meaning

Bức tranh tổng quan của một ứng dụng hoặc sub-application. Trả lời: ứng dụng là gì, ai dùng, giá trị chính, phạm vi high-level.

## instance criteria

Khi project có application boundary rõ cần document riêng.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, purpose, primary_users, main_value, high_level_scope

## optional fields

major_parts, lifecycle_stage, theory_basis, decision_basis

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| has_scope | `has_scope` | Scope | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không thay thế Business Goal, Product Requirement hay Architecture Overview
- Không chứa implementation detail


