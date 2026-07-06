# Theory

## Tuyên bố kiến trúc

Custom modular monolith là cách tổ chức một ứng dụng thành nhiều domain module có ownership rõ, nhưng vẫn chạy trong một deployable hoặc một runtime chính.

Nó không chỉ là chia folder. Nó là cách giữ:

- boundary rõ giữa các domain;
- public API rõ giữa các module;
- write ownership rõ cho business state;
- quyền linh hoạt có kiểm soát cho một số read-only snapshot.

## Vì sao không microservices ngay

Nhiều sản phẩm còn ở giai đoạn đầu cần:

- release nhanh;
- transaction nội bộ đơn giản;
- audit và debug tập trung;
- ít overhead vận hành.

Trong bối cảnh đó, modular monolith thường là bước hợp lý hơn microservices vì vẫn giữ được biên kiến trúc mà chưa phải trả chi phí network, deploy, tracing và data consistency của hệ phân tán.

## Vì sao không layered monolith thuần

Layered monolith dễ trượt thành controller, service và repository gọi chéo nhau mà không rõ owner thật của state.

Custom modular monolith siết chặt hơn ở:

- domain ownership;
- public API ownership;
- cross-module write ownership;
- import boundary.

## Pragmatic Hybrid là gì

Strict modular monolith thường muốn mọi module chỉ đọc dữ liệu của nhau qua API hoặc read model.

Pragmatic Hybrid giữ strict ở các chỗ gây bug nặng:

- import;
- controller ownership;
- public API ownership;
- cross-module write.

Nhưng cho phép một số read-only snapshot có allowlist khi:

- cùng runtime hoặc cùng application database;
- lợi ích về đơn giản và hiệu năng rõ ràng;
- chưa có nhu cầu extract service.

## Kết luận

Pattern này phù hợp khi muốn:

- bắt đầu với một codebase gọn;
- vẫn giữ kiến trúc đủ sạch để mở rộng;
- tránh biến shared database thành shared ownership.
