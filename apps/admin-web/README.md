# CIS Admin Web

Admin Web duy nhất của CIS dùng Tabler `1.4.0`, HTML và JavaScript thuần theo kiến trúc client-rendered MPA.

- `npm run dev -- --port 3001`: chạy UI và proxy `/api/v1/*` tới `CIS_API_ORIGIN`.
- `ADMIN_WEB_HOST` mặc định là `127.0.0.1`; chỉ đặt `0.0.0.0` khi production phục vụ trực tiếp qua public listener.
- `npm run build`: kiểm tra cú pháp và chặn dependency Next/React/TypeScript/Tailwind.
- `npm run e2e`: chạy acceptance Playwright của MPA.

Mỗi route console trả một HTML document thật; browser gọi public Express API qua same-origin proxy. UI không đọc SQLite và không sở hữu business rule.
