# Workflows

## Luồng Tổng

```text
read-for-task
-> write-docs khi cần sửa
-> trace-impact khi có entity/relation/impact
-> slim-layer-readme khi README layer bị phình
```

Folder này mô tả cách thao tác với docs.

| File | Khi dùng |
| --- | --- |
| [read-for-task.md](read-for-task.md) | Cần đọc docs cho một task cụ thể. |
| [write-docs.md](write-docs.md) | Cần thêm hoặc sửa knowledge. |
| [trace-impact.md](trace-impact.md) | Cần kiểm tra impact/coverage/consistency. |
| [slim-layer-readme.md](slim-layer-readme.md) | Cần giảm lặp trong layer README. |
| [use-workbench.md](use-workbench.md) | Cần dùng local workbench đã được project kích hoạt. |

## Hỗ Trợ Tùy Chọn

`use-workbench.md` không phải một bước của Luồng Tổng. Chỉ mở workflow này khi project local đã kích hoạt workbench; workbench hỗ trợ case thường, không tạo luồng canonical song song và phải handoff lại các workflow ở trên.
