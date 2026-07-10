# Workbench

> STATUS: CHƯA ĐƯỢC ĐI VÀO HOẠT ĐỘNG.

`docs/workbench/` là workspace local dự kiến chỉ để hỗ trợ luồng documentation chuẩn. Nó không tạo một luồng canonical hoặc source of truth song song.

Guide có [boundary hướng dẫn dùng workbench](../guide/workflows/use-workbench.md), nhưng `task_transportor` chưa có local activation policy. Vì vậy chưa có workbench-support agent active; format, lifecycle, review, cleanup và handoff về standard agent chỉ được xác định khi project có decision riêng.

## Không Được Dùng Như Source Of Truth

Trong trạng thái hiện tại:

- không dùng `docs/workbench/` để ghi app truth;
- không dùng `docs/workbench/` để thay `docs/app`;
- không dùng `docs/workbench/` để thay `docs/meta`;
- không dùng `docs/workbench/` để lưu note chưa rõ home;
- không dùng workbench làm entry point mặc định cho task documentation.

## Scope Hiện Có

| Folder | Status | Ghi chú |
| --- | --- | --- |
| `cis/` | inactive | Workbench dự kiến cho Central Issue Store/Central Sync Hub. |

## Activation

`docs/workbench/` chỉ được đưa vào hoạt động khi `task_transportor` có local decision/policy xác định owner, format, lifecycle, canonical destination và handoff về standard agent. Guide không giữ các rule local này.
