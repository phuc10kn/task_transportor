# Phase 06 - TH-OPS-TRACE

## Mục tiêu

Materialize theory về traceability, retry, recoverability và operational explainability.

Phase này phải gom được reasoning đang rải giữa:

- sync engine;
- job retry;
- audit/journal review;
- monitoring và recover workflow.

## Inputs bắt buộc

- `docs/work/06-sync-engine.md`
- `docs/business/workflows/failed-job-retry.md`
- `docs/business/workflows/audit-and-journal-review.md`
- `docs/business/usecases/monitor-and-recover.md`
- `docs/business/workflows/dashboard-monitoring.md`
- `docs/architecture/workflows/cis-to-jira-sync.md`
- `docs/explain/missing_theories.md`

## Làm trong phase này

- Tạo folder:
  - `docs_native_theory_app/theories/recoverable-operations/`
- Viết 4 file theory chuẩn.
- Map boundary semantics của `TH-OPS-TRACE` theo root governance:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`
- Chốt các position chính:
  - operation có side effect phải trace được;
  - retry là hành vi vận hành có ngữ nghĩa;
  - audit/journal là công cụ ra quyết định;
  - failure nên recoverable hoặc ít nhất diagnosable;
  - operation state và business state phải tách lớp nhưng liên hệ được.
- Ghi rõ boundaries:
  - theory không nói schema `sync_jobs`, `sync_journal`;
  - không nói retry delay cụ thể;
  - không nói route admin cụ thể.
- Ghi rõ tensions:
  - log nhiều vs maintainability;
  - automatic retry vs operator control;
  - trace completeness vs complexity.

## Deliverables

- `docs_native_theory_app/theories/recoverable-operations/README.md`
- `docs_native_theory_app/theories/recoverable-operations/agent.md`
- `docs_native_theory_app/theories/recoverable-operations/theory.md`
- `docs_native_theory_app/theories/recoverable-operations/governance.md`
- Boundary contract của `TH-OPS-TRACE` đã được encode trong theory group.

## Không làm trong phase này

- Không ghi policy retry cụ thể theo phút.
- Không ghi schema hoặc SQL cụ thể.
- Không ghi monitor dashboard implementation detail.

## Chốt chặn

Phase này đạt khi:

- retry, journal, audit và operation review có một theory home thống nhất;
- `09-operation` và `08-quality` có nền reasoning rõ để route;
- boundary semantics đã được encode rõ theo root governance;
- người đọc không còn phải suy luận từ sync-engine doc đơn lẻ.

Không qua phase 07 nếu:

- theory còn dính implementation sync job schema;
- còn nhầm recoverability với sync safety;
- boundary semantics chưa được encode rõ theo root governance;
- chưa chốt rõ journal/audit dùng để ra quyết định chứ không chỉ lưu log.

## Rủi ro chính

- Trộn operation trace với `TH-SYNC-SAFE`.
- Biến theory thành hướng dẫn vận hành tool cụ thể.
- Chỉ nói retry mà quên traceability và explainability.

## Checklist hoàn thành phase

- [ ] Folder `recoverable-operations/` đã tồn tại.
- [ ] Có đủ 4 file theory chuẩn.
- [ ] Có position rõ cho traceability, recoverability, audit, retry.
- [ ] Có boundaries rõ giữa theory và implementation runtime.
- [ ] Đã encode rõ `Owns / Excludes / Depends on / Typical impact areas`.
- [ ] Có tensions rõ giữa automation và operator control.
