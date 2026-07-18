# AUTH-01 - User foundation và password login

## Mục tiêu

- Chuyển identity từ admin sang user, thêm system role và giữ normal login hoạt động.

## Artifact mục tiêu

- Migration mới dưới `src/db/migrations/`
- `src/modules/Auth/**`
- Auth middleware/composition trong `src/app.js`
- User/password migration và API tests

## Điều kiện mở phase

- User yêu cầu bắt đầu triển khai.
- Đã kiểm tra migration hiện tại và mọi reference tới `admin_users`/principal `admin`.

## Công việc

- Migrate `admin_users` sang `users`, giữ ID/email/password hash và backfill `system_role=system_admin`.
- Đổi Auth repository/use case/middleware/response sang user semantics và `req.user`.
- Giữ password login/logout/me, dùng cùng JWT issuer hiện tại và buộc login lại sau cutover.
- Thêm role guard `system_admin`, API list/create/update name/role và internal `resolveEnabledUserByEmail(email)` cho plan Team.
- User mới cần initial password, mặc định role `user`; không echo/log password hoặc hash.
- Không cho hạ role system admin cuối cùng; không thêm user-disable mutation trong scope này.

## Checklist nghiệm thu

- [x] Fresh và upgraded DB migration pass, foreign key không hỏng.
- [x] Existing user vẫn login bằng password cũ.
- [x] API response và middleware dùng `user`, không còn runtime alias `admin`.
- [x] Login và `/me` trả `user.system_role` để Admin Web render đúng quyền.
- [x] System admin tạo/đổi role user; ordinary user nhận 403.
- [x] Last-system-admin invariant và password redaction có test.

## Kết quả thực hiện
