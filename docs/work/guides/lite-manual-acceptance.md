# Manual acceptance checklist Lite

Checklist này do người review chạy thủ công trên môi trường demo/local.

- [ ] Login UI bằng admin bootstrap.
- [ ] Tạo hoặc chỉnh project config từ UI.
- [ ] Trigger manual pull one issue từ UI. `Pull whole project` đang disable ở FE.
- [ ] Chạy worker và thấy issue mới trong issue list.
- [ ] Mở issue từ Issue list và vào Issue Editor.
- [ ] Kiểm tra `CIS CANONICAL`, `Source data` ba nhánh Backlog/CIS/Jira và trạng thái issue.
- [ ] Nếu cần translation, mở modal `Translations`, translate/retranslate, sửa text, `Approve + save` hoặc reject.
- [ ] Tạo và approve mapping bắt buộc từ UI.
- [ ] Mở modal `Jira sync` từ Issue Editor và thấy dry-run tự chạy, `can_sync`, warnings, payload preview.
- [ ] Nếu còn thiếu mapping/anomaly critical, UI hiển thị lý do block sync.
- [ ] Sửa payload nếu cần trong modal và trigger sync Jira từ UI khi đủ điều kiện.
- [ ] Xem sync job và journal sau sync.
- [ ] Retry/cancel job phù hợp trạng thái.
- [ ] Resolve hoặc ignore anomaly từ UI.
- [ ] Đối chiếu dashboard count với dữ liệu trong DB.
- [ ] Backup SQLite theo `docs/work/guides/lite-sqlite-backup.md`.
