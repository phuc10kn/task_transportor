# Overview: User identity và Google login

## Quyết định chức năng

- Identity canonical là `user`, không duy trì response contract `admin` mới.
- `system_role` chỉ có `system_admin` và `user`.
- User admin hiện tại được migrate thành `system_admin` để không mất quyền.
- User mới mặc định là `user`; chỉ `system_admin` được tạo user hoặc đổi system role.
- Password và Google cùng phát CIS JWT hiện tại và cùng dùng `req.user`.
- Google-first auto-provision CIS user với `system_role=user`, Google identity đã link và password chưa cấu hình.
- Password-first phải đăng nhập rồi link Google explicit tại `My account`; backend không tự ghép identity chỉ vì email trùng.
- Lưu Google `sub` và verified email để định danh ổn định; không lưu ID/access/refresh token. Google không quyết định role hoặc Project access.

## Data tối thiểu

```text
users
  id
  email UNIQUE
  name
  password_hash
  password_configured
  system_role CHECK(system_admin|user)
  enabled
  last_login_at
  created_at
  updated_at
```

```text
user_identities
  id
  user_id FK -> users.id
  provider = google
  provider_subject
  provider_email
  created_at
  updated_at
```

Mỗi user có tối đa một Google identity; mỗi Google `sub` chỉ thuộc một user. Google-first có password hash vô hiệu hóa và `password_configured=0` cho tới khi user tự đặt password.

## API mục tiêu

```http
POST /api/v1/auth/login
GET  /api/v1/auth/google/config
POST /api/v1/auth/google
POST /api/v1/auth/google/link
POST /api/v1/auth/password
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET   /api/v1/users
POST  /api/v1/users
PATCH /api/v1/users/:userId
```

- Password login giữ contract hiện tại nhưng response dùng `{ token, user }`; `user` và `/me` luôn có `system_role`.
- Google config chỉ trả `enabled` và public client ID.
- Google login nhận GIS `credential`, verify bằng `google-auth-library`, yêu cầu đúng audience/issuer/expiry, `sub` và `email_verified=true`, rồi lookup identity theo Google `sub`.
- Khi `sub` chưa tồn tại và email chưa thuộc CIS user, Google login tạo user role `user`. Khi email đã thuộc password user, login yêu cầu user đăng nhập password rồi link explicit; không auto-link.
- Link Google yêu cầu CIS session hiện tại, Google email verified trùng chính xác CIS email và Google `sub` chưa thuộc user khác.
- Google-first user được đặt password một lần tại `My account`; đổi/reset password nằm ngoài scope.
- Google login chỉ nhận JSON request từ exact `ADMIN_WEB_PUBLIC_ORIGIN`; request cross-origin bị từ chối.
- Missing, disabled, unknown hoặc token invalid đều trả lỗi login chung; không làm lộ user có tồn tại hay không.
- Create user nhận `email`, `name`, `initial_password`, `system_role?`; update chỉ nhận `name`, `system_role`; không trả hoặc log password/hash.

## Admin UI mục tiêu

- Login page giữ form email/password và thêm GIS button khi Google được bật; Google-first tạo user rồi vào cùng console.
- Google lỗi không làm hỏng normal login.
- Dùng session key mới `cis_user_token`; xóa key cũ `cis_admin_token` khi cutover.
- `/account` cho mọi user xem/cấu hình Password và link Google; email trên toolbar dẫn tới route này.
- `/users` chỉ dành cho `system_admin` để list/create/edit name và system role, không chứa Google system policy.

## Migration

1. Migrate `admin_users` sang `users` và giữ ID, email, password hash.
2. Backfill user hiện tại thành `system_admin` và `password_configured=1`.
3. Tạo `user_identities` cho Google `sub`/email.
4. Đổi repository, middleware, JWT principal và API response từ admin sang user.
5. Buộc đăng nhập lại sau cutover; không giữ hai contract song song.

## Cấu hình

```text
GOOGLE_LOGIN_ENABLED=false
GOOGLE_CLIENT_ID=<Google Web client ID>
PUBLIC_ORIGIN=<Admin Web origin>
```

- Không cần Google client secret.
- Khi flag tắt, password login hoạt động bình thường.

## Boundary

- Auth module sở hữu user, password, system role và CIS session.
- Auth expose internal `resolveEnabledUserByEmail(email)` trả safe user shape để Projects thêm member bằng exact email; không expose password hash hoặc global search.
- Google verifier nằm dưới `src/infrastructure/external/providers/google/` và được inject vào Auth; Auth không tự gọi Google HTTP.
- Team/Project authorization không được đặt trong Auth.

## Acceptance chính

- Normal login, logout và `/me` không regression.
- Google valid/invalid, first-login provisioning, explicit linking, email mismatch, user disabled và feature flag đều có test offline bằng fake verifier.
- User thường bị từ chối ở user-management API.
- Password và Google credential không xuất hiện trong log/response.
- UI có loading/error/retry và keyboard focus cơ bản.
