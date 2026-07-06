# Native Theory App

Thư mục này là nền tảng tài liệu native dùng để tổ chức knowledge của app theo lớp, theory và meta-rule.

## Cách đọc nhanh

- `theories/README.md` là root index của theory system.
- `theories/governance.md` là governance chung cho boundary, split và tạo mới theory group.
- `app/` chứa application-specific docs theo layer của app.
- `meta/` chứa entity types, relation types, convention và validation rule.
- `AGENT_SKILLS/` chứa hướng dẫn cho agent khi đọc, tạo, review hoặc refine tài liệu.

## Trạng thái hiện tại

Theory system đang ở giai đoạn foundation:

- đã có root theory index;
- đã có root theory governance;
- đã có active theory set v1 ở trạng thái `planned`;
- các theory folder chi tiết sẽ được materialize theo `docs/plan/import_theories`.

## Khi cần làm việc với theory

Đọc theo thứ tự:

1. `theories/README.md`
2. `theories/governance.md`
3. `docs/plan/import_theories/README.md`
4. phase cụ thể trong `docs/plan/import_theories/<phase>/README.md`

Nếu câu hỏi là app hiện tại áp dụng theory như thế nào, đọc tiếp `app/`.

Nếu câu hỏi là format, status, relation hoặc validation, đọc tiếp `meta/`.
