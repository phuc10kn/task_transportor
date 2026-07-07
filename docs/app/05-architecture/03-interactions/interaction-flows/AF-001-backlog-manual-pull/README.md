---
id: AF-001
slug: backlog-manual-pull
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
theory_basis:
  - TH-HUBFLOW-02
  - TH-CANON-01
---

# AF-001 - Backlog Manual Pull

## Meaning

Luồng admin kéo một issue Backlog đơn lẻ vào hệ thống.

## Architectural role

Đây là inbound ingest flow cơ bản nhất của repo. Nó cho thấy cách một source system đi vào app mà vẫn tôn trọng owner API và canonical boundary.

## Trigger

Admin gọi route pull issue theo project và backlog issue key.

## Path

`Admin -> Backlog HTTP -> BacklogApi -> SyncApi.enqueueJob(manual_pull) hoặc pull now -> BacklogClient -> normalizer -> CisApi.upsertBacklogIssue(...)`

## Why the path is shaped this way

- Request vào qua `Backlog` vì đây là source-specific boundary.
- Normalization ở `Backlog` để payload external không đi thẳng vào core.
- Write cuối cùng đi qua `CisApi` vì `Cis` là owner của canonical issue state.
- Có thể dùng job path nếu muốn retry/journal tốt hơn thay vì nhồi mọi thứ vào request lifecycle.

## Outcome

Canonical issue trong `Cis` được tạo hoặc cập nhật từ nguồn Backlog.

## Boundaries respected

- `Backlog` không chiếm canonical ownership.
- `Cis` không cần biết transport detail của Backlog API.
- `Sync` chỉ tham gia execution, không trở thành owner business state.

## Anti-patterns avoided

- Route controller gọi thẳng external API rồi tự ghi DB owner khác.
- Bỏ qua bước normalize và dùng raw payload làm canonical state.
- Gắn luôn outbound responsibility vào cùng flow inbound.

## Related Entities

- [MOD-002-backlog](../../../01-structure/modules/MOD-002-backlog/README.md)
- [MOD-001-cis](../../../01-structure/modules/MOD-001-cis/README.md)
- [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md)
- [DF-001-backlog-to-cis-canonicalization](../../../05-data/data-flows/DF-001-backlog-to-cis-canonicalization/README.md)

## Evidence

- `src/modules/Backlog/application/pullIssue.js`
- `src/modules/Backlog/application/handleManualPullJob.js`
