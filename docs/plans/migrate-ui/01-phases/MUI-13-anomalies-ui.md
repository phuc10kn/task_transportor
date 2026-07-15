# MUI-13 — Anomalies UI

## Mục tiêu

Chuyển Anomaly list/detail/evidence và operator decisions sang Next.js bằng current API.

## Artifact mục tiêu

- `/anomalies` route và `apps/admin-web/features/anomalies/**`.
- Anomaly Playwright suite.

## Điều kiện mở phase

- HG-05 được xác nhận.
- Current anomaly list/detail/resolve/ignore endpoints và visible fields đã khóa ở MUI-00.

## Công việc

- Project/status/type filters nằm trong URL và chỉ gửi filter current endpoint hỗ trợ; đây là `Interface addition`, không đổi anomaly state hoặc mutation.
- List giữ ID, Issue, Type, Severity, Status, details evidence và Actions; có loading/empty/error/retry.
- Detail surface dùng current anomaly detail/row evidence; chỉ render linked issue khi response có explicit CIS issue ID.
- Resolve/Ignore gọi current mutation; pending chống double submit.
- Keep open chỉ đóng detail/decision surface, không mutation server status.
- Mutation fail giữ detail context; success reload list/detail server truth.
- Đăng ký Anomalies nav/refetch adapter; Global Refresh giữ filters/detail identity và không tạo mutation.
- Không invent Sync Job relation hoặc backend state transition.

## Checklist nghiệm thu

- [x] Filters/list/detail/evidence dùng current response và URL state; list giữ ID và Issue để trace về owner record.
- [x] Resolve/Ignore đúng endpoint; Keep open không mutation.
- [x] Error giữ decision context; success refresh server state.
- [x] Keyboard/focus/mobile actions hoạt động.
- [x] Current anomaly verifier, lint/typecheck/build và Playwright pass.
- [x] Manual check (Người review tại HG-06).
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu: apps/admin-web/features/anomalies/anomalies-workbench.tsx - thêm route/list/detail/filter URL, Resolve/Ignore/Keep open, nav/refetch và Playwright; build, phase05, phase07, full 33/33 E2E và visual desktop/mobile pass.
