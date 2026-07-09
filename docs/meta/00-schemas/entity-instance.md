# Entity Instance Schema

Schema này áp dụng cho entity instance trong `docs/app/**/<ID-slug>/README.md`.

Unit template: [entity](../../guide/unit-structure/entity/README.md).

## Frontmatter

File mới hoặc file được sửa sau khi schema này có hiệu lực phải có YAML frontmatter.

```yaml
---
schema: entity-instance/v1
id: BRULE-001
slug: human-review-before-jira-write
title: Human Review Before Jira Write
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: Jira write phải đi qua human review.
theory_basis:
  - TH-HUBFLOW
decision_basis:
  - DEC-001
relations:
  governs:
    - PROC-001
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
| `relations` | Relation canonical theo slot đã định nghĩa trong `relations_template` của entity type. |
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

Relation canonical phải nằm trong YAML frontmatter field `relations`, ở đầu file entity README.

`relations` dùng slot name từ `relations_template` của entity type:

Unit template cho relation block: [entity-relations](../../guide/unit-structure/entity-relations/README.md).

```yaml
relations:
  governs:
    - PROC-001
```

Body `## Relations` chỉ dùng để giải thích ngữ cảnh relation cho người đọc, không thay thế canonical relation.

```md
## Relations

- `PROC-001` - process chịu sự chi phối của rule này.
```

Nếu không có slot phù hợp trong entity type, reject relation. Muốn thêm relation mới phải cập nhật entity type `relations_template`, relation type và valid triple trước.

## Forbidden

- Không tạo relation bằng prose tự do rồi coi là canonical.
- Không ghi relation ngoài slot đã định nghĩa trong entity type.
- Không bỏ qua `entity_type` vì file đã nằm trong folder đúng.
- Không thêm section đặc thù nếu entity type chưa khai báo trong `structure extends`.
- Không nhét app truth tổng hợp vào entity instance không có identity rõ.
