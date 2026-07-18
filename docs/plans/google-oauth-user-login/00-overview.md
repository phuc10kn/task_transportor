# Overview: User identity và Google login

## Quyết định chức năng

- Identity canonical là `user`, không duy trì response contract `admin` mới.
- `system_role` chỉ có `system_admin` và `user`.
- User admin hiện tại được migrate thành `system_admin` để không mất quyền.
- User mới mặc định là `user`; chỉ `system_admin` được tạo user hoặc đổi system role.
- Password và Google cùng phát CIS JWT hiện tại và cùng dùng `req.user`.
- Google không auto-provision. Backend lấy email đã verify từ ID token rồi tìm exact user CIS enabled.
- Không lưu Google ID/access/refresh token. Google token không quyết định role hoặc Project access.

## Data tối thiểu

```text
users
  id
  email UNIQUE
  name
  password_hash
  system_role CHECK(system_admin|user)
  enabled
  last_login_at
  created_at
  updated_at
```

Không cần bảng Google identity hoặc login challenge trong scope hiện tại. Nếu sau này cần Google-only account, unlink/relink hoặc identity theo `sub`, phải mở decision riêng.

## API mục tiêu

```http
POST /api/v1/auth/login
GET  /api/v1/auth/google/config
POST /api/v1/auth/google
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET   /api/v1/users
POST  /api/v1/users
PATCH /api/v1/users/:userId
```

- Password login giữ contract hiện tại nhưng response dùng `{ token, user }`; `user` và `/me` luôn có `system_role`.
- Google config chỉ trả `enabled` và public client ID.
- Google login nhận GIS `credential`, verify bằng `google-auth-library`, yêu cầu đúng audience/issuer/expiry và `email_verified=true`, rồi lookup user theo normalized email.
- Google login chỉ nhận JSON request từ exact `ADMIN_WEB_PUBLIC_ORIGIN`; request cross-origin bị từ chối.
- Missing, disabled, unknown hoặc token invalid đều trả lỗi login chung; không làm lộ user có tồn tại hay không.
- Create user nhận `email`, `name`, `initial_password`, `system_role?`; update chỉ nhận `name`, `system_role`; không trả hoặc log password/hash.

## Admin UI mục tiêu

- Login page giữ form email/password và thêm GIS button khi Google được bật.
- Google lỗi không làm hỏng normal login.
- Dùng session key mới `cis_user_token`; xóa key cũ `cis_admin_token` khi cutover.
- Thêm route `/users` cho `system_admin` để list/create/edit name và system role.

## Migration

1. Migrate `admin_users` sang `users` và giữ ID, email, password hash.
2. Backfill user hiện tại thành `system_admin`.
3. Đổi repository, middleware, JWT principal và API response từ admin sang user.
4. Buộc đăng nhập lại sau cutover; không giữ hai contract song song.

## Cấu hình

```text
GOOGLE_OAUTH_ENABLED=false
GOOGLE_OAUTH_CLIENT_ID=<Google Web client ID>
ADMIN_WEB_PUBLIC_ORIGIN=<Admin Web origin>
```

- Không cần Google client secret.
- Khi flag tắt, password login hoạt động bình thường.

## Boundary

- Auth module sở hữu user, password, system role và CIS session.
- Auth expose internal `resolveEnabledUserByEmail(email)` trả `{ id, name, email }` để Projects thêm member bằng exact email; không expose password hash hoặc global search.
- Google verifier nằm dưới `src/infrastructure/external/providers/google/` và được inject vào Auth; Auth không tự gọi Google HTTP.
- Team/Project authorization không được đặt trong Auth.

## Acceptance chính

- Normal login, logout và `/me` không regression.
- Google valid/invalid, user missing/disabled và feature flag đều có test offline bằng fake verifier.
- User thường bị từ chối ở user-management API.
- Password và Google credential không xuất hiện trong log/response.
- UI có loading/error/retry và keyboard focus cơ bản.
