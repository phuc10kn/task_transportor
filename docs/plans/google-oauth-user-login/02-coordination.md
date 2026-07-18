# Điều phối plan User login

## Trạng thái

Đã triển khai đủ scope AUTH-01 đến AUTH-03. `npm test`, `npm run admin:ci` và `npm run verify:admin-ui-e2e` đã pass ngày 2026-07-18.

## Thứ tự

1. AUTH-01: user/system role và password login.
2. AUTH-02: Google login backend.
3. AUTH-03: Admin UI, regression và docs.

Không triển khai Google UI trước khi user/password contract ổn định.

## Dependency với plan Team

- Team plan dùng `users.id`, `enabled`, `system_role` và `req.user` sau AUTH-03.
- Auth không chứa Team/Project policy.
- Không cần production rollout plan riêng trong tài liệu thiết kế này.

## Điểm cần user review khi hoàn tất

- Password login và Google login đều chạy.
- Google-first tạo CIS user role `user`; existing password user phải link Google tại `My account`.
- `system_admin` quản lý được user; ordinary user bị từ chối.
- Không có auto-registration hoặc quyền Project đến từ Google.

## Quy tắc mở rộng scope

Password reset/đổi password đã cấu hình, MFA, Google unlink/relink, link email khác hoặc shared SSO chỉ được thêm bằng yêu cầu/decision mới.
