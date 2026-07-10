# ModuleGroup

| Field | Value |
|-------|-------|
| **name** | ModuleGroup |
| **layer** | `05-architecture` |
| **concern** | `01-structure` |
| **folder** | `module-groups/` |
| **ID pattern** | `MG-{NNN}-{slug}` |

## meaning

Nhóm module có liên hệ chặt về capability hoặc lifecycle kiến trúc.

## use when

Khi project cần nói về một cụm như `core-domain`, `integration`, `operations`, `review`.

## notes

- Dùng để tổ chức architecture map, không thay ownership của từng module.
- Project chỉ tạo type này khi nhóm module giúp đọc architecture tốt hơn mà không làm mờ ownership từng module.
