# Trạng thái thiết kế

Đây là bộ tài liệu thiết kế/working notes cho Central Sync Hub/CIS. Các file `09` đến `12` đã bổ sung implementation spec cho runtime, state machine, webhook verification và API contract.

## Nguồn ưu tiên khi implement

Khi có mâu thuẫn giữa các tài liệu, ưu tiên theo thứ tự:

1. Quyết định mới trong `docs/work/plans/*`.
2. Context phiên bản đang implement, ví dụ `docs/work/plans/lite/implement_context.md`.
3. Quyết định gốc trong `docs/work/implement-interview.md`.
4. Spec nền trong `docs/work/01-*.md` đến `12-*.md`.

## Việc cần rà lại khi bắt đầu code

- Chi tiết payload thực tế của Backlog/Jira sau khi có sample thật.
- Command/profile cụ thể cho `codex_exec` trong Lite.
- UI/UX chi tiết cho review queue, mapping approval và anomaly handling.
- Backup/restore SQLite trên server nội bộ.
- Chính sách retention/cleanup khi dữ liệu thực tế tăng.

## Scope phiên bản

Phiên bản được quản lý trong [plans/README.md](plans/README.md):

- Lite: manual/scheduled pull, CIS, `codex_exec` translation, human review, dry-run và CIS -> Jira.
- Medium: thêm webhook Backlog/Jira, Jira -> CIS, attachment file thật và UI vận hành đầy đủ hơn.
- Full: mở rộng hai chiều đầy đủ, CIS -> Backlog, learning/operation/reporting sâu hơn.
