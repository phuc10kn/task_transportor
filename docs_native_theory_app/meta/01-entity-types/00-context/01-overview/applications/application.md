# Application

| Field | Value |
|-------|-------|
| **name** | Application |
| **layer** | `00-context` |
| **concern** | `01-overview` |
| **folder** | `applications/` |
| **ID pattern** | `APP-{NNN}-{slug}` |

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

## allowed relations (candidate)

```text
Application → Scope (has_scope)
Application → Environment (runs_in)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không thay thế Business Goal, Product Requirement hay Architecture Overview
- Không chứa implementation detail
