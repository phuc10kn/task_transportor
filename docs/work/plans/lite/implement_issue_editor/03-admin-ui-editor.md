# Cập nhật IE-03 - Issue Editor là màn chính của issue

Quyết định mới:

- `Issue Editor` là màn chính khi admin mở một issue.
- Nút `Open` trong Issue list đi thẳng vào `Issue Editor`, không render `Issue Detail` làm màn trung gian.
- `Force approve`, `Translations`, `Jira sync` và `Resync from Backlog` hiển thị trong `Issue Editor`.
- `Jira sync` mở modal; modal chạy dry-run, duplicate payload target, cho chỉnh field rồi sync.
- Nếu form canonical có unsaved changes, UI disable dry-run/sync và yêu cầu save trước.
- Sau khi save canonical, UI clear dry-run cũ để tránh sync bằng preview stale.
- `Issue Detail` nếu còn tồn tại chỉ là màn phụ/legacy, không phải entry chính của workflow issue.
# Phase IE-03 - Admin UI Issue Editor

## Mục tiêu

Tạo màn Issue Editor để admin xem/sửa canonical data của CIS issue và thao tác translation ngay trong cùng workflow issue qua popup.

## Vị trí UI và số màn liên quan

Issue Editor nằm trong Admin UI, thuộc khu vực quản trị CIS issue.

V1 hiện lấy `Issue Editor` làm màn chính của issue:

1. `Issue Editor` - màn chính để xem/sửa canonical data và thao tác translation/Jira sync.
2. `Issue Detail` - nếu còn tồn tại thì chỉ là màn phụ/legacy.

Không tạo màn riêng trong v1 cho:

- History.
- Worklogs.

History và Worklogs là panel/subview read-only trong `Issue Editor`, hoặc link neo trong cùng màn nếu UI hiện tại đơn giản. Translation Review mở bằng modal `Translations`; không có popup trạng thái dịch riêng trong Issue Editor. Modal này vẫn dùng cơ chế `translation_queue`/approve hiện có.

## Route đề xuất

Từ `Issue list`, nút `Open` đi thẳng vào Issue Editor.

Route đề xuất:

```text
/admin/issues/:issueId
/admin/issues/:issueId/editor
```

Nếu Admin UI hiện tại chưa có router sâu, có thể dùng query/modal route tạm:

```text
/admin/issues/:issueId?view=editor
```

Nhưng contract sản phẩm vẫn xem `Issue Editor` là một màn riêng, không phải modal phụ, vì form có nhiều block và có dirty state.

## Bố cục Issue Editor

Issue Editor gồm các vùng:

- `Overview`: project, Backlog key, Jira key, `sync_status`, updated time.
- `Source data`: source Backlog/Jira/CIS theo field.
- `CIS canonical`: form edit canonical.
- `Translations`: nút mở modal dịch của issue hiện tại.
- `Backlog sync`: nút `Resync from Backlog` cho issue hiện tại.
- `Jira sync`: nút mở modal dry-run/sync Jira.
- `Worklog`: summary/list read-only nếu có dữ liệu.
- `History`: link hoặc block history manual edit.

Khuyến nghị layout:

- Desktop: 2 cột.
  - Cột chính: `CIS canonical` + `Source data`.
  - Cột phụ: `Overview` + `Sync readiness` + `Worklogs` + `History`.
- Mobile/narrow: 1 cột theo thứ tự `Overview`, `CIS canonical`, `Sync readiness`, `Source data`, `Worklogs`, `History`.

Không cần wizard nhiều bước trong v1. Một issue tương ứng một màn editor.

## Form editable

Field trong form:

- `summary`
- `description`
- `issue_type`
- `priority`
- `status`
- `assignee`
- `due_date`

Không hiển thị form field cho:

- `labels`
- `components`
- `fix_versions`
- `worklogs`

`worklogs` nếu hiển thị thì là panel/subview read-only trong Issue Editor.

## UX rule

- Có unsaved changes thì disable sync thật.
- Save thành công phải refresh snapshot từ server.
- Nếu issue từ `approved/synced` về `update_pending`, UI hiển thị trạng thái cần dry-run lại.
- Nếu dry-run stale, UI yêu cầu dry-run lại trước sync.
- Field source phải rõ: `cis`, `backlog`, `jira`.
- Nếu field source là `cis`, UI thể hiện đó là override canonical.
- Translation review nằm trong Issue Editor, không ép admin quay ra màn `Translations`; màn chính chỉ giữ nút `Translations` để mở modal. Modal chỉ hiển thị translation của chính issue, ghi rõ field cần dịch như `Summary translation`/`Description translation`, và là nơi thực hiện toàn bộ thao tác dịch trực tiếp, sửa nội dung dịch, `Approve + save`, reject và retranslate. Action translate trong Issue Editor gọi provider ngay, không enqueue `sync_jobs`.
- Source text của issue translation lấy từ `fields_json.<target_field>.backlog`, không fallback sang CIS/revision/queue cũ.
- Jira sync nằm trong modal riêng; mở modal tự chạy dry-run, sync bằng payload editable trong modal và lưu các draft field có giá trị vào `fields_json.<field>.jira`.
- Description hiển thị plain text, không lộ raw ADF.
- Assignee selector nếu dùng Jira catalog phải lưu được Jira account id.

## Worklog UI

V1 tối thiểu:

- Hiển thị tổng số worklog.
- Hiển thị tổng thời gian đã log.
- Hiển thị source nếu có, ví dụ `jira`.
- Có thể mở danh sách worklog read-only.

Không làm trong v1:

- Tạo worklog mới.
- Sửa/xóa worklog.
- Sync worklogs chung với issue payload.

## Deliverables

- Nút `Open` trong Issue list mở thẳng Issue Editor.
- Route/screen Issue Editor.
- Không tạo màn riêng cho History/Worklogs trong v1.
- Form edit canonical field.
- Dirty state, save state, validation error display.
- Source comparison block.
- Translation modal.
- Jira sync modal.
- Backlog resync one issue action.
- Worklog summary/list read-only.
- Smoke test UI/API nếu stack hỗ trợ.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] `npm run verify:issue-editor:phase03` pass nếu UI stack hỗ trợ.
- [ ] Issue list có entry mở editor.
- [ ] Issue Editor có route/màn riêng, không chỉ là modal nhỏ.
- [ ] History và Worklogs hiển thị trong editor hoặc subview, không thành màn độc lập v1.
- [ ] Issue Editor render dữ liệu từ `GET /editor`.
- [ ] Form không render `labels/components/fix_versions`.
- [ ] Worklog render read-only summary/list.
- [ ] Save gọi `PATCH` đúng payload.
- [ ] Dirty state disable sync thật.
- [ ] Source label hiển thị đúng.

### Manual check (Người review)

- [ ] Mở Issue Editor từ Issue list.
- [ ] So sánh source Backlog/CIS/Jira trên UI.
- [ ] Sửa summary/priority/due date canonical và save.
- [ ] Chọn assignee và xác nhận account id được giữ nếu có catalog.
- [ ] Xem worklog read-only nếu issue có dữ liệu.
- [ ] Xác nhận nút Translations mở modal, trong modal có thể translate/retranslate, sửa text, `Approve + save` và reject.
- [ ] Xác nhận nút Jira sync mở modal, tự chạy dry-run, cho sửa payload và sync.
