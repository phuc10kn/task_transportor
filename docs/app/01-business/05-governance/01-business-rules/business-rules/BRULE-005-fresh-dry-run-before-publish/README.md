---
schema: entity-instance/v1
id: BRULE-005
slug: fresh-dry-run-before-publish
title: Fresh Dry-run Before Publish
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: active
summary: External write sang Jira chỉ được yêu cầu sau khi readiness check pass và preview vẫn khớp canonical data hiện tại.
theory_basis:
  - TH-SYNC-SAFE
relations:
  governs:
    - PROC-008
    - PROC-009
---

# BRULE-005 - Fresh Dry-run Before Publish

## Summary

External write sang Jira chỉ được yêu cầu sau khi readiness check pass và preview vẫn khớp canonical data hiện tại.

## Meaning

Rule bảo vệ outbound safety: dry-run/readiness phải còn hợp lệ trước publish.

## Statement

External write sang Jira chỉ được yêu cầu khi readiness/dry-run pass và vẫn fresh với canonical data hiện tại.

## Condition

Khi operator yêu cầu publish issue sang Jira trong Lite.

## Outcome

- Publish được chấp nhận khi dry-run/readiness còn hợp lệ.
- Publish bị từ chối khi blocked hoặc stale.

## Scope

Outbound issue publish trong Lite.

## Relations

- `governs` → `PROC-008`, `PROC-009`


## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `runJiraDryRun.js`, `requestJiraSync.js`.
- Automated evidence: `npm run verify:phase05`, `npm run verify:phase06`.
