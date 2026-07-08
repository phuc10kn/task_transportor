# 01 - Business

`01-business/` mô tả business reality mà sản phẩm phải phục vụ. File này giữ business truth, actor, workflow và rule còn hiệu lực của Central Sync Hub. Giải thích generic về business layer nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Mô hình layer: `docs/guide/concepts/layer-model.md`
- Cách đọc theo task: `docs/guide/workflows/read-for-task.md`
- Cách viết docs: `docs/guide/workflows/write-docs.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#01-business`
- Canonical map: `docs/guide/reference/canonical-map.md`

## Business Truth Hiện Tại

Business cần một hub trung gian để giảm đồng bộ thủ công giữa Backlog và Jira, đồng thời giữ kiểm soát khi dữ liệu cần dịch, mapping, review, retry và audit.

Stakeholder/chủ thể chính:

- Khách hàng và đội nhận yêu cầu làm việc trên Backlog.
- Đội dev vận hành công việc trên Jira.
- Admin/operator dùng UI để pull dữ liệu, review translation, approve mapping, xử lý anomaly, retry job và xem audit.
- Scheduler nội bộ chỉ kích hoạt scheduled scan theo cấu hình, không tự ra quyết định business.
- Worker nội bộ là cơ chế thực thi job, không phải actor business.
- AI transport tạo draft translation, không giữ quyền quyết định cuối.

Business flow Lite:

```text
Backlog manual/project pull
  -> CIS
  -> optional translation draft
  -> human review khi cần
  -> mapping/anomaly check
  -> Jira dry-run
  -> CIS -> Jira
```

Business rules còn hiệu lực:

- Backlog là nguồn yêu cầu từ khách hàng; Jira là nơi dev làm việc chính.
- CIS là điểm kiểm soát trung gian, không phải cache phụ.
- Manual pull và project pull là đường vận hành chính của Lite; scheduled pull là optional; webhook chưa là dependency vận hành Lite.
- Translation là trợ lý AI; human review/admin giữ quyết định cuối.
- Mapping required phải được approve, critical/open anomaly phải xử lý và Jira dry-run phải pass trước sync thật.
- Retry là recovery có chủ đích sau khi hiểu nguyên nhân.
- Attachment download failure có recovery riêng, không mặc định làm fail toàn bộ issue ingest.
- Medium/Full flow như Jira -> CIS đầy đủ, CIS -> Backlog, webhook bắt buộc, AI learning nâng cao và notification ngoài UI không thuộc Lite nếu chưa có decision accepted mới.

Workflow Lite còn sống:

- Admin login -> project config -> project sync control.
- Backlog one-issue ingest -> CIS review entry; project ingest -> candidate queue; không sync thẳng Jira.
- Translation review -> AI draft -> human approve/manual edit/reject.
- Mapping/anomaly handling -> approve/edit/hold mapping và resolve/ignore/keep open anomaly trước outbound.
- Issue preparation -> canonical edit làm stale preview cũ nếu dữ liệu đổi.
- Jira sync preview/publish -> dry-run payload, gate `can_sync`, rồi ghi Jira thật khi pass.
- Dashboard, failed job retry, attachment retry, audit/journal review -> recovery có chủ đích.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#01-business`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ business truth, workflow và rule còn hiệu lực của Central Sync Hub.

Chỉ mục nhanh:

- `01-discovery/`
- `02-direction/`
- `03-organization/`
- `04-behavior/`
- `05-governance/`
- `06-measurement/`

## Theory Routing

- `TH-HUBFLOW`: business flow trung gian qua core hub.
- `TH-AI-GOV`: AI draft, review authority và human accountability.
- `TH-SYNC-SAFE`: publish gate, dry-run, readiness và stale preview.
- `TH-OPS-TRACE`: retry, audit, recoverability và quyết định vận hành sau failure.

## Rule Riêng Hiện Tại

- Business flow của Lite luôn đi qua CIS; không mô tả Backlog -> Jira direct sync như workflow chính.
- Admin/operator là chủ thể quyết định; scheduler, worker và AI transport chỉ là cơ chế thực thi/hỗ trợ.
- Business process không chứa API, schema, database, retry implementation; các phần đó thuộc Technical/Implementation/Operation.
- Business entity phải trace được tới Context/Product/Decision liên quan bằng relation canonical trong `docs/meta/`.

## Routing Sang Layer Khác

- Domain vocabulary, entity meaning và lifecycle: `docs/app/04-domain/`.
- Acceptance/example dùng để nghiệm thu: `docs/app/08-quality/`.
- Decision business còn hiệu lực: `docs/app/10-decisions/`.
- API, schema, webhook mechanism và retry implementation: `docs/app/06-technical/` và `docs/app/07-implementation/`.
