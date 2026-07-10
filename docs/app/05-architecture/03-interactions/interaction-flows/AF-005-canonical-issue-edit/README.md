---
schema: entity-instance/v1
id: AF-005
slug: canonical-issue-edit
title: Canonical Issue Edit
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Luồng admin mở issue editor và chỉnh canonical issue state trực tiếp trong CIS.
theory_basis:
  - TH-CANON-01
  - TH-CANON-04
relations:
  involves:
    - MOD-001
  changes:
    - SO-001
---
# AF-005 - Canonical Issue Edit

## Summary

Luồng admin mở issue editor và chỉnh canonical issue state trực tiếp trong CIS.

## Meaning

Luồng admin mở issue editor và chỉnh canonical issue state trực tiếp trong CIS.

## Trigger

Admin gọi editor endpoint hoặc patch issue endpoint.

## Path

`Admin -> Cis HTTP -> CisApi.getIssueEditor(...) / CisApi.updateCanonicalIssue(...) -> add revision -> update sync-related flags`

## Outcome

Canonical issue được chỉnh sửa có kiểm soát và có revision/history đi kèm.

## Related Entities

- Canonical relation: [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- Canonical relation: [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md)



## Architectural role

Luồng admin mở issue editor và chỉnh canonical issue state trực tiếp trong CIS. Flow này là đơn vị trace cho trigger, participant, outcome và side effect kiến trúc.

## Boundaries respected

Participant chỉ đi qua owner/public API phù hợp; flow không chuyển ownership chỉ vì có orchestration hoặc side effect.

## Anti-patterns avoided

Không bypass owner state, không thực hiện side effect ngoài guardrail tương ứng và không biến flow thành mô tả payload/code-level detail.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Cis/application/getIssueEditor.js`
- `src/modules/Cis/application/updateCanonicalIssue.js`
- `src/modules/Cis/http/routes.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
