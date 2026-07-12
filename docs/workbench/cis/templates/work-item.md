# Workbench Item Template

> STATUS: ACTIVE theo [DEC-003](../../../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md) và [policy.md](../policy.md).

Copy vào `docs/workbench/cis/items/wb-cis-NNNN.md`. Không tạo item nếu chưa có candidate thật.

```yaml
---
id: WB-CIS-0001
policy_version: 1
status: intake
source_type: idea # idea | code_observation | incident_evidence | product_question | implementation_gap
title:
claim_or_question:
owner: # human owner role bắt buộc
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
review_by: YYYY-MM-DD
expires_at: YYYY-MM-DD
source_refs: []
evidence_refs: []
authority_refs: []
uncertainty:
  type: canonical_home # canonical_home | contract | modeling | evidence
  reason:
candidate_destinations: []
candidate_entities: []
candidate_relations: []
open_questions: []
handoff:
  workflow:
  canonical_targets: []
  validation_result:
disposition:
  result:
  reason:
  superseded_by:
  closed_at:
history:
  - at: YYYY-MM-DD
    actor:
    from: none
    to: intake
    reason: created
---
```

## Body Sections

```md
## Problem / uncertainty

## Evidence

## Canonical destination hypothesis

## Promotion blockers

## Handoff log
```

## Rules

- `owner` phải là human role ngay khi tạo.
- `review_by` mặc định +7 ngày; `expires_at` mặc định +30 ngày từ `created_at`.
- Không paste secret/raw payload.
- Candidate content không phải canonical truth.
- Cập nhật [items/README.md](../items/README.md) khi tạo hoặc đổi status.
