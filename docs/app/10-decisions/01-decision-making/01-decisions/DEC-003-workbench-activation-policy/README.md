---
schema: decision/v1
id: DEC-003
slug: workbench-activation-policy
title: Workbench Activation Policy
status: accepted
summary: Kích hoạt docs/workbench/cis làm temporary knowledge staging cho undetermined-placement, với owner, lifecycle, TTL và handoff bắt buộc về luồng canonical.
affected_layers:
  - 00-context
  - 10-decisions
theory_basis:
  - TH-CANON
  - TH-OPS-TRACE
review_triggers:
  - Stale rate hoặc expired rate tăng liên tục.
  - Có nhu cầu mở Workbench ngoài scope CIS.
  - Guide hoặc AGENT_SKILLS lại route mâu thuẫn với decision này.
  - Muốn suspend hoặc retire Workbench.
---

# DEC-003 - Workbench Activation Policy

## Status

accepted

Ngày chốt: 2026-07-13.

## Decision

`task_transportor` kích hoạt `docs/workbench/cis/` làm temporary knowledge operating path cho case `canonical_home = undetermined-placement`.

Quyết định đã ratify:

1. Scope active chỉ `docs/workbench/cis/`. Không mở workspace khác trong cùng change set này.
2. Lifecycle custodian là `repo maintainer`.
3. Human hoặc workbench-support agent được tạo draft item; mọi item phải gán human owner role ngay khi tạo.
4. Promotion approval theo canonical target:
   - `docs/app` → product/app owner;
   - `docs/meta` → doc-system/meta owner;
   - `docs/theories` → theory owner.
5. Initial review = `created_at + 7` ngày lịch; expiry mặc định = `created_at + 30` ngày lịch.
6. Gia hạn tối đa một lần, thêm không quá 30 ngày; bắt buộc reason, approver và timestamp.
7. Cadence: weekly triage cho `intake`/overdue; monthly audit toàn workspace.
8. Operational policy nằm tại [`docs/workbench/cis/policy.md`](../../../../../workbench/cis/policy.md). Workflow profile bind tại [`workflow-profile.md`](workflow-profile.md).
9. `npm run verify:workbench` là structural activation gate; không thay semantic/authority review.
10. Workbench không phải app truth, meta contract hoặc theory SoT. Promote chỉ qua `read-for-task` → `sync-product-change` khi cần → `write-docs` → `trace-impact` khi cần → `validate-after-change`.

Item lifecycle đã ratify:

```text
intake → triaged → modeling ↔ in_review → ready_for_promotion → promoted
terminal khác: rejected | superseded | expired
```

## Context

`write-docs` và `validate-after-change` dừng đúng khi chưa có canonical home, nhưng project chưa có nơi staging có owner/TTL/review. Knowledge dễ rơi vào chat, PR comment hoặc README layer.

Plan 03 trong `docs/review/workflows/plans/03-undetermined-knowledge-lifecycle.md` đã chốt hướng PA-B và six governance baselines đã được human ratify trước khi materialize decision này.

## Theory Basis

- `TH-CANON`: temporary knowledge cần owner và disposition rõ; không được tự thành canonical.
- `TH-OPS-TRACE`: intake/handoff/audit phải truy được nguồn và kết cục.

## Affected Layers

- `00-context`: rule local về undetermined knowledge chuyển sang Workbench thay vì chỉ `NOTE-OPEN` hoặc giữ ngoài docs.
- `10-decisions`: activation authority và workflow profile local.

## Affected Entities

Không tạo entity type/instance mới chỉ vì decision này.

## Alternatives Considered

| Phương án | Kết luận |
| --- | --- |
| Strict stop, không staging | Loại — knowledge thất lạc |
| `NOTE-*` làm staging chính | Loại — không có owner/TTL/disposition |
| External issue tracker làm primary staging | Chỉ supporting reference; không thay local maturation/handoff |
| Activate Workbench bằng STATUS trong folder | Loại — tạo activation authority vòng tròn |

## Consequences

- Guide giữ conceptual framework và workflow generic; local field/status/TTL nằm ở decision + Workbench policy.
- AGENT_SKILLS bỏ blanket ban inactive và thêm `workbench-intake`.
- `sync-product-change = blocked` không được Workbench đổi thành `ready_for_write`.
- Không tạo fake Workbench item để làm đẹp registry.
- Deactivate bằng supersede/decision mới; README/profile chỉ mirror status decision.

## Review Triggers

- Stale/expired rate tăng liên tục.
- Nhu cầu mở Workbench ngoài CIS.
- Route guide/AGENT_SKILLS lệch decision.
- Muốn suspend hoặc retire Workbench.
