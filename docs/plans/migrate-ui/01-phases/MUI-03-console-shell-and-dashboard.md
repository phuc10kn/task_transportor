# MUI-03 — Console shell và Dashboard

## Mục tiêu

Hoàn thiện visual foundation, responsive shell và Dashboard operational, sau đó mở HG-01.

## Artifact mục tiêu

- `apps/admin-web/app/(console)/layout.tsx`, route registry và global styles.
- Shared primitives và responsive navigation.
- `apps/admin-web/app/(console)/dashboard/page.tsx` cùng Dashboard feature/tests.
- HG-01 deterministic seed, local URL và review checklist.

## Điều kiện mở phase

- MUI-02 pass; auth/API client ổn định.
- Design direction và Dashboard endpoint/visible signals đã khóa ở MUI-00.

## Công việc

- Dùng Modern Operations Console: neutral slate, xanh dương dịu primary, semantic status color, spacing/radius 8 px và visible focus ring.
- Tạo Button, Input, Textarea, Select/MultiSelect, Checkbox, Badge, Table, Dialog, Toast và StatePanel dùng chung.
- Desktop sidebar; compact tablet/mobile navigation; skip link, active route, admin identity và sign out.
- Route registry định nghĩa nav entry và route-specific refetch adapter. Global Refresh gọi adapter của current route mà không đổi URL/filter; route có dirty form phải confirm trước khi bỏ draft. Các phase tạo/mở rộng route phải cập nhật registry theo contract này.
- Chỉ render nav item của route đã triển khai; chưa có dead link.
- Dashboard giữ sáu counters hiện hành: pull pending, pull failed, translation review, pending mapping, failed jobs, open anomalies; thêm health và alerts từ endpoint hiện tại.
- Alerts giữ các cột Type, Project, Issue, Status và Updated.
- Mỗi Dashboard surface có loading/empty/error/retry/success; không suy business state mới.
- Test keyboard/focus, reduced-motion, three viewports, no page overflow và selected axe WCAG A/AA rules.
- Sau automated pass, giữ phase active và chờ HG-01.

## Checklist nghiệm thu

- [x] Shared tokens/primitives nhất quán và keyboard/focus/touch đạt yêu cầu.
- [x] Shell responsive, route-aware, có current identity/logout và không dead link.
- [x] Global Refresh refetch current route; dirty draft không bị mất âm thầm.
- [x] Dashboard giữ đủ sáu counters, health, alerts và full data states.
- [x] Alert table giữ Type, Project, Issue, Status và Updated.
- [x] Retry chỉ refetch failed surface, không reset auth/shell.
- [x] Lint/typecheck/build/shell + Dashboard Playwright/axe pass.
- [x] HG-01 được user xác nhận.
- [x] Manual check (Người review tại HG-01).
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu — HG-01 đã được user xác nhận. Nền theme dùng semantic design tokens dùng chung cho shell, surface, field, navigation, button, badge, policy choice và state panel; không thay đổi backend hay API contract.

Đã kiểm tra:

- `npm run admin:lint` — pass.
- `npm run admin:typecheck` — pass.
- `CIS_API_ORIGIN=http://127.0.0.1:3000`, `NEXT_DIST_DIR=.next-ci`, `npm --prefix apps/admin-web run build` — pass.
- `npm run verify:admin-ui-e2e` — pass (4 Playwright tests, gồm deep-link, login error, theme persist sau reload, dashboard và Project Config light mode).
- Browser review automation tại `http://127.0.0.1:3001`: Dashboard và Project Config đã kiểm tra trực quan ở dark/light; light mode giữ canvas slate nhạt, surface trắng, field/policy readable và toggle icon đúng sau reload.

HG-01: user đã xác nhận, cho phép resume MUI-04.
