# AUTH-02 - Google login

## Mục tiêu

- Cho Google-first user tự nhận CIS user role `user`; password-first user link Google explicit và cả hai nhận cùng CIS JWT.

## Artifact mục tiêu

- `google-auth-library` dependency
- Google verifier dưới `src/infrastructure/external/providers/google/`
- Auth Google config/login use case và routes
- `user_identities`, link Google và one-time password setup
- Google login tests dùng fake verifier

## Điều kiện mở phase

- AUTH-01 pass.
- User/session contract canonical đã ổn định.

## Công việc

- Thêm `GOOGLE_OAUTH_ENABLED`, `GOOGLE_OAUTH_CLIENT_ID` và public config endpoint.
- Verify GIS ID token bằng thư viện chính thức: audience, issuer, expiry và `email_verified`.
- Chỉ nhận JSON callback từ exact Admin Web origin.
- Lookup Google identity bằng verified `sub`; identity đã link đăng nhập đúng CIS user enabled.
- Google-first tạo CIS user role `user`; không lấy role hoặc Project access từ Google.
- Nếu verified email đã thuộc password user, yêu cầu login password và link explicit tại `My account`; không auto-link theo email.
- Link yêu cầu Google email trùng CIS email và `sub` chưa thuộc user khác.
- Phát CIS JWT qua session issuer dùng chung và cập nhật `last_login_at`.
- Trả lỗi login chung cho invalid token, user missing hoặc disabled.
- Không lưu/log Google credential hoặc token; automated test không gọi Google thật.

## Checklist nghiệm thu

- [x] Feature flag tắt không ảnh hưởng password login.
- [x] Valid linked identity đăng nhập đúng CIS user; Google-first tạo user role `user`.
- [x] Invalid token, wrong audience, unverified email, disabled user và identity conflict bị từ chối.
- [x] Existing password user không bị auto-link theo email; link explicit được kiểm tra.
- [x] Google-first user có thể đặt password một lần mà không tạo user thứ hai.
- [x] Password regression và fake-verifier tests pass.

## Kết quả thực hiện
