# MUI-15 — Cross-route acceptance

## Mục tiêu

Chạy full release-candidate acceptance trên Next app khi legacy source vẫn còn, rồi dừng tại HG-07 trước cleanup.

## Artifact mục tiêu

- `verify:admin-ui-acceptance`/`verify:phase07` aggregate current API regression, Next lint/typecheck/build và Playwright behavior tests.
- Full browser, responsive, accessibility và boundary evidence.
- HG-07 deterministic release-candidate URL/checklist.

## Điều kiện mở phase

- HG-06 được xác nhận.
- MUI-00 đến MUI-14 automated gates pass; không có backend blocker chưa tách.
- Legacy UI còn nguyên nhưng acceptance target chỉ trỏ Next app.

## Công việc

- Chuẩn hóa heading/action/filter/table/badge/toast/retry semantics giữa route.
- Keyboard-only đi qua navigation, filters, tables, dialogs và critical actions; focus trap/restore đúng.
- Kiểm `1440x900`, `1024x768`, `390x844`; không page overflow, table chỉ scroll trong container.
- Kiểm touch target, reduced-motion, contrast và selected axe WCAG A/AA rules.
- Clean install root/frontend/Chromium; chạy current API regression, all Playwright, lint, typecheck và production build.
- Boundary search: Next không import SQLite/backend modules, không gọi external Backlog/Jira host, không có business Route Handler/Server Action.
- Tất cả critical HTTP 202 flows phải có accepted/terminal-or-timeout evidence theo current API.
- Trace từng MUI-00 parity row tới Playwright assertion hoặc Human Gate scenario; không để behavior `Preserve`/`Intentional transform` không có owner/evidence.
- Với từng top-level route, assert nav reachability và Global Refresh gọi đúng read adapter, giữ URL/filter, không tạo mutation và tôn trọng dirty guard.
- Không dùng legacy source regex làm browser behavior acceptance.
- Sau automated pass, giữ phase active và chờ HG-07; không xóa legacy trước xác nhận.

## Checklist nghiệm thu

- [x] Full clean install/API/lint/typecheck/build/Playwright gate pass.
- [x] Tất cả route đạt active parity matrix và full data states.
- [x] Mọi MUI-00 parity row có automated hoặc Human Gate evidence; không có active control bị bỏ sót.
- [x] Keyboard/focus/touch/reduced-motion/three-viewports/axe gates pass.
- [x] Next source không vi phạm API/module/external-system boundary.
- [x] Legacy UI chưa bị sửa hoặc dùng làm acceptance target.
- [x] HG-07 được user xác nhận.
- [x] Manual check (Người review tại HG-07).
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu: MUI-15 - clean root/frontend install, `npm test`, `admin:ci`, boundary scans và full Playwright 39/39 pass; release-candidate touch target 44 px, three viewports, reduced-motion và selected axe WCAG A/AA có assertion. User đã xác nhận HG-07 để mở MUI-16 legacy removal.

| MUI-00 route/evidence | Automated hoặc Human Gate evidence |
| --- | --- |
| Login, Dashboard | `auth.spec.ts`, `smoke.spec.ts`, `release-candidate.spec.ts` |
| Projects, Mappings | `projects.spec.ts`, `mappings.spec.ts`, HG-02 |
| Backlog Issues | `backlog.spec.ts`, `backlog-actions.spec.ts`, HG-03 |
| CIS list/editor/recovery, Jira | `cis-issue-editor.spec.ts`, `issue-recovery.spec.ts`, `jira-preparation.spec.ts`, HG-04/HG-05 |
| Translation Queue, Glossary | `translation.spec.ts`, `translation-glossary.spec.ts`, HG-04 |
| Anomalies, Sync Jobs, Journal | `anomalies.spec.ts`, `operations.spec.ts`, HG-06 |
| Shell, nav, global refresh, viewport/a11y | `auth.spec.ts`, `release-candidate.spec.ts` |
