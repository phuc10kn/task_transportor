# Architecture Direction

## Modular monolith

Dự án đi theo hướng **custom modular monolith**. Source of truth cho lý thuyết, module structure, boundary, data tier, evolution và luật implement nằm trong folder [../architechture/custom_modular_monolith/](../architechture/custom_modular_monolith/).

Các file bắt đầu:

- [../architechture/custom_modular_monolith/overview.md](../architechture/custom_modular_monolith/overview.md)
- [../architechture/custom_modular_monolith/theory.md](../architechture/custom_modular_monolith/theory.md)
- [../architechture/custom_modular_monolith/module_structure.md](../architechture/custom_modular_monolith/module_structure.md)
- [../architechture/custom_modular_monolith/implement_rules.md](../architechture/custom_modular_monolith/implement_rules.md)

File này chỉ giữ hướng kiến trúc chung. Không cập nhật lý thuyết hoặc luật modular monolith tại đây.

Không tách microservice trong giai đoạn đầu. Lite và Medium ưu tiên vận hành đơn giản: API, worker, scheduler và adapter cùng nằm trong một app Node.js.

## Product model

Mọi phiên bản đều giữ model:

```text
System -> CIS -> System
```

Trong đó:

- System có thể là Backlog, Jira hoặc hệ thống khác sau này.
- CIS là trung tâm lưu issue, revision, comment, attachment metadata, mapping, translation, anomaly, job và journal.
- Không để Backlog gọi Jira trực tiếp.
- Không để route/controller gọi external API rồi bỏ qua CIS/job/journal.

## Vai trò của architecture guide

Architecture guide dùng để:

- Đặt ngôn ngữ chung khi thiết kế module mới.
- Giữ hướng phát triển thống nhất giữa Lite, Medium và Full.
- Là template trước khi viết spec chi tiết.
- Tránh biến mỗi tính năng thành một kiểu code riêng.

Architecture guide không dùng để:

- Chốt toàn bộ endpoint chi tiết.
- Chốt toàn bộ schema column.
- Thay thế spec của từng version.
- Ép mọi module phải có cùng độ phức tạp.

## Nguyên tắc phát triển

1. Bắt đầu đơn giản, nhưng không phá đường mở rộng.
2. Mọi data external vào CIS trước.
3. Mọi outbound thật đi sau dry-run/pre-check nếu có rủi ro ghi sang hệ ngoài.
4. Worker/job xử lý việc nặng; request handler trả nhanh khi có thể.
5. Integration adapter không sở hữu business state.
6. Mapping đi qua CIS canonical, không map system-to-system trực tiếp.
7. Tài liệu version nói "làm gì"; architecture nói "làm theo kiểu nào".
