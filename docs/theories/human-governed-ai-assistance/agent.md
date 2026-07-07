# TH-AI-GOV - Agent Notes

## Short rules

- AI hỗ trợ ra quyết định, không thay con người chịu trách nhiệm.
- Business review lifecycle phải ở layer nghiệp vụ, không ở transport.
- Không đóng business contract theo tên provider hoặc model.
- Reviewed result chỉ có hiệu lực sau owner apply.
- Confidence thấp là tín hiệu review, không là lý do tự động chấp nhận.

## Common violations

- Nhét logic review vào AI client hoặc adapter.
- Gọi provider cụ thể như thể nó là domain concept.
- Cho AI draft đi thẳng vào operational state.
- Trộn prompt/protocol detail vào business rule.
- Xem đổi provider là đổi meaning nghiệp vụ.

## Review checklist

- AI ở đây đang draft, analyze hay quyết định?
- Business layer và transport layer đã tách rõ chưa?
- Outcome reviewed có đi qua owner path không?
- Có chỗ nào đang buộc domain theo provider/model cụ thể không?
- Nếu thay transport, contract nghiệp vụ còn giữ nguyên không?

## Read-more triggers

- Đọc `theory.md` khi có tranh luận về auto-approve, low confidence, hoặc provider abstraction.
- Đọc `governance.md` khi AI bắt đầu được đòi quyền mutate trực tiếp operational state.
