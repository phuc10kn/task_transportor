# Workflows

## Luồng Tổng

```text
read-for-task
-> write-docs khi cần sửa
-> trace-impact khi có entity/relation/impact
-> slim-layer-readme khi README layer bị phình
-> promote-candidate khi nội dung candidate đã đủ điều kiện
```

Không dùng trực tiếp `docs/workbench/` trong luồng trên vì workbench hiện chưa được đi vào hoạt động.

Folder này mô tả cách thao tác với docs.

| File | Khi dùng |
| --- | --- |
| [read-for-task.md](read-for-task.md) | Cần đọc docs cho một task cụ thể. |
| [write-docs.md](write-docs.md) | Cần thêm hoặc sửa knowledge. |
| [promote-candidate.md](promote-candidate.md) | Cần đưa candidate vào canonical docs. |
| [trace-impact.md](trace-impact.md) | Cần kiểm tra impact/coverage/consistency. |
| [slim-layer-readme.md](slim-layer-readme.md) | Cần giảm lặp trong layer README. |
