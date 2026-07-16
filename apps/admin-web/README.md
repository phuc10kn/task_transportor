# CIS Admin Web

Admin Web duy nhất của CIS dùng Tabler `1.4.0`, HTML và JavaScript thuần theo kiến trúc client-rendered MPA.

- `npm run dev -- --port 3001`: chạy UI và proxy `/api/v1/*` tới `CIS_API_ORIGIN`.
- `ADMIN_WEB_HOST` mặc định là `127.0.0.1`; chỉ đặt `0.0.0.0` khi production phục vụ trực tiếp qua public listener.
- `npm run build`: kiểm tra cú pháp và chặn dependency Next/React/TypeScript/Tailwind.
- `npm run e2e`: chạy acceptance Playwright của MPA.

Mỗi route console trả một HTML document thật; browser gọi public Express API qua same-origin proxy. UI không đọc SQLite và không sở hữu business rule.

- Route toàn cục: `/login`, `/projects`.
- Route workspace: `/project/:projectId/dashboard`, `/project/:projectId/mappings`, `/project/:projectId/backlog-issues`, `/project/:projectId/cis-issues`, `/project/:projectId/cis-issues/:issueId`, `/project/:projectId/translation-queue`, `/project/:projectId/translation-glossary`, `/project/:projectId/anomalies`, `/project/:projectId/sync-jobs`, `/project/:projectId/journal`.
- `projectId` trong path là workspace authority. Không dùng route workspace toàn cục hoặc query `project_id` làm fallback.
