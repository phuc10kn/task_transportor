# MUI-14 — Sync Jobs và Journal UI

## Mục tiêu

Chuyển active Sync Jobs controls và Journal audit table sang route thật, sau đó mở HG-06.

## Artifact mục tiêu

- `/sync-jobs` và `/journal` routes.
- `apps/admin-web/features/jobs/**`, `features/journal/**`.
- Job/Journal Playwright suites và HG-06 deterministic operations seed.

## Điều kiện mở phase

- MUI-13 automated pass.
- Current Sync Jobs/Journal endpoints, actions và visible columns đã khóa ở MUI-00.

## Công việc

### Sync Jobs

- Project filter nằm trong URL; dùng current list/detail response, không yêu cầu public projection mới.
- Giữ columns ID, Project, Source issue, Target issue, Type, Direction, Status, Created, Succeeded, Error và Actions.
- Retry/Cancel gọi current endpoints. Chỉ disable trong lúc request; backend rejection là authority và phải hiển thị reason.
- Action success refresh đúng row/list và giữ filter context.

### Journal

- Project filter nằm trong URL; giữ read-only behavior hiện tại.
- Giữ columns ID, Job, Project, Source issue, Target issue, Action, Status, Direction, Created, Succeeded và Message/Error.
- Không thêm issue filter, relation inference, mutation hoặc raw payload surface trong migration này.

### Acceptance

- Cả hai route có loading/empty/error/retry và selected/filter preservation.
- Đăng ký riêng Sync Jobs và Journal nav/refetch adapter; Global Refresh giữ Project filter, không retry/cancel job và không tạo Journal mutation.
- Sau automated pass, giữ phase active và chờ HG-06.

## Checklist nghiệm thu

- [x] Sync Jobs giữ toàn bộ active columns và Project filter.
- [x] Retry/Cancel gọi current API, chống double submit và giữ server error evidence.
- [x] Journal giữ toàn bộ active columns, read-only và Project filter.
- [x] Không thêm projection/relation/state-machine backend dependency.
- [x] Loading/empty/error/retry giữ filter context.
- [x] Current Sync/Journal verifiers và Playwright pass.
- [x] HG-06 được user xác nhận.
- [x] Manual check (Người review tại HG-06).
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu: MUI-14 - user đã xác nhận HG-06 qua yêu cầu tiếp tục MUI-15; giữ nguyên API, projection, relation và state machine.
