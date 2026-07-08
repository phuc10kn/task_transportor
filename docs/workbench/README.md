# Workbench

> STATUS: CHƯA ĐƯỢC ĐI VÀO HOẠT ĐỘNG.

`docs/workbench/` là khu vực dự kiến dùng để biến ý tưởng, quan sát từ code hoặc câu hỏi về app thành candidate entity, candidate relation và review record trước khi promote vào docs canonical.

Folder này hiện **chưa được đi vào hoạt động** vì khung quản lý trong `docs/guide/` chưa định nghĩa đầy đủ:

- lifecycle chính thức cho workbench item;
- schema bắt buộc cho candidate entity/relation;
- review gate để promote vào `docs/app` hoặc `docs/meta`;
- rule cleanup sau khi promote/reject;
- agent checklist để tránh biến workbench thành source of truth song song.

## Không Được Dùng Như Source Of Truth

Trong trạng thái hiện tại:

- không dùng `docs/workbench/` để ghi app truth;
- không dùng `docs/workbench/` để thay `docs/app`;
- không dùng `docs/workbench/` để thay `docs/meta`;
- không dùng `docs/workbench/` để lưu note chưa rõ home;
- không promote nội dung từ workbench nếu `docs/guide` chưa có activation gate rõ ràng.

## Mục Tiêu Dự Kiến

Sau khi được kích hoạt bằng guide/harness riêng, workbench sẽ hỗ trợ luồng:

```text
idea/code observation
-> candidate entity
-> candidate relation
-> review
-> promote to docs/app or docs/meta
-> cleanup workbench item
```

## Scope Hiện Có

| Folder | Status | Ghi chú |
| --- | --- | --- |
| `cis/` | inactive | Workbench dự kiến cho Central Issue Store/Central Sync Hub. |

## Activation Gate

`docs/workbench/` chỉ được đưa vào hoạt động khi `docs/guide/` có tài liệu chính thức cho:

- khi nào tạo workbench item;
- format bắt buộc của workbench item;
- ai/luồng nào review candidate;
- điều kiện promote/reject/split/merge;
- cách xóa hoặc đóng item sau khi quyết định.
