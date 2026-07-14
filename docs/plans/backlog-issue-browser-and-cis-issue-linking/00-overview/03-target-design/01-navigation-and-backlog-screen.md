# 1. Navigation và ownership UI

> [← Thiết kế mục tiêu](./README.md) · [Overview](../README.md) · [Plan index](../../README.md)

Navigation Lite sau thay đổi:

~~~text
Dashboard
Project Config
CIS Issues
Backlog Issues
Translations
Mappings
Anomalies
Sync Jobs
Journal
~~~

- Giữ internal view id hiện có là issues để giảm diff; chỉ đổi label thấy bởi người dùng thành **CIS Issues**.
- Thêm view id backlog_issues và state riêng cho project/filter/kết quả của nó. Không dùng chung selectedProjectId với Project Config hoặc CIS Issues để đổi filter ở một màn không làm đổi màn khác.
- Backlog Issues chỉ là read model tạm thời trong browser memory. Refresh trang hoặc rời màn làm mất kết quả là behavior mong muốn.
- UI chỉ render, validate cơ bản và gọi API. Duplicate decision, remote verification, project routing và persistence phải nằm ở server/application layer.

## 2. Màn Backlog Issues

Wireframe mục tiêu:

~~~text
Backlog Issues

[Project *] [Từ ngày tạo *] [Đến ngày tạo *] [Hiển thị 1..100 *] [Tìm issue]

Backlog -> CIS cho project đang chọn
[Pull project] [Issue key] [Pull one issue]

Thông tin kết quả: Đã quét N issue, loại M issue đã có CIS, hiển thị K/L.

| Backlog key | Summary | Status | Created | Updated |            |
|-------------|---------|--------|---------|---------|------------|
| DMP-21      | ...     | Open   | ...     | ...     | Sync to CIS |
~~~

Contract UI:

- Project, created_from, created_to và limit đều required trước khi gọi API.
- Khi chọn project, UI gọi `GET /api/v1/projects/:projectId/backlog/issues/action-readiness` để render độc lập trạng thái Browse, Pull one, Pull project và Sync to CIS trước khi người dùng nhập/chạy filter. Candidate response refresh cùng action snapshot; POST luôn tự revalidate gate.
- Search button bị disable trong lúc request đang chạy; lỗi API hiển thị bằng toast/error state hiện có.
- Nếu source exhausted, scan bound, overall deadline hoặc provider error ở page sau đến trước khi đủ limit, UI vẫn render toàn bộ candidate từ các page đã thành công và thông báo stop reason/provider warning; page đầu tiên fail vẫn là request error.
- Mỗi row có một active-job state theo canonical Backlog key. Nút bị disable từ lúc POST bắt đầu cho tới khi job success/failed/cancelled hoặc polling timeout; pending/running/retry không được re-enable. Chỉ tạo một poll timer cho mỗi job và cleanup timer khi rời view/refetch.
- Sau `already_in_cis`, UI gọi lại candidate API với cùng filter. Sau `queued`, UI map row vào job id trả về, poll `GET /api/v1/sync-jobs/:jobId` tối đa 60 giây với interval 2 giây và chỉ refetch/remove khi job success hoặc CIS lookup xác nhận issue đã tồn tại. Pending/running/retry giữ row disabled cùng job status. Với terminal failed/cancelled, refetch candidate một lần: row biến mất thì báo "CIS issue đã được tạo nhưng job hậu xử lý lỗi"; row còn thì re-enable để retry. Timeout polling dừng timer/spinner và cho manual refresh/retry, không coi là job failure. UI không được xóa row chỉ vì HTTP 202.
- Browse được phép khi project tồn tại và Backlog config/credential hợp lệ. Ba action có contract riêng: **Pull one issue** giữ `pullIssueNow` hiện hữu—project.enabled + manual_pull_enabled cho phép enqueue, và khi sync_enabled=true nó chạy inline dù background worker tắt; sync_enabled=false thì job còn pending. **Pull project** chỉ enqueue hàng loạt và cần sync_enabled + worker/one-shot consumer để tiến triển. **Per-row Sync to CIS** luôn async và chỉ enable khi project.enabled, manual_pull_enabled, sync_enabled và config.worker.enabled đều true. UI/server không được dùng chung một readiness boolean cho ba action.
