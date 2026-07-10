# Use Workbench

`docs/workbench/` là optional local workspace của một project. Guide chỉ giải thích boundary sử dụng; activation, owner, format và lifecycle do project quyết định.

Workbench chỉ hỗ trợ luồng documentation chuẩn, không thay thế nó. Một workbench-support agent chỉ được dùng sau local activation và phải handoff kết quả để standard agent hoặc workflow chuẩn cập nhật canonical home.

## Trước Khi Dùng

1. Đọc `docs/workbench/README.md` để biết workspace hiện có được kích hoạt hay chưa.
2. Đọc decision hoặc policy local của project nếu workspace đã được kích hoạt.

## Boundary

- Không dùng workbench như app truth hoặc meta contract.
- Không tạo canonical entity type, relation type, valid triple hoặc entity instance chỉ vì một workbench item tồn tại.
- Khi local policy đã có kết luận, cập nhật canonical home do project chỉ định.

Guide không định nghĩa field, status, review gate hoặc cleanup cho workbench item.
