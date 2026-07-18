# Plan: User login bằng mật khẩu và Google

## Mục tiêu

Đổi Auth từ mô hình admin duy nhất sang user có system role, giữ đăng nhập email/password và thêm đăng nhập Google cho user CIS đã tồn tại.

## Trong scope

- User model với hai system role: `system_admin`, `user`.
- Normal login bằng email/password.
- Google login bằng Google Identity Services.
- Google chỉ xác thực danh tính; CIS giữ role và quyền.
- System admin tạo và đổi role user.
- Admin Web có hai cách đăng nhập và màn Users.
- Migration dữ liệu admin hiện tại, test và cập nhật docs.

## Ngoài scope

- Public registration hoặc Google tự tạo user CIS.
- Google-only account, password reset, invitation email và MFA.
- User disable/recovery; phần này phải được thiết kế cùng owner transfer nếu bổ sung sau.
- Team, membership, Project owner và Project access; phần này nằm tại [team-project-access-control](../team-project-access-control/README.md).
- Refactor Pino/external-provider, proxy topology, custom login challenge store hoặc production release engineering.

## Baseline trước triển khai

- Auth đang dùng `admin_users`, principal `admin` và chỉ có email/password.
- Admin Web lưu `cis_admin_token` và chưa có Google button hoặc màn Users.

Chi tiết contract mục tiêu nằm tại [00-overview.md](./00-overview.md).

## Source of truth

1. Yêu cầu user: normal login + Google login + phân system role.
2. `docs/app/02-product/README.md` và `docs/app/10-decisions/README.md`.
3. `docs/app/03-interface/README.md` và `docs/app/05-architecture/**`.
4. Tài liệu chính thức của Google Identity Services.

## Phase triển khai

| Thứ tự | Phase | Kết quả |
| ---: | --- | --- |
| 1 | [AUTH-01 - User foundation và password login](./01-phases/AUTH-01-user-role-password-login.md) | User/system role và normal login hoạt động |
| 2 | [AUTH-02 - Google login](./01-phases/AUTH-02-google-identity-backend.md) | Existing CIS user đăng nhập được bằng Google |
| 3 | [AUTH-03 - Admin UI, test và docs](./01-phases/AUTH-03-admin-ui.md) | Hai login flow và user management hoàn chỉnh |

## Checklist hoàn thành

- [x] Password login vẫn hoạt động sau migration.
- [x] Google login chỉ nhận user CIS đã tồn tại, enabled và có email Google đã verify.
- [x] Google không tự gán system role hoặc Project access.
- [x] `system_admin` tạo/đổi role user; `user` không gọi được user-management API.
- [x] Admin UI, automated tests và docs pass.

## Điều phối

Trạng thái và bằng chứng verify nằm tại [02-coordination.md](./02-coordination.md).
