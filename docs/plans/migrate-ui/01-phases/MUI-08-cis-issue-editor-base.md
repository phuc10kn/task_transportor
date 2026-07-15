# MUI-08 — CIS Issues và Issue Editor base

## Mục tiêu

Tạo CIS Issues list/manual create và canonical Issue Editor deep-link được, giữ full active fields, source comparison và operational evidence.

## Artifact mục tiêu

- `/cis-issues` và `/cis-issues/[issueId]` routes.
- `apps/admin-web/features/issues/**` cho list, overview, canonical form và status rail.
- CIS/editor base Playwright suites.

## Điều kiện mở phase

- HG-03 được xác nhận.
- Current issues list/create/editor/update/history endpoints và visible-field matrix đã khóa ở MUI-00.

## Công việc

- CIS list filter Project trong URL, manual create và deep-link; giữ columns Backlog, Project, Status, Summary, Review count và Anomaly count.
- Manual create giữ Project/Summary/Description khi fail; success tới issue URL.
- Editor load current issue editor response và history endpoint; không yêu cầu DTO/backend mới.
- Canonical form giữ summary, description, issue_type, priority, status, assignee, due_date và reason.
- Bảy canonical field cùng assignee metadata persist/reload từ editor DTO. `reason` chỉ submit làm audit note của lần save, xuất hiện trong History/journal evidence và không được coi là canonical field rehydrated vào form; việc lộ audit reason trong History là `Interface addition`, không phải legacy field parity.
- `issue_type`, `priority`, `status` là select lấy option từ `editor.field_meta.catalogs`; giữ current option do API trả, không hard-code hoặc đổi thành free text.
- Assignee giữ đúng active contract: canonical assignee text cùng Jira account ID input riêng từ `assignee_meta`; không invent joined user catalog.
- Source comparison render toàn bộ editable source/canonical field API đang cung cấp.
- Overview giữ CIS/Project/Backlog/Jira identity, Updated, Worklog count/seconds/sources, canonical hash và manual-edit History.
- Shared `System → CIS → System` rail chỉ diễn giải current issue/sync/dry-run evidence; chưa đánh giá Jira readiness trước MUI-12.
- Dirty marker, Save/Discard và navigation guard; unsaved canonical chặn identity, resync, translation và Jira action.
- Save/API error giữ draft; success reload server truth.
- Đăng ký CIS Issues nav và list/editor refetch adapter; Global Refresh giữ route identity, đi qua dirty guard và reload đúng issue hiện tại.
- Không sửa CIS/Mapping/Assignee backend contract.

## Checklist nghiệm thu

- [x] CIS list/create/deep-link giữ active columns và không phụ thuộc prior navigation.
- [x] Đủ bảy canonical fields, assignee text và Jira account ID persist/reload theo current API.
- [x] Canonical `issue_type`/`priority`/`status` giữ select semantics và option source từ `field_meta.catalogs`.
- [x] Reason được gửi như audit note và kiểm được trong History; acceptance không yêu cầu editor DTO reload reason vào form.
- [x] Source comparison không biến source thành editable input.
- [x] Identity/Updated/Worklog/canonical hash/History đều render và có browser assertion.
- [x] Dirty guard chặn downstream actions và navigation đúng.
- [x] Loading/empty/error/retry, CIS/editor verifiers và Playwright pass.
- [x] Manual check (Người review tại HG-04).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress: MUI-08 - automated gate pass | Next: chờ HG-04.

Đã thêm `/cis-issues` và `/cis-issues/[issueId]`, manual create, canonical form đủ bảy field, assignee metadata, source comparison, identity/worklog/hash/history evidence và dirty guard. Editor reload lại server truth sau save; lỗi giữ draft. Không thay đổi CIS API.

Evidence tự động: `npm run verify:issue-editor`, `npm run admin:lint`, `npm run admin:typecheck`, `npm run admin:build`, `npm test` pass; full Admin UI Playwright pass 23/23. Browser matrix kiểm list/create/deep-link, bảy field/catalog, source read-only evidence, identity/worklog/hash/history, audit reason, reload server truth, dirty guard và list error/retry. Manual/HG-04 vẫn chờ review riêng.

### Ma trận evidence Agent

- `cis-issue-editor.spec.ts`: CIS list/create/deep-link, canonical fields/catalog, source read-only, audit/history/evidence và dirty guard.
- `cis-issue-editor.spec.ts`: list error/retry; `verify:issue-editor`: current API persistence and editor contract.
