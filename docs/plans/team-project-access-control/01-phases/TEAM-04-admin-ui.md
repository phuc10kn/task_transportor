# TEAM-04 - Admin UI, test và docs

## Mục tiêu

- Hoàn thiện Project/Team UX và regression cho access model mới.

## Artifact mục tiêu

- Project list/create/config pages trong Admin Web
- Team panel và member controls
- Playwright/acceptance tests
- `docs/app/**` liên quan Team/Project access

## Điều kiện mở phase

- TEAM-03 pass.
- Đã đọc lại `docs/app/03-interface/README.md`.

## Công việc

- Dùng `ui-design` để bổ sung Team UI theo design direction hiện tại.
- Project list chỉ render Project user được phép mở.
- Create Project giải thích Team tự tạo và creator là owner/lead.
- Team panel: member read-only; lead thêm user bằng exact email và có remove/change-role controls.
- Khi mất access, clear active Project và về Project list không refresh loop.
- Dùng Playwright test creator/lead/member/outsider flows.
- Cập nhật product/interface/architecture/technical/quality docs.

## Checklist nghiệm thu

- [x] Project list/create và Team panel đúng permission.
- [x] UI có loading/empty/error/retry và keyboard focus cơ bản.
- [x] Access-lost flow không refresh loop.
- [x] API isolation, Admin UI tests, docs verification và `npm test` pass.

## Kết quả thực hiện
