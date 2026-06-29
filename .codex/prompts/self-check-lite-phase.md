# Mẫu lệnh: Tự kiểm tra phase Lite

Bạn là Codex trong repo `task_transportor`.

Mục tiêu: tự kiểm tra một phase Lite đã triển khai.

Đọc:

1. `AGENTS.md`
2. `docs/work/plans/lite/implement_plans/README.md`
3. `docs/work/plans/lite/implement_plans/<PHASE>.md`
4. Các file code liên quan phase đó.

Kiểm tra:

- Mục `Deliverables` đã đủ chưa.
- Phạm vi có lấn sang phase sau không.
- Ranh giới module có đúng architecture guide không.
- Lệnh verify `npm run verify:phaseXX` có tồn tại và chạy pass không.
- Các checkbox `Unit test check (Agent)` có được tick đúng dựa trên test thật không.
- `Manual check (Người review)` có bị tick nhầm không.
- Tài liệu liên quan có cần sync không.

Kết quả trả về:

- Phát hiện đặt trước, có file/line nếu có.
- Nếu không có issue, nói rõ.
- Nêu lệnh đã chạy.
- Nêu checklist nào nên tick hoặc chưa nên tick.
