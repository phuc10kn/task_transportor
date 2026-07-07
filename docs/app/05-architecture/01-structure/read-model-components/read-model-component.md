# ReadModelComponent

| Field | Value |
|-------|-------|
| **name** | ReadModelComponent |
| **layer** | `05-architecture` |
| **concern** | `01-structure` |
| **folder** | `read-model-components/` |
| **ID pattern** | `RMC-{NNN}-{slug}` |

## meaning

Architectural unit tối ưu cho đọc, reporting hoặc operations view hơn là owner write.

## use when

Khi component đọc từ nhiều owner để tạo dashboard, projection hoặc query view.

## notes

- Không nên dùng type này để che giấu business ownership.
- `Dashboard` là ngữ liệu hiện tại của repo.
