# PublicCapability

| Field | Value |
|-------|-------|
| **name** | PublicCapability |
| **layer** | `05-architecture` |
| **concern** | `01-structure` |
| **folder** | `public-capabilities/` |
| **ID pattern** | `PC-{NNN}-{slug}` |

## meaning

Capability công khai mà một module expose cho module khác hoặc cho edge layer gọi vào ở mức architecture.

## use when

Khi cần trả lời câu hỏi: module này cho phép người khác đi vào bằng hành động nào, mà chưa xuống mức technical contract hoặc function signature.

## role in the structure

- Là phần “bề mặt hành vi” của module.
- Bổ sung cho `Module`, vì chỉ biết module tồn tại là chưa đủ; còn phải biết nó mở cửa ở đâu.
- Giúp nối `Module` của architecture với `PublicContract` ở implementation.

## notes

- Không mô tả private helper hay method nội bộ.
- Không thay thế `Interface`; `Interface` ở `06-technical` nói về REST, webhook, CLI, file format.
- Trong `task_transportor`, các `*Api.js` là điểm bám code rõ nhất cho type này.
