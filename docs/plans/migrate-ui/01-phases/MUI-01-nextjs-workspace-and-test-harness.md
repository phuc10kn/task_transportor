# MUI-01 — Next.js workspace và test harness

## Mục tiêu

Tạo frontend package reproducible và browser-test topology chạy Next cùng Express test API hiện tại, chưa xây feature UI.

## Artifact mục tiêu

- `apps/admin-web` với exact Next/React/TypeScript/Tailwind/ESLint/Playwright dependencies và lockfile riêng.
- Pin `next@16.2.10`, `react@19.2.7`, `react-dom@19.2.7` và `overrides.postcss=8.5.10` theo MUI-00 security preflight.
- Root scripts cho install/dev/start/lint/typecheck/build/e2e.
- `next.config.ts`, `playwright.config.ts`, test server/seed/teardown helpers.
- `.gitignore` cho `.next`, Playwright report/test-results và frontend local artifacts.
- `apps/admin-web/README.md` ghi local/test/build/start contract.

## Điều kiện mở phase

- MUI-00 pass; API parity matrix, runtime và versions đã khóa.
- Executor đã đọc `admin-ui-nextjs`, `ui-design` và interface truth.
- Không có backend blocker cho active behavior.

## Công việc

- Giữ root package CommonJS; frontend là package boundary riêng.
- Thêm `admin:install`, `admin:ci`, `admin:dev`, `admin:start`, `admin:lint`, `admin:typecheck`, `admin:build`, `admin:e2e:install`, `verify:admin-ui-e2e`.
- Rewrite relative `/api/v1/:path*` tới server-only `CIS_API_ORIGIN`; missing env fail rõ.
- Playwright khởi động Express test API bằng temp SQLite/fake external adapters hiện có và Next test server.
- Wait readiness, seed deterministic data, teardown process/timer/temp storage sau suite.
- Tạo smoke route tối thiểu để chứng minh build/start/rewrite; chưa triển khai auth hoặc feature.
- Mở rộng `scripts/verify/pr-change-manifest.config.json` và test liên quan cho `apps/admin-web/**`; không tạo GitHub Actions workflow mới trong phase này.
- Không sửa `src/modules/**`, schema hoặc API contract.

## Checklist nghiệm thu

- [x] Frontend package và lockfile clean-install được.
- [x] Next/React versions đạt current security requirements và Node minimum.
- [x] Root scripts chạy đúng frontend package.
- [x] Express + Next harness start/teardown deterministic, không leak process/timer.
- [x] Same-origin rewrite hoạt động; browser không biết API host.
- [x] Generated frontend/Playwright artifacts được ignore.
- [x] Lint/typecheck/build/workspace smoke và current API verifier pass.
- [x] Không có backend production behavior bị đổi.
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu — tạo foundation Next.js và harness, chưa xây feature nghiệp vụ.

- `apps/admin-web` pin Next/React/TypeScript/Tailwind/ESLint/Playwright, lockfile riêng và PostCSS security override.
- Same-origin rewrite `/api/v1/*` dùng server-only `CIS_API_ORIGIN`; thiếu env sẽ fail rõ.
- Smoke route `/login`, Playwright config và Express temp-API/Next dev harness đã chạy deterministic cleanup.
- `npm run admin:ci` — pass (lint, typecheck, build).
- `npm run admin:e2e:install` — pass.
- `npm run verify:admin-ui-e2e` — pass (1 Playwright test).
- Không sửa `src/modules/**`, schema hoặc API contract.
