---
schema: entity-instance/v1
id: AF-002
slug: backlog-project-pull
title: Backlog Project Pull
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Luồng batch pull theo project được giữ làm trace nhưng execution hiện bị disable.
theory_basis:
  - TH-HUBFLOW-02
  - TH-CANON-01
relations:
  involves:
    - MOD-002
    - MOD-008
    - MOD-006
  changes:
    - SO-003
---
# AF-002 - Backlog Project Pull

## Summary

Luồng batch pull theo project được giữ làm trace nhưng execution hiện bị disable.

## Meaning

Manual project pull không khả dụng trong Lite hiện tại; operator sync từng candidate riêng.

## Trigger

Không có trigger active; route manual trả `BACKLOG_PROJECT_PULL_DISABLED`.

## Path

`Admin -> Backlog HTTP -> disabled guard -> 409`, không gọi Backlog và không enqueue job.

## Outcome

Không có batch job; operator dùng candidate action thuộc `AF-001`.

## Related Entities

- Canonical relation: [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- Canonical relation: [MOD-008-projects](../../../01-structure/modules/MOD-008-projects/README.md)



## Architectural role

Flow này giữ provenance cho capability đã disable và là điểm review nếu project pull được thiết kế lại theo queue-only.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Backlog/application/pullProject.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-002-backlog-project-pull/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Evidence UI trigger đã được refresh sau khi control chuyển sang Backlog Issues.
- Execution bị disable theo quyết định sản phẩm hiện tại; UI giữ control disabled để giải thích cho operator.
- Không suy diễn relation canonical mới từ prose hiện có.
