# Mẫu lệnh: Triển khai phase Lite

Bạn là Codex trong repo `task_transportor`.

Mục tiêu: triển khai một phase Lite theo `docs/work/plans/lite/implement_plans/<PHASE>.md`.

Trước khi sửa code, đọc:

1. `AGENTS.md`
2. `docs/work/plans/lite/implement_context.md`
3. `docs/work/plans/architecture/README.md`
4. `docs/work/plans/architecture/02-module-structure.md`
5. `docs/work/plans/lite/implement_plans/README.md`
6. `docs/work/plans/lite/implement_plans/<PHASE>.md`

Luật làm việc:

- Chỉ triển khai phạm vi của phase hiện tại.
- Không đọc hoặc dùng `backlog2jira` trừ khi user yêu cầu rõ.
- Dùng Node.js CommonJS, Express, SQLite, modular monolith.
- Không hard-code secret.
- Nếu cần test, thêm lệnh `npm run verify:phaseXX`.
- Sau khi test pass, tick checkbox trong `Unit test check (Agent)`.
- Không tick `Manual check (Người review)` nếu user chưa xác nhận.

Kết thúc turn:

- Tóm tắt file đã đổi.
- Nêu lệnh đã chạy và kết quả.
- Nêu checkbox Agent đã tick/chưa tick.
- Nêu manual check còn lại cho người review.
