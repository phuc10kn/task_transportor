# MUI-05 — Mappings UI

## Mục tiêu

Chuyển hai chiều mapping sang route mới, giữ active row workflow và tập trung toàn bộ mapping refresh tại đây, sau đó mở HG-02.

## Artifact mục tiêu

- `apps/admin-web/app/(console)/mappings/page.tsx`.
- `apps/admin-web/features/mappings/**` và Mapping Playwright suite.
- HG-02 deterministic project/mapping seed và review checklist.

## Điều kiện mở phase

- MUI-04 automated pass.
- Current `/mapping-settings`, mapping-rules và ba refresh endpoints đã khóa ở MUI-00.

## Công việc

- Project/source/target system state nằm trong URL; systems, mapping types, options và flows lấy từ current `mapping-settings` response.
- Render `System → CIS` và `CIS → System` columns, `required_for_jira`, `issue_count/Seen`, existing approval status và unsaved state.
- Giữ row draft độc lập; save fail không xóa draft row khác và feedback gắn đúng row.
- `Save setting` giữ active semantics: operator submit row với `approval_status=approved`; không phát minh review lifecycle thứ hai.
- Đặt ba capability refresh tại Mappings: Pull Backlog fields, Pull Jira fields và Sync CIS mapping fields. Action hiển thị theo selected source/target context và endpoint hiện có, không yêu cầu cả ba button luôn đồng thời visible.
- Warning/replacement/error feedback gắn đúng action; refresh không làm mất row draft không liên quan.
- Đăng ký Mappings nav/refetch adapter; Global Refresh giữ URL selection và không bỏ row draft âm thầm.
- Không thêm snapshot metadata/table/fingerprint hoặc sửa mapping backend.
- Sau automated pass, giữ phase active và chờ HG-02.

## Checklist nghiệm thu

- [x] Hai mapping directions, required badge, Seen count và status render đúng response hiện tại.
- [x] System selector/options không hard-code ngoài current API response.
- [x] Ba refresh capability chỉ tồn tại ở Mappings và gọi đúng endpoint hiện có.
- [x] Row draft/save/error isolation hoạt động; save giữ active approved semantics.
- [x] Loading/empty/error/retry và URL state pass.
- [x] Mapping verifier và Playwright pass.
- [ ] HG-02 được user xác nhận.
- [ ] Manual check (Người review tại HG-02).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress — MUI-05 automated pass. Route Mappings hiển thị một cột dọc với hai native accordion `System → CIS` và `CIS → System`; header/chevron và bảng đã được chuẩn hóa để không vỡ dòng, không lộ native marker, giữ required/Seen/status, URL context, ba refresh action, row save với `approval_status=approved` và loading/empty/error/retry coverage. Đã kiểm tra `npm run verify:phase05`, `npm run verify:admin-ui-e2e`, `npm run admin:lint`, `npm run admin:typecheck` và `admin:build`. Chờ HG-02 review bundle Project Config + Mappings; chưa mở MUI-06.
