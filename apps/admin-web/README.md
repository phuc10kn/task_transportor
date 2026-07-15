# CIS Admin Web

Admin Web duy nhất của CIS dùng Tabler `1.4.0`, HTML và JavaScript thuần theo kiến trúc client-rendered MPA.

- `npm run dev -- --port 3001`: chạy UI và proxy `/api/v1/*` tới `CIS_API_ORIGIN`.
- `npm run build`: kiểm tra cú pháp và chặn dependency Next/React/TypeScript/Tailwind.
- `npm run e2e`: chạy acceptance Playwright của MPA.

Mỗi route console trả một HTML document thật; browser gọi public Express API qua same-origin proxy. UI không đọc SQLite và không sở hữu business rule.
