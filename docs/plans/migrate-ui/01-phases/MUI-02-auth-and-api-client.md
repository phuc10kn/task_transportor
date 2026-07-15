# MUI-02 — Auth và API client

## Mục tiêu

Tạo typed transport boundary, giữ Bearer auth/envelope hiện tại và protected routing để feature sau dùng chung error/timeout/401 semantics.

## Artifact mục tiêu

- `apps/admin-web/lib/api-client.ts`, auth provider/hooks và route allowlist.
- `/`, `/login`, protected console layout skeleton và `/dashboard` placeholder.
- Playwright auth/deep-link/back-forward suite dùng Express test API.

## Điều kiện mở phase

- MUI-01 pass; workspace/harness ổn định.
- Auth routes, localStorage key và current envelope đã được khóa ở MUI-00.

## Công việc

- API client unwrap `{ data }`, giữ server `{ error: { code, message, details } }` cho UI render.
- Dùng `localStorage["cis_admin_token"]` và `Authorization: Bearer` như UI cũ.
- HTTP 401 xóa token/auth state và redirect `/login`.
- Hỗ trợ AbortSignal và timeout profile transport; mutation timeout không được toast completed nếu chưa có server evidence.
- Auth provider gọi `/api/v1/auth/me`; protected layout không flash content trước khi auth resolved.
- `/` redirect `/dashboard`; login fail giữ email, chống double submit và hiển thị server error.
- Intended route chỉ nhận relative path thuộc console allowlist; unknown/external fallback `/dashboard`.
- Navigation dùng Next router/Link; refresh, deep-link và Back/Forward giữ route identity.
- Không thêm cookie/BFF/session backend hoặc data-fetching library.

## Checklist nghiệm thu

- [x] Client giữ đúng current success/error envelope và Bearer contract.
- [x] Auth provider không flash protected content và xử lý 401 đúng.
- [x] Login giữ email/error; sign out xóa token local.
- [x] Intended-route allowlist không tạo open redirect.
- [x] Deep-link, refresh và Back/Forward pass browser test.
- [x] Lint/typecheck/build/auth Playwright pass.
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu — thêm typed API/auth boundary, protected console shell, login route và Playwright auth harness; không sửa backend/API semantics.

Đã kiểm tra:

- `npm run admin:ci` — pass (lint, typecheck, build).
- `npm run verify:admin-ui-e2e` — pass (3 Playwright tests).

Auth E2E mock phần login để kiểm tra deterministic UI state; harness vẫn khởi động Express API thật và chạy login preflight nhằm bảo đảm backend contract tồn tại.
