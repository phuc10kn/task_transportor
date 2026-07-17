# Kế hoạch đồng bộ trạng thái Admin UI sau mutation

Trạng thái: `proposed`  
Ngày lập: `2026-07-17`  
Estimate: `5–7 ngày công / 1 developer`

## 1. Bối cảnh

Admin UI hiện render dữ liệu từ payload ban đầu, nhưng nhiều mutation hoặc background job chỉ patch một vài DOM element sau khi thành công. Database đã có dữ liệu mới trong khi các section liên quan trên màn detail vẫn hiển thị dữ liệu cũ cho tới khi operator reload trang.

Ví dụ hiện tại tại CIS Issue Editor: Resync Backlog chỉ nạp lại Issue type, Priority, Status và Assignee; Source snapshots, revision, canonical hash, translation source và các metadata liên quan vẫn có thể stale.

## 2. Mục tiêu

- Sau mutation hoặc job terminal success, dữ liệu server mới phải hiển thị ngay trên màn detail hiện tại.
- Không reload document hoặc thay toàn bộ `page-body`.
- Không làm mất canonical input, translation draft hoặc form input chưa lưu.
- Nếu server và operator cùng thay đổi một field, giữ draft của operator và hiển thị conflict.
- Loading/error chỉ tác động action hoặc section khởi phát.
- List/table không bị rerender toàn bộ; chỉ cập nhật row liên quan.

## 3. Ngoài phạm vi

- Không thêm WebSocket, Server-Sent Events hoặc polling toàn hệ thống.
- Không xây client state framework, event bus hoặc virtual DOM.
- Không đổi business rule/backend workflow chỉ để phục vụ render.
- Không tự refresh toàn bộ Backlog Issues, CIS Issues, Translation Queue, Glossary, Mapping, Anomaly hoặc Sync Jobs list.
- Không tự xóa row khỏi list khi row không còn khớp filter hiện tại.

## 4. Contract reconcile

Mỗi editable field có ba giá trị:

```text
baseline = giá trị server khi render/reconcile thành công gần nhất
draft    = giá trị operator đang nhập
latest   = giá trị server vừa fetch lại
```

| Trạng thái | Hành vi |
| --- | --- |
| Field không dirty | Gán `latest` lên control và cập nhật `baseline` |
| Field dirty, `latest === baseline` | Giữ draft, không cảnh báo |
| Field dirty, `latest !== baseline` | Giữ draft, đánh dấu `Server changed` |
| Save chính field đó thành công | Nhận server response, cập nhật `baseline`, clear dirty/conflict |
| Read-only section | Luôn cập nhật theo `latest` |
| Mutation thành công nhưng refresh GET thất bại | Không gửi lại mutation; báo refresh thất bại và cho retry GET |

Conflict không được âm thầm ghi đè input. Operator có thể tiếp tục save draft của mình để override có chủ đích hoặc chọn dùng server value.

## 5. Giải pháp kỹ thuật tối thiểu

### 5.1 Shared helper

File: `apps/admin-web/public/shared.js`

Thêm helper nhỏ, không chứa business logic:

```js
CIS.trackDirty(form)
CIS.reconcileForm(form, baseline, latest)
```

Helper phải:

- Theo dõi dirty theo field thay vì một boolean cho toàn form.
- Hỗ trợ `input`, `textarea`, `select` và checkbox.
- Snapshot/restore draft khi section cần render lại.
- Trả danh sách field conflict để page tự render warning.
- Clear dirty theo field sau save thành công.

Mỗi page vẫn tự quyết định endpoint cần fetch và section cần cập nhật.

### 5.2 Chống response cũ ghi đè

Mỗi màn detail giữ một refresh sequence number hoặc `AbortController`. Chỉ response mới nhất được phép reconcile DOM. Không thêm queue hoặc concurrency framework riêng.

### 5.3 Phân biệt mutation error và refresh error

- Mutation error: giữ form/draft, hiển thị lỗi tại action.
- Refresh error sau mutation success: hiển thị `Action succeeded, but the latest screen data could not be loaded` cùng nút retry chỉ chạy GET.
- Retry refresh không được gửi lại POST/PUT/PATCH/DELETE.

## 6. Phạm vi theo màn

### 6.1 CIS Issue Editor — mức ảnh hưởng cao

File: `apps/admin-web/public/pages/issues.js`

