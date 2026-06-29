# Thiết lập Codex cho `task_transportor`

Thư mục này chứa hướng dẫn vận hành Codex cho dự án. Thông tin nghiệp vụ vẫn nằm trong `docs/work`; file trong `.codex` chỉ giúp bắt đầu phiên triển khai nhanh và ít lệch phạm vi.

## Luồng hiện tại

- Phiên bản đang triển khai: Lite.
- Phase bắt đầu: `docs/work/plans/lite/implement_plans/00-foundation.md`.
- Kiến trúc: modular monolith.
- Môi trường chạy: Node.js CommonJS, Express, SQLite.
- Đầu vào Lite: manual pull issue/project, scheduled pull optional.
- Translation Lite: `codex_exec` là provider chính.
- Không dùng `backlog2jira` làm nguồn thiết kế.

## Trước khi triển khai

Một phiên Codex mới nên đọc theo thứ tự:

1. `AGENTS.md`
2. `docs/work/plans/lite/implement_context.md`
3. `docs/work/plans/architecture/README.md`
4. `docs/work/plans/architecture/02-module-structure.md`
5. `docs/work/plans/lite/implement_plans/README.md`
6. File phase đang làm trong `docs/work/plans/lite/implement_plans/`

## Cách chạy theo phase

1. Mở file phase.
2. Triển khai đúng mục `Deliverables`.
3. Tạo hoặc cập nhật lệnh `npm run verify:phaseXX`.
4. Chạy `Unit test check (Agent)`.
5. Tick các checkbox Agent đã pass.
6. Để nguyên `Manual check (Người review)` cho người review tick sau.

## Mẫu lệnh nhanh

Mẫu lệnh tái sử dụng nằm trong:

- `.codex/prompts/implement-lite-phase.md`
- `.codex/prompts/self-check-lite-phase.md`

Config local có thể copy từ `.codex/config.toml.example` sang `.codex/config.toml`. Không commit file config thật.
