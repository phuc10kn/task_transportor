# Phase BIS-04 - Admin UI integration

> [← Phase index](../README.md) · [Overview](../../00-overview/README.md) · [Plan index](../../README.md)

Capability contracts bắt buộc:

- [Navigation và màn Backlog Issues](../../00-overview/03-target-design/01-navigation-and-backlog-screen.md)
- [Candidate browse API và action readiness](../../00-overview/03-target-design/02-candidate-browse.md)
- [Candidate Sync to CIS](../../00-overview/03-target-design/03-candidate-sync.md)
- [Tạo CIS issue thủ công](../../00-overview/03-target-design/04-manual-cis-issue.md)
- [External identity linking và Jira guards](../../00-overview/03-target-design/05-external-identity-linking.md)

Mục tiêu:

- Materialize flow người dùng cho CIS Issues, Backlog Issues, manual create và identity linking mà không chuyển business rule sang client.

Target files/artifacts:

- public/admin/app.js
- public/admin/styles.css
- public/admin/index.html (chỉ khi markup shell cần thay đổi)
- scripts/verify/admin-ui-acceptance.js

Điều kiện mở:

- BIS-02 và BIS-03 pass.
- API success/error contracts đã ổn định.

Việc cần làm:

- Đổi label menu Issues thành CIS Issues; thêm Backlog Issues với state project/filter tách biệt.
- Khi project Backlog thay đổi, load action-readiness trước browse và render riêng execution mode/warning cho Pull one, Pull project và per-row Sync; candidate response chỉ refresh snapshot này.
- Render Backlog search form bằng input native date, numeric limit, table candidate, metadata/exhaustion message và per-row loading.
- Chuyển projectPullPanel khỏi Project Config sang Backlog Issues và giữ đúng behavior riêng: Pull one có thể chạy inline khi sync on dù worker off; Pull project chỉ enqueue; per-row candidate luôn enqueue/poll. Hiển thị warning rõ cho trạng thái chỉ queue pending, không dùng một readiness boolean để âm thầm đổi endpoint cũ.
- Thêm action/form Create CIS issue, submit POST /api/v1/issues và chuyển vào Issue Editor sau success.
- Create form dùng project selector bắt buộc: preselect concrete CIS filter; với All projects không chọn ngầm project đầu tiên và disable submit tới khi user chọn.
- Thêm Identity mapping panel trong Issue Editor, chỉ enable input field còn null; disable toàn panel khi canonical editor đang dirty và submit handler phải recheck dirty trước API/refetch.
- Sau link success/conflict, xóa mọi Jira dry-run cũ, đóng sync popup rồi mới refetch editor để không tái sử dụng preview/hash trước identity change.
- Với per-row Sync to CIS, xử lý HTTP 202 `queued`: map canonical key -> job id, giữ row disabled, poll job mỗi 2 giây tối đa 60 giây và chỉ refetch/remove sau job success hoặc CIS đã tồn tại. Pending/running/retry không tạo POST/timer mới; terminal failed/cancelled refetch một lần rồi mới re-enable; poll timeout cleanup timer và cho manual refresh/retry (backend sẽ reuse active job), không gom mọi response 2xx thành success-created.
- Dùng toast/error envelope hiện có; không tự đoán duplicate/remote validation trong browser.
- Giữ accessibility cơ bản: label cho input, disabled state, status text và keyboard-submit form.

## Checklist hoàn thành phase

- [ ] Người dùng không thể gửi browse form thiếu một trong hai date fields.
- [ ] Backlog screen hiển thị candidate/meta và không hiển thị key đã có CIS.
- [ ] Pull project/Pull one issue không còn nằm ở Project Config và hoạt động từ Backlog Issues.
- [ ] Pull one, Pull project và per-row Sync dùng đúng ba execution/readiness contract; verifier cover sync on/off + worker on/off và UI không tuyên bố pending job đã chạy.
- [ ] Create CIS issue mở Issue Editor của issue mới.
- [ ] Create từ All projects bắt buộc user chọn project; concrete filter preselect đúng project và không tạo nhầm owner.
- [ ] Identity đã gán là read-only; lỗi validation remote/duplicate hiển thị được.
- [ ] Canonical form dirty chặn identity API/refetch; draft đang nhập không bị mất.
- [ ] Link success/conflict clear dry-run state và đóng Jira sync popup trước khi refresh.
- [ ] `queued`/pending/running/retry giữ candidate row disabled và hiển thị job state; verifier chứng minh row không bị xóa sớm, polling dừng/cleanup sau 60 giây, re-click reuse job và failed/cancelled mới re-enable.
- [ ] Existing translation/dry-run/sync controls trong Issue Editor vẫn hoạt động.
- [x] Unit test check (Agent): verify:phase07 pass sau khi mở rộng action-readiness và UI acceptance.
- [ ] Manual check (Người review): chưa tick cho đến khi user xác nhận test browser thật trên Backlog/Jira credential thật.

Kết quả thực hiện:

Status: Automated pass; manual browser pending.

- Navigation tách CIS Issues/Backlog Issues; Project Config không còn pull panel.
- Backlog filter/meta/readiness/polling, Create CIS issue và external identity form đã tích hợp.
- In-app browser không có tab khả dụng trong lượt triển khai; không tick Manual check.

---

[← Phase index](../README.md) · [Điều phối và handoff](../../02-coordination/README.md)