Tạo loader nội bộ có thể fetch độc lập:

- Editor state.
- Attachments.
- History.

Invalidation map:

| Action | Resource cần nạp lại |
| --- | --- |
| Save canonical | Editor + history |
| Link external identity | Editor |
| Resync Backlog | Editor + attachments + history |
| Retranslate | Editor |
| Save translation draft | Editor |
| Approve/Reject translation | Editor + history |
| Retry attachment | Attachments |
| Jira publish terminal success | Editor + history |

Các section cần cập nhật:

- Sync status, revision và updated time.
- Canonical hash và field source label.
- Canonical field không dirty.
- Backlog/Jira identity.
- Source snapshots.
- Translation source, AI draft, review status, stale/provider warning.
- Manual edit, translation và attachment counters.
- Attachment row vừa retry.
- Jira outbound state.

Quy tắc riêng:

- Resync cập nhật toàn bộ server-owned/read-only section, không chỉ bốn mapped field.
- Canonical/translation field đang dirty được giữ lại.
- Source snapshots vẫn cập nhật ngay để operator thấy source mới.
- `Approve` không được approve bản server cũ khi textarea có draft chưa save; yêu cầu Save Draft trước.
- `Retranslate` trên draft dirty phải cảnh báo vì action sẽ thay chính draft đó.
- Approve thành công phải cập nhật canonical field tương ứng ngay.
- Jira publish thành công phải cập nhật Jira key, sync status và outbound metadata ngay.

### 6.2 Projects — mức ảnh hưởng thấp

File: `apps/admin-web/public/pages/projects.js`

- Giữ cơ chế render lại detail sau save.
- Bảo đảm Project directory và active workspace header nhận server value mới.
- Không làm trống credential masked value sau save.
- Clear dirty sau save thành công; giữ input khi lỗi.

### 6.3 Translation Queue và Glossary — list exception

File: `apps/admin-web/public/pages/translation.js`

- Không reload toàn queue/glossary.
- Save/approve/reject/retranslate chỉ patch row liên quan.
- Modal nhận server response mới trước khi đóng.
- Giữ filter, search và page hiện tại.
- Nếu item không còn khớp filter, đánh dấu row đã cập nhật; không tự xóa row.

### 6.4 Mappings — list exception

File: `apps/admin-web/public/pages/mappings.js`

- Mapping save/approve tiếp tục patch đúng row.
- Không rerender flow table và không mất draft row khác.
- Pull catalog chỉ cập nhật notice/metadata ngoài list.
- Giữ rule hiện tại: operator dùng refresh route để nạp catalog mới vào mapping table.

### 6.5 Anomalies, Sync Jobs và Journal — list exception

File: `apps/admin-web/public/pages/operations.js`

- Resolve/ignore/retry/cancel chỉ patch đúng row.
- Cập nhật metric ngoài table nếu metric phụ thuộc action.
- Modal detail dùng server response mới.
- Journal read-only không cần reconcile.

### 6.6 Backlog Issues — regression only

File: `apps/admin-web/public/pages/backlog.js`

- Không thay candidate list behavior.
- Job polling tiếp tục khóa/cập nhật đúng row.
- Không refresh toàn candidate list sau terminal job.
- Bổ sung regression test để bảo đảm shared helper không ảnh hưởng row-local flow.

## 7. Thứ tự triển khai

### AR-00 — Contract và failing acceptance

1. Chốt inventory mutation/action theo từng page.
2. Bổ sung Playwright case đang fail cho stale detail state.
3. Chốt field dirty/conflict behavior.

Estimate: `0.5 ngày`.

### AR-01 — Shared dirty/reconcile helper

1. Thêm field-level dirty tracker.
2. Thêm reconcile helper.
3. Thêm refresh sequence guard.
4. Test input/select/textarea/checkbox và conflict.

Estimate: `0.5–1 ngày`.

### AR-02 — CIS Issue Editor

1. Tách render function cho read-only/meta section.
2. Thêm editor/attachments/history loader.
3. Áp dụng invalidation map.
4. Chuyển Resync sang full editor reconciliation.
5. Sửa canonical save, identity link và attachment retry.
6. Sửa translation actions và draft conflict.
7. Sửa Jira publish refresh.

Estimate: `1.5–2.5 ngày`.

### AR-03 — Các màn còn lại

