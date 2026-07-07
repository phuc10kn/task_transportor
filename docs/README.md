# Native Theory App

Thư mục này là nền tảng tài liệu native dùng để tổ chức knowledge của app theo lớp, theory và meta-rule.

## Cách đọc nhanh

- `theories/README.md` là root index của theory system.
- `theories/governance.md` là governance chung cho boundary, split và tạo mới theory group.
- `app/` chứa application-specific docs theo layer của app.
- `meta/` chứa entity types, relation types, convention và validation rule.
- `guide/` là manual hướng dẫn cách đọc, viết, trace và evolve hệ docs.
- `AGENT_SKILLS/` chứa hướng dẫn cho agent khi đọc, tạo, review hoặc refine tài liệu.
- `backlog-theories/` chứa review/candidate knowledge chưa đủ hoặc chưa cần promote vào canonical docs.

## Trạng thái hiện tại

Theory system đã có nền usable:

- đã có root theory index;
- đã có root theory governance;
- đã materialize đủ 6 theory core trong `theories/`;
- app docs có thể route ngược về theory home ngay trong `app/`, `theories/` và `theories/governance.md`.

## Khi cần làm việc với theory

Đọc theo thứ tự:

1. `theories/README.md`
2. `theories/governance.md`
3. `app/README.md` nếu cần biết app hiện tại route về theory nào
4. `meta/README.md` nếu cần biết format, relation, status hay validation rule

Nếu câu hỏi là cách sử dụng toàn bộ hệ docs, đọc `guide/README.md` trước.

Migration record nằm trong `plans/migrate_new_docs/` nếu cần audit lịch sử chuyển đổi tài liệu.

Nếu câu hỏi là app hiện tại áp dụng theory như thế nào, đọc tiếp `app/`.

Nếu câu hỏi là format, status, relation hoặc validation, đọc tiếp `meta/`.
