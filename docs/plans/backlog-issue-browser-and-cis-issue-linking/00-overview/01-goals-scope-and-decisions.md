# Mục tiêu, phạm vi và quyết định

> [← Overview](./README.md) · [Plan index](../README.md)

## Mục tiêu

- Cung cấp màn **Backlog Issues** cho từng project để Admin xem issue Backlog theo khoảng ngày tạo bắt buộc, không lưu kết quả browse vào database.
- Cố gắng hiển thị đủ số issue chưa có trong CIS mà Admin yêu cầu; backend tự lấy thêm trang Backlog sau khi loại duplicate CIS và trả partial + stop reason nếu source/budget kết thúc trước.
- Cho phép sync từng candidate từ màn Backlog Issues vào CIS theo đúng luồng Backlog -> CIS hiện có, không tạo đường tắt Backlog -> Jira.
- Chuyển các control pull Backlog theo project từ Project Config sang màn Backlog Issues.
- Cho phép tạo một CIS issue thủ công có canonical state, revision đầu tiên và audit trail đầy đủ.
- Cho phép Admin gán Backlog issue và Jira task còn trống cho CIS issue, sau khi xác minh issue external tồn tại, đúng project và không thuộc CIS issue khác.
- Giữ owner-write discipline: CIS sở hữu canonical issue identity; Backlog/Jira chỉ sở hữu external lookup và source-specific integration.

## Phạm vi

### Trong scope

- Một màn **Backlog Issues** chuyên biệt; không tạo abstraction generic cho mọi external system.
- Hai filter ngày tạo bắt buộc: created_from và created_to.
- Trường số lượng hiển thị, với giá trị hợp lệ từ 1 đến 100.
- Browse candidate Backlog không ghi vào issues, issue_revisions, sync_jobs, sync_journal, webhook_events, raw snapshot hay bất kỳ cache database nào.
- Lọc issue Backlog đã tồn tại trong CIS trước khi trả kết quả cho UI.
- Over-fetch theo trang Backlog cho tới khi đủ số candidate chưa tồn tại trong CIS, Backlog trả trang cuối hoặc request chạm safety bound công khai.
- Nút **Sync to CIS** theo từng hàng candidate.
- Nút/khối control **Pull project** và **Pull one issue** hiện hữu được chuyển từ Project Config sang Backlog Issues; semantics pull hiện hữu không đổi.
- Nút **Create CIS issue** trên màn CIS Issues.
- Form external identity trong Issue Editor cho Backlog issue key và Jira issue key.
- Validation remote existence, external project routing và uniqueness theo `project_id` + đúng loại identity: Backlog chỉ so với Backlog, Jira chỉ so với Jira.
- Persistence integrity dựa trên schema hiện có, API, UI, automated verification và cập nhật docs/app sau khi behavior thực tế hoàn tất.

### Ngoài scope

- Màn Jira Issues, Jira list browser hoặc Jira -> CIS full ingest.
- Generic system issue browser, registry system mới hoặc framework plugin.
- Lưu saved search, cache, source snapshot hay history cho kết quả browse Backlog.
- Bulk Sync to CIS từ nhiều candidate cùng lúc.
- Scheduled pull mới, webhook mới, replay hoặc background scan riêng cho candidate browser.
- Đổi, xóa hoặc chuyển external identity đã gán sang CIS issue khác.
- CIS -> Backlog, Jira outbound không qua dry-run, hoặc bất kỳ thay đổi nào làm yếu Jira readiness/mapping/anomaly gate.
- Medium/Full scope, multi-tenant, RBAC mới, distributed worker hoặc dependency mới.

### Quyết định triển khai đã chốt

| Chủ đề | Quyết định |
| --- | --- |
| Context candidate | Một project được chọn là bắt buộc; không có lựa chọn All projects ở Backlog Issues. |
| Khoảng ngày | Hai input native type=date, định dạng YYYY-MM-DD; created_from phải nhỏ hơn hoặc bằng created_to. Backend truyền nguyên giá trị sang Backlog `createdSince`/`createdUntil`, không tự cộng/trừ timezone hoặc tự tuyên bố semantics khác provider. Boundary-date behavior phải có acceptance bằng API/fixture contract. |
| Số lượng | limit là số candidate **chưa tồn tại trong CIS** cần hiển thị, từ 1 đến 100. Chọn 100 vì Backlog Get Issue List hỗ trợ `count` tối đa 100; giá trị chỉ tồn tại trong request/UI state. |
| Duplicate scope | Đã chốt theo `project_id` và tách theo system column. Trong cùng project: canonical Backlog key chỉ được thuộc một `issues.backlog_issue_key`; canonical Jira key chỉ được thuộc một `issues.jira_issue_key`. Không cross-compare Backlog key với Jira key dù text giống nhau. Ví dụ Jira `DMP-01` phải bị chặn nếu một CIS issue khác cùng project đã có `jira_issue_key = DMP-01`, kể cả key đó đến từ manual link, trace-link hay sync result; Backlog áp dụng tương tự với `backlog_issue_key`. Khác project_id được phép. |
| Canonical external key | Input chỉ là lookup token. Identity column chỉ persist/compare canonical issueKey/key do Backlog/Jira trả về, không persist input token. Remote id chỉ trả trong response và ghi audit cho request vừa verify, không là uniqueness key và không thêm persistence column. Trim/uppercase dùng để chuẩn hóa lookup/key mới. |
| Browse persistence | Browse chỉ đọc Backlog và CIS read API. Không tạo record database nào. |
| Browse bound | Dùng đúng Backlog API: `count = 100`, `offset`, `sort = created`, `order = asc`. Một browse quét tối đa 10 page/1.000 source row **và** có overall deadline 30 giây tính cả `getProject`; mỗi source call timeout tối đa 10 giây hoặc phần thời gian còn lại, tùy giá trị nào nhỏ hơn. Nếu chưa đủ candidate, trả stop reason/partial list thay vì giữ HTTP request vô hạn. |
| Sync action | Một hàng có một nút Sync to CIS. Action dùng route/use case riêng, chỉ enqueue khi project.enabled, manual_pull_enabled, sync_enabled và background worker đều sẵn sàng; nếu không, trả stable disabled/unavailable error và không enqueue. Endpoint không chạy attachment-heavy handler trong HTTP request. |
| Manual CIS issue | Project và summary là bắt buộc; các canonical field còn lại là optional. Issue có source_system = manual và revision 1 ngay khi tạo. |
| External identity | Mỗi field chỉ gán khi đang trống. Gửi lại cùng key là idempotent; gửi key khác sau khi đã gán bị từ chối. |
| Outbound Jira | Gán Jira key chỉ là identity linking/validation. Nó không import Jira snapshot và không tự động ghi Jira; dry-run/readiness vẫn bắt buộc. |
| Audit atomicity | Manual create/link và sync_journal tương ứng commit/rollback trong cùng SQLite transaction qua transaction-bound SyncApi journal capability. Không chấp nhận owner state đã commit nhưng audit thất bại. |
