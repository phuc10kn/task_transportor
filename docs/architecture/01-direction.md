# Architecture Direction

## Pattern được chọn

`task_transportor` áp dụng pattern **custom modular monolith**.

Pattern chung được giải thích ở [custom_modular_monolith_theory/overview.md](custom_modular_monolith_theory/overview.md). File này chốt cách repo hiện tại dùng pattern đó cho sản phẩm Central Sync Hub.

Không tách microservice trong giai đoạn đầu. Lite và Medium ưu tiên một app Node.js duy nhất, gồm API, worker, scheduler và các adapter tích hợp.

## Product model của repo

Mọi phiên bản đều giữ model:

```text
System -> CIS -> System
```

Trong repo hiện tại:

- `System` có thể là Backlog, Jira hoặc hệ thống khác sau này.
- `CIS` là lõi nghiệp vụ và canonical store của sản phẩm.
- Không cho phép sync trực tiếp `System -> System` bỏ qua CIS.
- Không cho phép route/controller gọi external API rồi ghi state tắt, bỏ qua job, journal hoặc audit.

## Ý nghĩa thực tế với `task_transportor`

- Inbound luôn vào CIS trước, sau đó mới tới translation, mapping, anomaly và outbound.
- Outbound thật sang Jira phải đi sau dry-run và pre-check.
- External adapter không sở hữu business state của CIS.
- AI chỉ draft hoặc propose; quyết định vận hành cuối cùng vẫn nằm ở human hoặc policy đã duyệt.

## Runtime mặc định

- Node.js CommonJS.
- Express API.
- SQLite cho MVP.
- Một service duy nhất ở Lite và phần lớn Medium.
- Worker nội bộ xử lý việc nặng thay cho request handler khi phù hợp.

## Cách dùng bộ tài liệu này

- Dùng `docs/architecture/*` khi cần biết repo hiện tại đang tổ chức module, boundary và flow ra sao.
- Dùng `docs/architecture/custom_modular_monolith_theory/*` khi cần lý giải pattern tổng quát, template hoặc checklist generic.

## Nguyên tắc phát triển

1. Bắt đầu đơn giản nhưng không phá đường mở rộng.
2. Mọi data external vào CIS trước.
3. Mọi outbound thật đi sau dry-run hoặc pre-check khi có rủi ro ghi sang hệ ngoài.
4. Worker hoặc job xử lý việc nặng; request handler trả nhanh khi có thể.
5. Integration adapter không sở hữu business state.
6. Mapping đi qua canonical CIS, không map system-to-system trực tiếp.
7. Tài liệu version nói "làm gì"; architecture nói "repo này làm theo kiểu nào".
