# Entity Instance Schema

Schema này áp dụng cho entity instance trong `docs/app/**/<ID-slug>/README.md`.

Unit template: [entity](../../guide/unit-structure/entity/README.md).

## Frontmatter

File mới hoặc file được sửa sau khi schema này có hiệu lực phải có YAML frontmatter.

```yaml
---
schema: entity-instance/v1
id: PROC-001
slug: backlog-to-cis-lite
title: Backlog To CIS Lite Flow
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Business flow Lite từ Backlog vào CIS.
theory_basis:
  - TH-HUBFLOW
decision_basis:
  - DEC-001
relations:
  - type: governed_by
    target: BRULE-001
---
```

## Required Fields

| Field | Rule |
| --- | --- |
| `schema` | `entity-instance/v1` cho file mới hoặc file được sửa. |
| `id` | ID theo pattern của entity type. |
| `slug` | Slug folder/file, lowercase kebab-case. |
| `title` | Tên người đọc thấy. |
| `entity_type` | Phải resolve được tới entity type definition trong `docs/meta/01-entity-types/` hoặc layer-local type definition ở `docs/app/05+`. |
| `layer` | Layer chứa instance, ví dụ `01-business`. |
| `concern` | Concern chứa instance, ví dụ `04-behavior`. |
| `status` | Theo `docs/meta/04-conventions/status-vocabulary.md`. |
| `summary` | Một câu nêu meaning của instance. |

## Optional Fields

| Field | Rule |
| --- | --- |
| `theory_basis` | Danh sách theory ID khi instance dựa vào theory. |
| `decision_basis` | Danh sách decision ID/path khi instance dựa vào decision. |
| `relations` | Relation canonical, validate bằng relation type và valid triple. |
| `tags` | Từ khóa hỗ trợ tìm kiếm, không thay thế relation. |
| `owner` | Người/role chịu trách nhiệm nội dung. |
| `created` | `YYYY-MM-DD`. |
| `updated` | `YYYY-MM-DD`. |

## Body Sections

Base entity instance phải có:

```md
# <ID> - <Title>

## Summary

## Meaning

## Relations

## Validation Notes
```

Nếu entity type không khai báo `structure extends`, core sections mặc định là:

```md
## Responsibility

## Rules
```

Nếu entity type có `structure extends`, instance phải giữ các section base ở trên và thêm required sections của extension, ví dụ `Trigger`, `Steps`, `Outcomes` cho `Process`.

## Relations Section

Relation canonical nên nằm trong frontmatter `relations`. Body `## Relations` dùng để giải thích ngữ cảnh relation bằng link người đọc được.

Unit template cho relation block: [entity-relations](../../guide/unit-structure/entity-relations/README.md).

```md
## Relations

- `BRULE-001` - rule chi phối process này.
```

Nếu relation chưa canonical:

```md
## Open Relation Question

> NOTE-CANDIDATE: cần relation giữa `Process` và `QualityGate`.
```

## Forbidden

- Không tạo relation bằng prose tự do rồi coi là canonical.
- Không bỏ qua `entity_type` vì file đã nằm trong folder đúng.
- Không thêm section đặc thù nếu entity type chưa khai báo trong `structure extends`.
- Không nhét app truth tổng hợp vào entity instance không có identity rõ.
