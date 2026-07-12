# CIS Workbench Policy

Policy version: `1`  
Authority: [DEC-003](../../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md)

## Scope

Chỉ `docs/workbench/cis/`.

## Roles

| Role | Quyền |
| --- | --- |
| Intake author (human hoặc workbench-support agent) | Tạo/sửa draft theo template; không approve truth |
| Lifecycle custodian (`repo maintainer`) | Triage, TTL/cadence, stale sweep; không tự approve app/meta/theory truth nếu thiếu role tương ứng |
| Product/app owner | Approve promote vào `docs/app` |
| Doc-system/meta owner | Approve promote vào `docs/meta` |
| Theory owner | Approve promote vào `docs/theories` hoặc route challenge/refine |

## Allowed Values

`source_type`:

```text
idea | code_observation | incident_evidence | product_question | implementation_gap
```

`uncertainty.type`:

```text
canonical_home | contract | modeling | evidence
```

`status`:

```text
intake | triaged | modeling | in_review | ready_for_promotion | promoted | rejected | superseded | expired
```

## Transitions

```text
intake → triaged | rejected | expired
triaged → modeling | rejected | expired | superseded
modeling ↔ in_review
modeling → ready_for_promotion | rejected | expired | superseded
in_review → modeling | ready_for_promotion | rejected | expired | superseded
ready_for_promotion → promoted | modeling | in_review | rejected | expired | superseded
```

Terminal states không chuyển tiếp trừ correction note trong `history` / `handoff`.

## Required Fields By Stage

| Stage | Tối thiểu |
| --- | --- |
| `intake` | `id`, `policy_version`, `source_type`, `title` hoặc `claim_or_question`, human `owner`, `source_refs`, `uncertainty`, `created_at`, `updated_at`, `review_by`, `expires_at`, history entry đầu |
| `triaged` | in-scope confirmed; ≥1 `candidate_destinations` hoặc lý do chưa có + next action |
| `modeling` | claim/model, evidence đã có, gap còn lại; không trình bày như truth |
| `in_review` | claim đủ review; reviewer theo target home; open questions rõ |
| `ready_for_promotion` | đúng một canonical destination; authority/evidence đủ; workflow handoff và validation đã xác định |
| `promoted` | canonical target tồn tại; validation `ready` hoặc `accepted-gap`; handoff link |
| `rejected` | reason + reviewer/authority |
| `superseded` | `superseded_by` |
| `expired` | reason + closed_at; giữ path ổn định |

## TTL And Cadence

- `review_by = created_at + 7` ngày lịch.
- `expires_at = created_at + 30` ngày lịch.
- Gia hạn tối đa một lần, thêm ≤ 30 ngày; ghi reason, approver, timestamp trong `history`.
- Weekly triage: `intake` và item quá `review_by`.
- Monthly audit: đếm theo status và median time-to-promote nếu có.

`stale` là derived condition khi hôm nay > `review_by`; không phải status canonical. Stale không tự promote và không silent delete.

## Identity And Paths

- ID: `WB-CIS-NNNN` (bốn chữ số, tăng đơn điệu, không tái sử dụng).
- Path: `docs/workbench/cis/items/wb-cis-NNNN.md`.
- Path giữ ổn định suốt lifecycle; không move/rename khi terminal.
- Registry: [items/README.md](items/README.md).

## Validation

- Structural: `npm run verify:workbench`.
- Semantic/authority/evidence/placement: human review + canonical workflows.
- Không paste credential, token, raw webhook payload hoặc secret vào item.

## Promotion

1. `read-for-task` lại.
2. `sync-product-change` nếu đổi product behavior; giữ nguyên nếu `blocked`.
3. `write-docs` materialize; không copy nguyên item.
4. `trace-impact` khi có entity/relation/impact.
5. `validate-after-change`.
6. Chỉ lúc đó set `promoted`.