1. Audit Projects.
2. Audit Translation Queue/Glossary.
3. Audit Mappings.
4. Audit Anomalies/Jobs.
5. Xác nhận Backlog list không regress.

Estimate: `1–1.5 ngày`.

### AR-04 — Acceptance, docs và handoff

1. Hoàn thiện Playwright regression.
2. Cập nhật Interface/Quality docs.
3. Chạy verification.
4. Ghi lại manual acceptance chưa được user xác nhận.

Estimate: `1.25–2 ngày`.

## 8. Kịch bản kiểm thử chính

### Issue Editor

1. Resync cập nhật Source snapshots ngay.
2. Resync cập nhật mapped canonical field không dirty.
3. Summary/Description dirty không bị mất.
4. Server thay cùng field dirty thì hiện conflict.
5. Save canonical cập nhật revision/hash ngay.
6. Retranslate cập nhật đúng card, không ảnh hưởng card còn lại.
7. Approve cập nhật canonical ngay.
8. Jira publish cập nhật Jira identity và sync status ngay.
9. Refresh GET thất bại không gửi lại mutation.
10. Response refresh cũ không ghi đè response mới.

### List regression

1. Mapping save không làm mất draft row khác.
2. Translation action chỉ patch row liên quan.
3. Job/anomaly action chỉ patch row liên quan.
4. Backlog candidate action không rerender list.
5. Filter/search/page không bị reset sau row action.

### Accessibility và UX

- Loading nằm trên button/section khởi phát.
- `aria-busy` được gỡ khi kết thúc.
- Conflict warning dùng được bằng bàn phím và có text, không chỉ dựa vào màu.
- Focus không bị mất khi section unrelated refresh.
- Error giữ nguyên form input.

## 9. Verification

```powershell
npm run admin:ci
npm run verify:admin-ui-e2e
npm run verify:admin-ui-acceptance
npm run verify:issue-editor
npm test
git diff --check
```

Manual acceptance vẫn để người review xác nhận.

## 10. Tài liệu cần cập nhật khi triển khai

- `docs/app/03-interface/README.md`: server-owned detail state refresh, dirty preservation, conflict và list exception.
- `docs/app/08-quality/README.md`: acceptance cho reconciliation và mutation-success/refresh-failure.

Không cần decision mới hoặc sửa architecture backend nếu các GET detail API hiện tại đủ dữ liệu.

## 11. Rủi ro và kiểm soát

| Rủi ro | Kiểm soát |
| --- | --- |
| Rerender section làm mất event listener | Tách `render*` và `bind*` theo section; bind lại đúng section vừa thay |
| Rerender làm mất draft | Snapshot dirty field trước render và restore sau render |
| Response cũ ghi đè response mới | Sequence guard hoặc AbortController |
| Mutation thành công nhưng UI báo fail vì GET lỗi | Tách mutation error khỏi refresh error |
| Fetch quá nhiều endpoint | Dùng invalidation map theo action |
| Shared helper trở thành state framework | Chỉ giữ dirty/reconcile primitive, business logic nằm tại page |

## 12. Definition of Done

- Mọi non-list mutation trong scope có refresh/reconcile path rõ.
- Read-only/server-owned section cập nhật ngay sau success.
- Draft chưa lưu không bị mất.
- Conflict cùng field được hiển thị rõ.
- Không dùng `location.reload()` hoặc replace toàn `page-body` sau mutation.
- List/table chỉ cập nhật row liên quan.
- Mutation success không bị gửi lại khi refresh GET thất bại.
- Playwright regression và verification commands pass.
- Interface/Quality docs khớp behavior đã triển khai.

## 13. Estimate tổng

| Hạng mục | Ngày công |
| --- | ---: |
| Contract và acceptance đầu vào | 0.5 |
| Shared reconciliation | 0.5–1 |
| CIS Issue Editor | 1.5–2.5 |
| Các màn khác | 1–1.5 |
| Playwright, docs và verification | 1–1.5 |
| Dự phòng API/race condition | 0.5 |
| **Tổng** | **5–7** |

## 14. Design direction

- Giữ phong cách **Modern Operations Console** hiện tại.
- Signature differentiator: server truth cập nhật ngay nhưng operator draft luôn được bảo vệ.
- Framework: Tabler MPA + JavaScript thuần.
- Không dùng external inspiration và không thêm dependency.
