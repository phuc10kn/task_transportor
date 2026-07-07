# TH-MODULAR - Agent Notes

## Short rules

- Module là boundary nghiệp vụ trước khi là folder.
- Chỉ gọi capability qua public API của module owner.
- Cross-module write là ngoại lệ mạnh, không phải đường mặc định.
- Shared database không tự động tạo shared ownership.
- Shared infrastructure được phép tồn tại nếu nó không giữ business decision.
- Nếu một module phải lộ quá nhiều internals để module khác dùng, boundary đang sai.

## Common violations

- Import sâu vào `application/`, `infrastructure/` hoặc `support/` của module khác.
- Gọi thẳng repository của module owner để ghi state.
- Nhét orchestration nghiệp vụ vào shared layer kỹ thuật.
- Đồng nhất “đang chạy chung process” với “được quyền truy cập trực tiếp”.
- Tạo module mỏng chỉ làm pass-through cho mọi thứ.

## Review checklist

- Capability này có owner module rõ chưa?
- Consumer đang đi qua public API hay chọc vào internals?
- Quyền ghi state đang thuộc đúng owner chưa?
- Shared component này có đang lén giữ business rule không?
- Boundary có giúp module tiến hóa độc lập hơn không?
- Nếu mai sau tách runtime, boundary hiện tại còn đứng được không?

## Read-more triggers

- Đọc `theory.md` khi có tranh luận về shared DB, read allowlist, hoặc microservice trigger.
- Đọc `governance.md` khi một cụm rule bắt đầu nói sang hub flow, canonical state, hoặc sync safety.
