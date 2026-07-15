# MUI-04 — Project Config UI

## Mục tiêu

Chuyển Project Config active sang route thật, giữ current Project CRUD/credential behavior và form error preservation; không đưa mapping refresh vào màn này.

## Artifact mục tiêu

- `apps/admin-web/app/(console)/projects/page.tsx`.
- `apps/admin-web/features/projects/**` và `apps/admin-web/e2e/projects.spec.ts`.
- Project list/create/edit dùng current `/api/v1/projects` contract.

## Điều kiện mở phase

- HG-01 được xác nhận.
- MUI-00 Project visible-field/API matrix và MUI-03 primitives vẫn pass.

## Công việc

- Project list giữ cột Name, Backlog project key, Jira project key, Sync và Open action.
- Form giữ active fields: name; source/target language; enabled, sync, auto translate, translation review, mapping approval, manual pull, scheduled pull; Translation AI provider/transport/model; Backlog URL/project key/issue prefix/API key; Jira URL/project key/email/API token.
- Form chia `General configuration` luôn mở và hai accordion native `Backlog system`/`Jira system` mặc định mở; khi đóng chỉ ẩn UI của system tương ứng, không reset form state hoặc thay đổi payload.
- Translation AI options dùng constants/documented model list hiện tại của UI; không tạo config-options backend endpoint trong plan này.
- Giữ provider→transport→model dependency và warning hiện có.
- Credential input dùng current API semantics; không tuyên bố write-only/redacted khi backend chưa có contract đó.
- Validation/API error giữ toàn bộ input và focus field lỗi đầu tiên; success reload server truth.
- Project selection nằm trong `project_id` URL param; loading/empty/error/retry/success đầy đủ.
- Đăng ký Projects nav/refetch adapter; Global Refresh reload server truth và đi qua dirty-draft confirmation khi form đã sửa.
- Không có `Sync mapping fields`, `Pull Backlog fields` hoặc `Pull Jira fields` tại route này.
- Không thêm backend-only fields không xuất hiện trong active form.

## Checklist nghiệm thu

- [x] Project list giữ đúng visible columns active.
- [x] Toàn bộ active form field persist/reload đúng current API.
- [x] Provider→transport→model dependency và warning hoạt động.
- [x] Credential/validation error giữ form state; không claim security contract chưa tồn tại.
- [x] URL project selection, loading/empty/error/retry pass.
- [x] Route không chứa mapping refresh action.
- [x] Projects verifier và Project Playwright pass.
- [ ] Manual check (Người review tại HG-02).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress — HG-01 đã được user xác nhận. Project Config đã có General configuration, hai native system accordions, semantic blue theme, visible project columns, AI dependency/warning, validation focus-preservation, persistence/reload assertion và URL/loading/empty/error/retry coverage. Automated checks pass; còn chờ manual HG-02, chưa mở MUI-05.
