# Phase 05 - TH-SYNC-SAFE

## Mục tiêu

Materialize theory về sync safety cho outbound external write.

Phase này phải giải thích ở mức principle:

- vì sao dry-run phải tồn tại;
- vì sao preview có thể stale;
- vì sao mapping gap hoặc anomaly có quyền chặn sync;
- vì sao sync thật phải khó hơn dry-run.

## Inputs bắt buộc

- `docs/architecture/workflows/jira-dry-run.md`
- `docs/architecture/workflows/cis-to-jira-sync.md`
- `docs/work/06-sync-engine.md`
- `docs/work/plans/README.md`
- `docs/business/workflows/jira-sync-preview.md`
- `docs/business/workflows/jira-sync-publish.md`
- `docs/business/workflows/mapping-approval.md`
- `docs/explain/missing_theories.md`

## Làm trong phase này

- Tạo folder:
  - `docs_native_theory_app/theories/safe-external-synchronization/`
- Viết 4 file theory chuẩn.
- Map boundary semantics của `TH-SYNC-SAFE` theo root governance:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`
- Chốt các position chính:
  - outbound external write là action rủi ro cao;
  - dry-run là safety gate, không phải UI gimmick;
  - readiness/pre-check phải có quyền chặn sync thật;
  - stale preview không được dùng làm căn cứ sync thật;
  - irreversible write cần guardrail mạnh hơn internal mutation.
- Ghi rõ boundaries:
  - theory không nói payload Jira cụ thể;
  - không nói endpoint cụ thể;
  - không nói code builder cụ thể.
- Ghi rõ tensions:
  - tốc độ publish vs safety;
  - automation vs operator trust;
  - freshness vs throughput.

## Deliverables

- `docs_native_theory_app/theories/safe-external-synchronization/README.md`
- `docs_native_theory_app/theories/safe-external-synchronization/agent.md`
- `docs_native_theory_app/theories/safe-external-synchronization/theory.md`
- `docs_native_theory_app/theories/safe-external-synchronization/governance.md`
- Boundary contract của `TH-SYNC-SAFE` đã được encode trong theory group.

## Không làm trong phase này

- Không ghi payload Jira thật.
- Không ghi route API thật.
- Không ghi logic anomaly hay mapping implementation detail.

## Chốt chặn

Phase này đạt khi:

- dry-run đã có theory home riêng;
- safe sync không còn phải giải thích lại ở nhiều workflow docs;
- boundary semantics đã được encode rõ theo root governance;
- app có nền reasoning rõ cho `can_sync`, stale preview và outbound guardrail.

Không qua phase 06 nếu:

- theory còn nhầm với job/retry theory;
- còn mô tả quá nhiều implementation dry-run;
- boundary semantics chưa được encode rõ theo root governance;
- chưa chốt rõ outbound risk cao hơn internal update.

## Rủi ro chính

- Trộn sync safety với retry/operation trace.
- Trộn sync safety với mapping implementation.
- Biến theory thành tài liệu UI preview.

## Checklist hoàn thành phase

- [ ] Folder `safe-external-synchronization/` đã tồn tại.
- [ ] Có đủ 4 file theory chuẩn.
- [ ] Có position rõ cho dry-run, pre-check, stale preview.
- [ ] Có boundaries rõ giữa theory và Jira-specific implementation.
- [ ] Đã encode rõ `Owns / Excludes / Depends on / Typical impact areas`.
- [ ] Có tensions rõ giữa speed và safety.
