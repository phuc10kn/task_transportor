---
id: AF-005
slug: canonical-issue-edit
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
theory_basis:
  - TH-MOD-01
---

# AF-005 - Canonical Issue Edit

## Meaning

Luồng admin mở issue editor và chỉnh canonical issue state trực tiếp trong CIS.

## Trigger

Admin gọi editor endpoint hoặc patch issue endpoint.

## Path

`Admin -> Cis HTTP -> CisApi.getIssueEditor(...) / CisApi.updateCanonicalIssue(...) -> add revision -> update sync-related flags`

## Outcome

Canonical issue được chỉnh sửa có kiểm soát và có revision/history đi kèm.

## Related Entities

- [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md)

## Evidence

- `src/modules/Cis/application/getIssueEditor.js`
- `src/modules/Cis/application/updateCanonicalIssue.js`
- `src/modules/Cis/http/routes.js`
