---
schema: entity-instance/v1
id: PROC-003
slug: pull-backlog-project
title: Pull Backlog Project
entity_type: Process
layer: 01-business
concern: 04-behavior
status: active
summary: Operator kéo danh sách issue của project Backlog đã cấu hình vào hàng đợi CIS để xử lý riêng từng issue.
theory_basis:
  - TH-HUBFLOW
  - TH-OPS-TRACE
---

# PROC-003 - Pull Backlog Project

## Summary

Operator kéo danh sách issue của project Backlog đã cấu hình vào hàng đợi CIS để xử lý riêng từng issue.

## Meaning

Project pull là đường ingest chính của Lite cùng manual one-issue pull. Nó tạo candidate jobs vào CIS, không publish trực tiếp sang Jira.

## Trigger

Operator chủ động yêu cầu pull một project Backlog đã enable manual/project pull.

## Participants

- Admin/operator.

## Steps

1. Operator chọn project đã cấu hình và yêu cầu project pull.
2. CIS xác nhận project và nguồn Backlog đủ điều kiện pull.
3. CIS lấy candidate issues theo phạm vi pull hiện hành.
4. CIS tạo một ingest job riêng cho từng issue hợp lệ.
5. Operator theo dõi outcome của các job để review hoặc recovery khi cần.

## Outcomes

- Candidate issue được enqueue riêng vào đường `Backlog -> CIS`.
- Issue không có key hợp lệ không tạo job.
- Project pull không sync trực tiếp sang Jira.
- Failure của một issue được theo dõi theo job, không biến toàn bộ project pull thành direct outbound flow.

## Rules

- Project pull phải đi qua CIS.
- Scheduled pull không thuộc Process này.
- Mỗi candidate issue có outcome truy vết được.

## Relations

Process không có outbound relation slot active.

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Backlog/application/pullProject.js`.
- Automated evidence: `npm run verify:phase03`.
