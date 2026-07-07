---
id: AF-002
slug: backlog-project-pull
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
theory_basis:
  - TH-HUBFLOW-02
  - TH-CANON-01
---

# AF-002 - Backlog Project Pull

## Meaning

Luồng batch pull theo project để enqueue nhiều manual pull job từ Backlog vào CIS.

## Trigger

Admin gọi route pull project.

## Path

`Admin -> Backlog HTTP -> BacklogApi.pullProject(...) -> load project config -> query source list -> SyncApi.enqueueJob(manual_pull x N)`

## Outcome

Hệ thống tạo batch job pull từng issue của project, thay vì xử lý nặng ngay trong request.

## Related Entities

- [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- [MOD-008-projects](../../../01-structure/modules/MOD-008-projects/README.md)

## Evidence

- `src/modules/Backlog/application/pullProject.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-002-backlog-project-pull/README.md`
