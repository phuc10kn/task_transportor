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
- Trong `task_transportor`, có thể dùng sau này cho cụm `core CIS`, `integration`, `operations`.
