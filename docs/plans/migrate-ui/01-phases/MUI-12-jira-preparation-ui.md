# MUI-12 — Jira preparation UI

## Mục tiêu

Chuyển Jira dry-run/sync modal sang Next.js theo contract hiện tại và mở HG-05, không thiết kế lại backend safety contract.

## Artifact mục tiêu

- `apps/admin-web/features/jira/**` tích hợp trong Issue Editor.
- Jira Playwright suite cho dry-run blocked/pass, editable Jira fields, queued/error feedback.
- HG-05 safe Jira test issue và review checklist.

## Điều kiện mở phase

- HG-04 được xác nhận.
- Current `/issues/:id/dry-run/jira` và `/issues/:id/sync/jira` behavior đã khóa ở MUI-00.

## Công việc

- Jira modal chỉ mở khi canonical form không dirty; khi mở gọi current dry-run endpoint.
- Render `can_sync`, validation errors, warnings, canonical hash, field sources và payload preview hiện có. Dry-run payload chỉ có `stale=false`; stale reason lấy từ message/details khi Sync trả `DRY_RUN_STALE`.
- Populate editable Jira fields từ dry-run payload: summary, description, issue_type, priority, status, assignee và due_date. `issue_type`, `priority`, `status` và Assignee khi có catalog là select lấy option từ `editor.field_meta.catalogs_by_system.jira`; nếu Assignee hiện tại không còn trong catalog, giữ input để không làm mất account ID đang có. Không hard-code giá trị.
- Giữ active semantics: dry-run đánh giá current canonical; sync gửi current `jira_fields` overrides bằng endpoint hiện có. Không tuyên bố target hash/dry-run identity/latest-attempt enforcement chưa tồn tại.
- Sync disabled khi chưa có dry-run hoặc current dry-run `can_sync=false`. Nếu Sync trả `DRY_RUN_STALE`, giữ modal/overrides, hiển thị message/details, đánh dấu local stale và khóa Sync tới khi `Dry-run again` thành công; backend vẫn là authority cuối.
- `Dry-run again` gọi lại current canonical dry-run. Khi Jira override đã bị sửa, controlled confirmation phải báo rõ lần chạy mới sẽ thay form bằng payload dry-run mới; cancel giữ nguyên edits, confirm mới thay. Confirmation này là safety transform so với legacy ghi đè ngay.
- Sync HTTP 202 giữ queued/job evidence ban đầu. Khi response có job ID, poll tới `success`, `failed`, `cancelled` hoặc client timeout; đây là async safety transform và không được coi accepted là completed.
- Status rail Jira segment chỉ diễn giải current `can_sync`, warning/error và job result.
- Mở rộng Issue Editor refetch adapter cho Jira evidence; Global Refresh không tự dry-run hoặc sync và phải bảo vệ Jira override đang sửa.
- Không sửa Jira/CIS/Mapping/Anomaly backend.
- Sau automated pass, giữ phase active và chờ HG-05.

## Checklist nghiệm thu

- [x] Modal render errors/warnings/hash/field sources/payload; `DRY_RUN_STALE` giữ context, lộ message/details và khóa Sync tới dry-run mới.
- [x] Đủ bảy Jira fields được populate và gửi đúng `jira_fields` current contract.
- [x] Jira `issue_type`/`priority`/`status` giữ select semantics và option source từ `field_meta.catalogs_by_system.jira`.
- [x] Không enable Sync khi chưa dry-run, local modal đã stale sau `DRY_RUN_STALE` hoặc `can_sync=false`.
- [x] Dry-run error/retry và Sync error giữ modal/operator context.
- [x] HTTP 202 hiển thị explicit job evidence; chỉ non-terminal job mới poll tới terminal/timeout.
- [x] Không claim `dry_run_id`, target hash hoặc latest-attempt contract mới.
- [x] Current Jira/Issue verifiers và Playwright pass.
- [x] HG-05 được user xác nhận.
- [x] Manual check (Người review tại HG-05).
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu: docs/plans/migrate-ui/01-phases/MUI-12-jira-preparation-ui.md - ghi nhận HG-05 đã được user xác nhận bằng yêu cầu tiếp tục MUI-13.
