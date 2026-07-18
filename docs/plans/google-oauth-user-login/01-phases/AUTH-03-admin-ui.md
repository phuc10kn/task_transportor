# AUTH-03 - Admin UI, test và docs

## Mục tiêu

- Hoàn thiện hai login flow, `My account` và user-management UI trên Admin Web hiện tại.

## Artifact mục tiêu

- `apps/admin-web/public/pages/auth.js`
- `apps/admin-web/public/pages/users.js`
- `apps/admin-web/public/pages/account.js`
- Shared navigation/session code và CSS liên quan
- Playwright/acceptance tests
- `docs/app/**` liên quan Auth

## Điều kiện mở phase

- AUTH-02 pass.
- Đã đọc lại `docs/app/03-interface/README.md`.

## Công việc

- Dùng `ui-design` để giữ design direction hiện tại, không redesign ngoài login/Users.
- Giữ password form và thêm GIS button khi config enabled.
- Xử lý loading/error/retry; Google lỗi không xóa password input.
- Cut over session/navigation từ admin sang user và xóa `cis_admin_token`.
- Thêm `/account` cho mọi user: xem Password/Google, link Google và đặt password cho Google-first user.
- Giữ `/users` gọn cho system admin: list, create, sửa name và đổi role; không đặt Google policy/config tại đây.
- Dùng Playwright kiểm password login, Google callback giả lập, role denial và basic accessibility.
- Cập nhật product/interface/architecture/technical/quality docs đúng behavior đã triển khai.

## Checklist nghiệm thu

- [x] Feature off chỉ hiển thị password login; feature on hiển thị Google button và Google-first vào cùng CIS user flow.
- [x] Hai login flow lưu CIS token và redirect đúng.
- [x] Password-first link Google tại `My account`; Google-first đặt password tại cùng màn.
- [x] Ordinary user không thấy và không gọi được user management.
- [x] UI error giữ input, có retry và focus rõ.
- [x] Auth tests, Admin UI tests, docs verification và `npm test` pass.

## Kết quả thực hiện
