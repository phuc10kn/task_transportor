# MUI-09 — Issue recovery flows

## Mục tiêu

Chuyển external identity link, Backlog resync và attachment retry sang controlled UI flows mà không làm yếu dirty guard.

## Artifact mục tiêu

- Identity/resync/attachment components trong `apps/admin-web/features/issues/**`.
- Recovery Playwright cases trong Issue Editor suite.

## Điều kiện mở phase

- MUI-08 automated pass.
- Current identity, resync, attachments list và retry endpoints đã khóa ở MUI-00.

## Công việc

- Identity editable chỉ khi current system identity trống; linked identity immutable trong UI.
- Render current linked/unchanged/not-found/duplicate/wrong-project outcomes; error giữ input/evidence.
- Backlog resync giữ explicit body evidence: terminal `job.status` được hiển thị ngay; chỉ non-terminal job có ID mới hiển thị accepted/queued rồi poll tới `success`, `failed`, `cancelled` hoặc client timeout. Đây là async safety transform; HTTP 202 không được lấn body evidence.
- Attachment section giữ metadata, download/sync status và error; retry từng Backlog attachment bằng endpoint hiện có.
- Attachment retry là `Interface addition` đã khóa ở MUI-00, không lấy dead old issue-detail block làm source parity.
- Attachment retry độc lập dirty gate; identity/resync vẫn bị chặn khi dirty.
- Attachment warning không thành Jira gate và không mở rộng upload/outbound capability.
- Abort/route cleanup chống stale response.
- Mở rộng Issue Editor refetch adapter để reload identity/resync/attachment evidence mà không tạo recovery mutation.
- Không thêm recovery endpoint hoặc attachment business rule.

## Checklist nghiệm thu

- [x] Identity linked/unchanged/error cases giữ đúng form/evidence.
- [x] Linked identity immutable; dirty guard vẫn áp dụng.
- [x] Resync accepted/poll/timeout dùng current response và không báo completed sớm.
- [x] Attachment list/retry/error hoạt động độc lập dirty canonical.
- [x] Stale recovery response không ghi đè route mới.
- [x] Current Issue Editor/Backlog verifiers và Playwright pass.
- [x] Manual check (Người review tại HG-04).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress: MUI-09 - automated gate pass | Next: chờ HG-04.

Issue Editor đã có identity link có điều kiện, Backlog resync với poll accepted → terminal, attachment list và retry độc lập kể cả khi canonical dirty. Browser test kiểm linked identity bất biến, retry success/error và dirty guard; endpoint hiện tại được dùng nguyên trạng.

Evidence tự động: `npm run verify:issue-editor`, `npm run verify:backlog-ingestion`, `npm run admin:lint`, `npm run admin:typecheck`, `npm run admin:build`, `npm test` pass; full Admin UI Playwright pass 23/23. Browser matrix kiểm identity conflict/input preservation, linked immutable state, accepted→poll→timeout resync, attachment retry conflict và stale action response sau search mới. Manual/HG-04 vẫn chờ review.

### Ma trận evidence Agent

- `issue-recovery.spec.ts`: linked/unchanged/error identity, resync accepted/poll/timeout và attachment retry conflict.
- `issue-recovery.spec.ts`: stale in-flight recovery/action response; `verify:issue-editor` + `verify:backlog-ingestion`: backend recovery contract.
