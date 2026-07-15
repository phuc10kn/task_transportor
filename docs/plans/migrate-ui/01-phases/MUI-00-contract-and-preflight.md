# MUI-00 — Active UI contract và preflight

## Mục tiêu

Khóa hành vi active của UI cũ, API endpoint hiện tại, visible-field matrix, runtime và baseline trước khi tạo Next app. Đây là phase verify-only; không sửa production behavior.

## Artifact mục tiêu

- `00-overview.md > Framework và package boundary` ghi exact Next/React versions cùng Node/npm minimum.
- `00-overview.md > Active UI parity matrix` được mở rộng thành exact route/endpoint/method/request/visible-field/action matrix bằng evidence từ legacy UI/API thật; mỗi row có classification `Preserve`, `Intentional transform`, `Interface addition` hoặc `Dead — exclude`.
- Section `Kết quả thực hiện` chỉ ghi execution note và kết quả lệnh theo format canonical.
- Danh sách dead legacy function bị loại khỏi requirement.
- Danh sách blocker thật: chỉ ghi khi một active behavior không có API hiện tại để thực hiện.

## Điều kiện mở phase

- Plan package tồn tại và không mâu thuẫn về scope.
- Executor đọc mandatory docs, interface truth, executor prompt và inventory working tree.
- Không dùng `backlog2jira` làm nguồn.

## Công việc

- Inventory navigation, render/bind path đang được gọi trong `public/admin/app.js`; không lấy function không reachable làm requirement.
- Với từng màn, khóa endpoint, method, request fields, HTTP 200/202/error body semantics, visible columns, form fields, control type, option source và action đang hoạt động.
- Trace mọi top-level control ngoài feature table, gồm Global Refresh, identity/logout và route navigation; không chỉ inventory API call trong content area.
- Xác nhận API hiện tại đủ cho Auth, Dashboard, Projects, Backlog, CIS Editor, Translation, Glossary, Mappings, Jira, Anomalies, Jobs và Journal.
- Khóa các chủ ý đã được interface truth ưu tiên hơn legacy placement: ba mapping refresh action chỉ nằm tại Mappings.
- Khóa canonical select options từ `field_meta.catalogs` và Jira select options từ `field_meta.catalogs_by_system.jira`; không hard-code hoặc đổi thành free text.
- Ghi rõ Pull project dùng persisted Project pull settings; candidate filters không phải request body của Pull project.
- Chạy `npm test` baseline và ghi pass/fail trung thực.
- Ghi local/production ports, `CIS_API_ORIGIN`, current UI/API services và Node minimum của exact stable Next version dự kiến.
- Nếu phát hiện backend improvement nhưng active UI vẫn làm được, đưa vào accepted gap; không tạo backend phase.

## Checklist nghiệm thu

- [x] Mỗi route mới có active endpoint/action/visible-field matrix đo được.
- [x] Mỗi behavior có đúng một parity classification và phase owner; không còn active control chưa được sở hữu.
- [x] Dead legacy behavior đã được phân biệt khỏi active behavior.
- [x] Không có schema/API/state-machine redesign được đưa vào critical path.
- [x] Pull project và candidate filter scope được khóa rõ.
- [x] Exact stable Next/React version, Node minimum và security status đã được ghi.
- [x] `npm test` baseline đã chạy và kết quả được ghi.
- [x] Mọi blocker thật có endpoint/evidence; improvement không bắt buộc nằm trong accepted gaps.
- [x] Không sửa source/runtime production.
- [x] Unit test check (Agent).

## Kết quả thực hiện

No-change — verify-only; không sửa production source/runtime.

- Endpoint/action/visible-field matrix đã được khóa từ `public/admin/app.js`, `src/modules/*/http/routes.js` và `scripts/verify/admin-ui-acceptance.js`.
- Đã phân loại Preserve, Intentional transform, Interface addition và Dead — exclude; không phát hiện blocker backend cho active UI.
- Runtime snapshot: Express API local `3000`, legacy static UI `8000`; production profile legacy `3001/8001`; `CIS_API_ORIGIN` chưa tồn tại và được giao cho MUI-01.
- Frontend pin: Next `16.2.10`, React/React DOM `19.2.7`, Node minimum `20.9.0`, npm workspace `11.11.0`.
- Security evidence: audit mặc định phát hiện 2 moderate PostCSS advisories; audit với `overrides.postcss=8.5.10` trả `found 0 vulnerabilities`. Override là bắt buộc trong MUI-01.
- `npm test` — pass.
