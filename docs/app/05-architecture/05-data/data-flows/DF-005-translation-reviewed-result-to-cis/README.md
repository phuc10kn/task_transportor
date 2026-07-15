---
schema: entity-instance/v1
id: DF-005
slug: translation-reviewed-result-to-cis
title: Translation Reviewed Result To CIS
entity_type: DataFlow
layer: 05-architecture
concern: 05-data
status: active
summary: Luồng đưa approved translation draft từ Translation vào canonical issue state của CIS.
theory_basis:
  - TH-AI-GOV-01
  - TH-CANON-01
relations:
  moves:
    - SO-001
---
# DF-005 - Translation Reviewed Result To CIS

## Summary

Luồng đưa approved translation draft từ Translation vào canonical issue state của CIS.

## Meaning

`ai_draft` là draft chung của AI/operator và chỉ được apply vào issue sau Approve qua owner API của Cis.

## Architectural role

Đây là feedback data flow một chiều từ review lifecycle sang canonical state. Nó tách apply result khỏi flow tạo context/draft DF-002.

## Why this flow exists

- Review state không được ghi thẳng vào issue tables.
- Cis cần giữ owner write, revision và audit cho canonical issue.

## Source / destination

- Source: approved `ai_draft` trong `translation_queue`.
- Destination: canonical issue state trong `Cis`.

## Data path

```text
approved translation draft
  -> Translation approve
  -> CisApi.applyReviewedIssueTranslation(...)
  -> canonical issue revision
```

## Transformation

Approved draft được gắn vào target field hợp lệ trước khi update canonical issue và tạo revision tương ứng.

## Boundary and ownership

- `Translation` vẫn sở hữu review queue nguồn.
- `Cis` là owner write duy nhất của canonical issue đích.
- Flow không chuyển ownership review queue sang `Cis`.

## What changes and what does not

Flow đưa approved draft vào canonical issue state. Translation review lifecycle vẫn thuộc SO-002; chỉ canonical issue state SO-001 nhận payload đã được duyệt.

## Read / write tiers involved

`Translation` đọc approved draft; `CisApi` thực hiện canonical write. Không có direct database write xuyên module.

## Anti-patterns avoided

Không cho AI draft hoặc queue item chưa review ghi thẳng canonical issue state.

## Relations

`moves` ghi canonical state đích. SO-002 ghi `shared_via` tới flow này vì reviewed result được expose qua owner path.

## Evidence

- `src/modules/Translation/application/approveTranslation.js`
- `src/modules/Cis/application/applyReviewedIssueTranslation.js`

## Related Entities

- Canonical relation: [SO-002-translation-review-state](../../../04-state/state-owners/SO-002-translation-review-state/README.md) - reviewed result nguồn
- Canonical relation: [SO-001-canonical-issue-state](../../../04-state/state-owners/SO-001-canonical-issue-state/README.md) - canonical state đích
- Context/evidence: [AF-004-translation-review](../../../03-interactions/interaction-flows/AF-004-translation-review/README.md) - interaction flow thực thi review/apply

## Validation Notes

- Instance được tạo trong DataFlow rebuild theo DEC-002.
- Không ghi inverse `StateOwner --moves--> DataFlow`; source dùng `shared_via` khi semantic là expose/read.
