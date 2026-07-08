# Decision Schema

Schema này áp dụng cho decision record riêng trong `docs/app/10-decisions/`.

Layer README hoặc index tổng hợp trong `docs/app/10-decisions/README.md` không phải decision record.

Unit template: [decision](../../guide/unit-structure/decision/README.md).

## YAML Frontmatter

```yaml
---
schema: decision/v1
id: DEC-001
slug: use-cis-as-sync-hub
title: Use CIS As Sync Hub
status: accepted
summary: Đồng bộ phải đi qua CIS thay vì Backlog -> Jira trực tiếp.
affected_layers:
  - 00-context
  - 01-business
  - 02-product
  - 05-architecture
theory_basis:
  - TH-HUBFLOW
review_triggers:
  - Medium scope mở Jira inbound đầy đủ.
---
```

## Required Fields

| Field | Rule |
| --- | --- |
| `schema` | Luôn là `decision/v1`. |
| `id` | Stable decision ID. |
| `slug` | URL/file friendly slug. |
| `title` | Tên quyết định. |
| `status` | Một status trong vocabulary canonical. |
| `summary` | Một câu nêu lựa chọn chính. |
| `affected_layers` | Layer bị ảnh hưởng trực tiếp. |

## Optional Fields

| Field | Rule |
| --- | --- |
| `theory_basis` | Theory ID làm nền suy luận. |
| `affected_entities` | Entity/entity type bị ảnh hưởng khi có trace rõ. |
| `review_triggers` | Điều kiện phải review lại decision. |

## Required Sections

```md
## Status

## Decision

## Context

## Theory Basis

## Affected Layers

## Affected Entities

## Alternatives Considered

## Consequences

## Review Triggers
```

## Section Rules

| Section | Rule |
| --- | --- |
| `Status` | Lặp lại status hiện tại và ngày review nếu có. |
| `Decision` | Nêu lựa chọn đã chốt. |
| `Context` | Nêu vấn đề khiến decision tồn tại. |
| `Theory Basis` | Link theory ID, không copy full theory. |
| `Affected Layers` | Liệt kê layer chịu tác động. |
| `Affected Entities` | Liệt kê entity/entity type chịu tác động khi có. |
| `Alternatives Considered` | Ghi phương án đã loại và lý do. |
| `Consequences` | Ghi trade-off sau khi chốt. |
| `Review Triggers` | Ghi điều kiện làm decision cần xem lại. |

## Forbidden

- Không dùng decision để thay `docs/app/02-product/README.md` cho scope Lite hiện hành.
- Không dùng decision để định nghĩa theory mới.
- Không xóa decision cũ; đổi status thành `superseded`, `deprecated` hoặc `rejected`.
