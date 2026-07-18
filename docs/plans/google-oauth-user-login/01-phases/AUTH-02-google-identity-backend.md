# AUTH-02 - Google login

## Mục tiêu

- Cho existing CIS user đăng nhập bằng Google và nhận cùng CIS JWT như password login.

## Artifact mục tiêu

- `google-auth-library` dependency
- Google verifier dưới `src/infrastructure/external/providers/google/`
- Auth Google config/login use case và routes
- Google login tests dùng fake verifier

## Điều kiện mở phase

- AUTH-01 pass.
- User/session contract canonical đã ổn định.

## Công việc

- Thêm `GOOGLE_OAUTH_ENABLED`, `GOOGLE_OAUTH_CLIENT_ID` và public config endpoint.
- Verify GIS ID token bằng thư viện chính thức: audience, issuer, expiry và `email_verified`.
- Chỉ nhận JSON callback từ exact Admin Web origin.
- Lookup exact enabled CIS user bằng normalized verified email; không auto-create hoặc đổi role.
- Phát CIS JWT qua session issuer dùng chung và cập nhật `last_login_at`.
- Trả lỗi login chung cho invalid token, user missing hoặc disabled.
- Không lưu/log Google credential hoặc token; automated test không gọi Google thật.

## Checklist nghiệm thu

- [x] Feature flag tắt không ảnh hưởng password login.
- [x] Valid token của existing enabled user login thành công.
- [x] Invalid token, wrong audience, unverified email, missing/disabled user bị từ chối.
- [x] Google không tạo user hoặc thay đổi system role.
- [x] Password regression và fake-verifier tests pass.

## Kết quả thực hiện
