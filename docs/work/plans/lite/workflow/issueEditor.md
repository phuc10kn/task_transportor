# Workflow - CIS Issue Editor

## Trạng thái triển khai hiện tại

Issue Editor hiện là entry chính khi admin mở một issue từ Issue list. `Issue Detail` nếu còn tồn tại chỉ là màn phụ/legacy.

Các quyết định đang phản ánh trong code:

- Block chính `CIS CANONICAL` chỉ sửa dữ liệu canonical trong `fields_json.<field>.cis`.
- Source data hiển thị ba nhánh riêng: Backlog, CIS stored và Jira. Không còn block `Effective canonical` riêng ở đầu vì form canonical chính đã đại diện cho giá trị effective đang vận hành.
- Translation không chạy từ bảng trạng thái chính trong workflow Issue Editor. Màn chính chỉ giữ nút `Translations`; mọi thao tác dịch nằm trong modal.
- Modal translation chỉ hiển thị các target thuộc issue đang mở, hiện là `Summary translation` và `Description translation`.
- Source text của issue translation lấy từ `fields_json.<field>.backlog`. Không fallback sang CIS, revision, hoặc queue cũ. Nếu Backlog source hiện tại rỗng thì modal hiển thị rỗng.
- Translated text lấy từ translation item mới nhất còn khớp với Backlog source hiện tại. Queue cũ/stale không được dùng để fill nội dung dịch.
- `Translate` trong Issue Editor dịch ngay trong request hiện tại, không đẩy qua queue worker. Vẫn lưu kết quả vào `translation_queue` để giữ review/audit.
- `Approve + save` là một action duy nhất: lưu reviewed text và apply vào `fields_json.<target_field>.cis`.
- Nếu apply làm canonical field thay đổi thật, cùng rule manual edit có thể đưa issue `approved`/`synced` sang `update_pending`.
- Có thể `Reject` translation ngay trong modal; reject không apply vào canonical.
- Jira sync trên màn chính chỉ còn một nút `Jira sync`. Khi mở modal, UI chạy dry-run, duplicate các field sắp gửi lên Jira, cho phép chỉnh field đó, rồi `Sync Jira` dùng payload đã chỉnh; các draft field có giá trị được lưu vào `fields_json.<field>.jira` trước khi enqueue sync.
- `Resync from Backlog` pull lại một issue Backlog cụ thể. Nút `Pull whole project` ở Project Config đang bị disable ở FE.

## Mục tiêu

Bổ sung một màn hình và workflow riêng cho **CIS issue** như một thực thể vận hành độc lập trong Central Issue Store, thay vì chỉ xem issue detail rồi thao tác các action rời rạc như hiện tại.

Mục tiêu của `Issue Editor`:

- Cho admin xem issue theo góc nhìn **canonical của CIS**.
- Cho admin chỉnh dữ liệu nghiệp vụ của issue ngay trong CIS khi cần.
- Giữ nguyên nguyên tắc `System -> CIS -> System`.
- Không phá tính bất biến của dữ liệu gốc từ Backlog/Jira.
- Không bypass mapping, anomaly và dry-run.
- Translation Review vẫn là workflow riêng, nhưng không còn là gate trực tiếp chặn sync Jira của canonical Issue Editor flow. Sync state vẫn là gate; `pending_translate` chưa syncable trong code Lite hiện tại.

File này là **đề xuất chi tiết** để kiểm tra độ khớp với các quyết định đã chốt trong `docs/work` trước khi implement thật.

---

## Bối cảnh trước khi implement

Trước khi Issue Editor được implement:

- Admin UI có `Issue list` và `Issue detail`.
- `Issue detail` chủ yếu để:
  - xem original Nhật,
  - xem draft/reviewed tiếng Việt,
  - xem comments,
  - xem attachments metadata/status,
  - chạy `dry-run Jira`,
  - chạy `sync Jira`,
  - `force approve`,
  - `mark duplicate`.

Khi đó **chưa có**:

- màn riêng cho một CIS issue như một entity canonical,
- form edit dữ liệu issue,
- API `PATCH /api/v1/issues/:issueId`,
- quy tắc rõ ràng cho việc admin sửa dữ liệu canonical của CIS rồi push đi.

Điểm thiếu này làm CIS issue hiện giống một "bản ghi trung gian để review và sync" hơn là một "nguồn sự thật trung tâm có thể vận hành trực tiếp".

---

## Vì sao cần Issue Editor

### 1. CIS là trung tâm, nên issue trong CIS phải có đời sống riêng

Theo kiến trúc đã chốt, mọi dữ liệu đều đi qua CIS trước khi sang hệ đích. Nếu vậy, issue trong CIS không nên chỉ là snapshot bị động của Backlog hay Jira.

Admin cần có khả năng:

- chỉnh lại summary/description canonical,
- chỉnh lại field canonical để mapping/sync đúng hơn,
- chuẩn hóa dữ liệu trước khi push Jira,
- sửa issue khi nguồn gốc bị thiếu hoặc chưa phù hợp với Jira.

### 2. Manual edit translation không đủ

Hiện tại docs đã chốt `manual edit` cho translation queue. Nhưng chỉnh bản dịch không bao phủ hết các nhu cầu:

- sửa metadata canonical,
- sửa field canonical sau mapping,
- sửa dữ liệu để dry-run/pass sync,
- cập nhật issue theo quyết định vận hành của CIS.

### 3. UI hiện tại chưa phản ánh đúng vai trò của CIS

Issue detail đang nghiêng về "viewer + action launcher".

Issue Editor sẽ đưa CIS issue lên đúng vai trò:

- có dữ liệu canonical riêng,
- có logic ưu tiên dữ liệu riêng,
- có audit riêng,
- có vòng đời cập nhật riêng.

---

## Nguyên tắc thiết kế

Issue Editor phải tuân thủ các nguyên tắc sau:

### 1. Không sửa dữ liệu gốc từ Backlog/Jira

- `fields_json.summary.backlog`, `fields_json.description.backlog`, ... phải được giữ nguyên như dữ liệu nguồn.
- Nếu Jira inbound có sau này, `fields_json.*.jira` cũng giữ nguyên như dữ liệu nhận từ Jira.
- Phần admin sửa sẽ được lưu vào nhánh **canonical của CIS**, tức `fields_json.*.cis`.

### 2. Không phá "content immutable"

Docs gốc yêu cầu content history phải giữ lại bằng revision.

Vì vậy:

- edit nội dung canonical trong CIS phải tạo revision mới,
- revision đó mang `source_system = 'manual'` hoặc `source = 'manual'` theo naming hiện hành của code/schema.

### 3. Tách bạch giữa workflow state và business field

Có hai khái niệm dễ nhầm:

- `issues.sync_status`: trạng thái vòng đời sync trong CIS như `pending_translate`, `pending_review`, `approved`, `synced`, `conflict`.
- `fields_json.status`: field nghiệp vụ của issue, ví dụ trạng thái ticket từ Backlog/Jira/CIS.

Issue Editor chỉ nên sửa:

- `fields_json.status.cis`

và **không** được sửa tùy tiện:

- `issues.sync_status`

trừ các action có chủ đích như `force approve`, `mark duplicate`, resolve conflict, retry sync flow.

### 4. Dry-run và sync phải đọc dữ liệu canonical mới nhất

Sau khi admin edit CIS issue:

- dry-run phải lấy ưu tiên từ `fields_json.*.cis` nếu có,
- sync Jira phải dùng cùng dữ liệu mà dry-run đã preview,
- không được có hai nguồn dữ liệu cạnh tranh mà UI không giải thích được.

### 5. Mọi edit phải có audit

Mỗi lần edit cần để lại:

- ai sửa,
- sửa field nào,
- từ giá trị nào sang giá trị nào,
- lúc nào,
- correlation id nếu qua API.

---

## Phạm vi dữ liệu nên cho edit

### Nên cho edit trong Lite

Các field canonical nên cho edit trước:

- `summary`
- `description`
- `issue_type`
- `priority`
- `status` (nghĩa là business field trong `fields_json.status.cis`)
- `assignee`

Có thể mở rộng hiển thị:

- `backlog_issue_key`
- `jira_issue_key`
- project
- timestamps
- anomaly/sync state

Nhưng các field định danh không nên cho sửa trực tiếp ở vòng đầu.

### Chưa nên cho edit trực tiếp trong vòng đầu

- `backlog_issue_key`
- `jira_issue_key`
- `project_id`
- `source_system`
- `created_at`, `updated_at`
- `backlog_hash`, `jira_hash`
- attachment metadata
- raw translation queue rows

### Không nên gộp chung với translation editor

Translation editor và Issue Editor là hai việc khác nhau:

- translation editor sửa bản dịch,
- issue editor sửa dữ liệu canonical của issue.

Hai thứ này có liên quan nhưng không nên nhập làm một.

---

## Mô hình dữ liệu đề xuất

## 1. Không cần bảng mới ở vòng đầu

Có thể tận dụng các cấu trúc hiện có:

- `issues`
- `issues.fields_json`
- `issue_revisions`
- `sync_journal`

Không bắt buộc tạo `backlog_issues`, `jira_issues` hay `cis_issue_edits`.

## 2. Cách lưu canonical value

Ví dụ:

```json
{
  "summary": {
    "backlog": "ログイン画面でエラー",
    "cis": "Lỗi ở màn hình đăng nhập",
    "jira": "Lỗi ở màn hình đăng nhập"
  },
  "status": {
    "backlog": "Open",
    "cis": "open",
    "jira": "To Do"
  }
}
```

Rule:

- dữ liệu nguồn giữ ở `backlog` hoặc `jira`,
- dữ liệu admin chỉnh nằm ở `cis`,
- dữ liệu đã sync/link phía Jira nằm ở `jira`.

## 3. Revision cho manual edit

Nếu admin sửa một trong các field content/canonical chính:

- tạo revision mới trong `issue_revisions`,
- `source_system = 'manual'`,
- `summary/description/issue_type/priority/assignee` phản ánh snapshot canonical mới.

Lưu ý:

- `issue_revisions` hiện không có cột riêng cho business field `status`.
- vì vậy `status` business field có thể chỉ cập nhật trong `fields_json.status.cis` và audit bằng journal.
- không cần ép `issue_revisions` gánh toàn bộ metadata nếu schema hiện tại chưa thiết kế như vậy.

---

## Quy tắc đọc dữ liệu sau khi có Issue Editor

Để tránh mơ hồ, cần chốt rõ thứ tự ưu tiên khi build dữ liệu hiển thị và dry-run.

### 1. Hiển thị canonical trên Issue Editor

Ưu tiên:

1. `fields_json.<field>.cis`
2. `fields_json.<field>.backlog`
3. `fields_json.<field>.jira`
4. fallback từ revision hiện tại nếu cần

### 2. Dry-run Jira

Dry-run phải build payload từ **canonical effective value**:

1. lấy `cis` nếu có,
2. nếu chưa có thì lấy nguồn backlog hiện tại,
3. sau này nếu có Jira inbound đầy đủ thì vẫn ưu tiên `cis` cho outbound từ CIS.

### 3. Mapping

Khi có Issue Editor, mapping cần hiểu:

- `backlog -> cis` vẫn dùng cho dữ liệu ingest từ nguồn,
- nhưng nếu admin đã sửa canonical value trong CIS, outbound `cis -> jira` phải dùng giá trị `cis`.

Ví dụ:

- Backlog issue type = `"Bug"`
- Mapping `backlog -> cis` ra `"bug"`
- Admin đổi canonical trong CIS thành `"task"`
- Khi dry-run/sync Jira, phải dùng `"task"` làm input cho mapping `cis -> jira`

Điều này không mâu thuẫn với mapping cũ, nhưng làm rõ rằng **CIS có quyền override canonical value** sau ingest.

---

## Ảnh hưởng tới state machine

Issue Editor không nên tự do đổi `issues.sync_status`, nhưng việc edit canonical có thể ảnh hưởng tới luồng như sau:

### 1. Khi issue đang `pending_review`

- edit canonical được phép,
- không auto approve,
- translation review vẫn là bước riêng.

### 2. Khi issue đang `approved`

- nếu admin sửa canonical field quan trọng, nên đưa issue về `update_pending` hoặc giữ `approved` tùy rule.

Khuyến nghị:

- nếu sửa content/business field ảnh hưởng Jira payload, chuyển về `update_pending`
- để buộc dry-run lại trước sync tiếp theo

### 3. Khi issue đang `synced`

- nếu admin sửa canonical, nên đổi về `update_pending`
- vì dữ liệu trên CIS đã khác dữ liệu lần sync gần nhất

### 4. Khi issue đang `conflict`

- edit canonical có thể là một phần của xử lý conflict,
- nhưng không tự động thoát conflict nếu chưa có action/chốt riêng.

---

## API đề xuất

Tối thiểu nên có:

```text
GET   /api/v1/issues/:issueId/editor
PATCH /api/v1/issues/:issueId
GET   /api/v1/issues/:issueId/history
```

### `GET /api/v1/issues/:issueId/editor`

Trả:

- issue core
- effective canonical values
- source values (`backlog`, `jira`, `cis`)
- status vòng đời
- translation summary
- anomaly summary
- sync summary

### `PATCH /api/v1/issues/:issueId`

Payload đề xuất:

```json
{
  "summary": "Lỗi ở màn hình đăng nhập",
  "description": "Mô tả canonical đã được chuẩn hóa",
  "issue_type": "task",
  "priority": "high",
  "status": "open",
  "assignee": "tanaka",
  "reason": "Chuẩn hóa dữ liệu trước khi sync Jira"
}
```

Rule:

- chỉ patch field được phép,
- update vào `fields_json.*.cis`,
- tạo revision manual nếu cần,
- ghi journal,
- cập nhật `issues.updated_at`,
- nếu issue đang `synced` hoặc `approved`, cân nhắc chuyển `issues.sync_status` sang `update_pending`.

### `GET /api/v1/issues/:issueId/history`

Có thể trả:

- revisions,
- journal action liên quan tới manual edit,
- ai sửa và lý do sửa.

---

## UI đề xuất

## 1. Tách `Issue detail` và `Issue Editor`

Khuyến nghị:

- `Issue detail`: giữ vai trò quan sát tổng quát và chạy action
- `Issue Editor`: màn riêng để sửa canonical data

### Trong Issue detail

Nên có:

- nút `Open editor`
- block so sánh:
  - source Backlog
  - canonical CIS
  - linked Jira

### Trong Issue Editor

Nên có các block:

- `Overview`
  - project
  - backlog key
  - jira key
  - issue lifecycle state
- `Source data`
  - giá trị gốc từ Backlog/Jira
- `CIS canonical`
  - form edit các field canonical
- `Sync readiness`
  - kết quả dry-run gần nhất, anomaly, mapping status
- `History`
  - revision/journal liên quan tới manual edit

## 2. UX rule quan trọng

- nếu có unsaved change thì chưa cho chạy sync thật
- sau save nên yêu cầu dry-run lại
- nếu issue đã `synced` trước đó, UI nên báo "Issue đã thay đổi trong CIS, cần dry-run lại"

---

## Journal và audit đề xuất

Nên có action journal riêng, ví dụ:

- `issue_manual_edit_requested`
- `issue_manual_edit_saved`
- `issue_manual_edit_reverted` nếu có rollback sau này

`details_json` nên chứa:

- changed_fields
- before
- after
- reason
- actor

Ví dụ:

```json
{
  "changed_fields": ["summary", "priority"],
  "before": {
    "summary": "ログイン画面でエラー",
    "priority": "high"
  },
  "after": {
    "summary": "Lỗi ở màn hình đăng nhập",
    "priority": "medium"
  },
  "reason": "Chuẩn hóa trước khi sync Jira"
}
```

---

## Rủi ro và cách khóa

### 1. Rủi ro nhầm giữa bản dịch và canonical issue

Giải pháp:

- UI tách rõ `Translation` và `CIS canonical`
- label phải rõ: đây là dữ liệu issue trong CIS, không phải chỉ là reviewed translation

### 2. Rủi ro overwrite dữ liệu nguồn

Giải pháp:

- chỉ ghi vào `fields_json.*.cis`
- không sửa `fields_json.*.backlog` và `fields_json.*.jira`

### 3. Rủi ro sync payload khó hiểu

Giải pháp:

- dry-run phải hiển thị source của từng field nếu cần
- UI nên cho thấy field nào đang lấy từ `cis`, field nào vẫn lấy từ `backlog`

### 4. Rủi ro mâu thuẫn với sync lại từ nguồn

Giải pháp:

- ingest mới từ Backlog chỉ cập nhật nhánh `backlog`
- không đè `cis` khi admin đã sửa, trừ khi có explicit reset/rebase action sau này

---

## Kiểm tra độ khớp với docs/work hiện tại

## 1. Khớp với kiến trúc tổng thể

**Khớp** với:

- `docs/work/01-architecture.md`
- nguyên tắc `System -> CIS -> System`
- CIS là single source of truth trung tâm

Lý do:

- Issue Editor làm CIS mạnh hơn vai trò trung tâm,
- không đẩy dữ liệu đi thẳng từ Backlog sang Jira,
- vẫn giữ con người quyết định cuối.

## 2. Khớp với CIS schema hiện tại

**Khớp một phần và có thể tận dụng schema hiện có**:

- `issues.fields_json` đã được thiết kế để giữ field-level theo source
- `issue_revisions` đã có `source = 'manual'`

Điểm cần làm rõ thêm trong doc schema:

- `fields_json.*.cis` là nhánh canonical có thể do admin chỉnh trực tiếp
- manual edit của issue khác với manual edit translation

## 3. Không mâu thuẫn với translation review

**Không mâu thuẫn** với:

- `docs/work/05-translation-pipeline.md`
- phase translation review

Lý do:

- translation review vẫn là workflow riêng,
- Issue Editor không thay translation editor,
- reviewed translation có thể là input để admin quyết định canonical summary/description.

Quyết định sau IE-02:

- Jira dry-run/sync của Issue Editor không dùng `translation_queue` làm blocking gate trực tiếp.
- Không trả `TRANSLATION_REVIEW_REQUIRED` chỉ vì còn hoặc không còn queue translation.
- Admin vẫn có thể dùng bản dịch reviewed như nguồn tham khảo/copy vào canonical field.
- Các gate còn bắt buộc cho issue sync là mapping, anomaly, Jira config, sync state và stale dry-run; trong code Lite hiện tại `pending_translate` bị chặn ở sync-state gate.

## 4. Không mâu thuẫn với dry-run Jira

**Không mâu thuẫn**, nhưng cần chốt rõ hơn:

- `dry-run` phải đọc canonical effective value,
- nếu có edit mới trong CIS thì dry-run cũ coi như stale.

Nghĩa là workflow `dry-run -> sync` vẫn giữ nguyên, chỉ thay nguồn dữ liệu build payload.

## 5. Không mâu thuẫn với force approve / mark duplicate

**Không mâu thuẫn**.

Các action này vẫn là action vận hành riêng:

- `force approve` xử lý lifecycle state
- `mark duplicate` xử lý classification
- Issue Editor xử lý canonical data

## 6. Có ảnh hưởng tới các doc đã chốt

Nếu quyết định implement thật, cần cập nhật các doc sau:

### Bắt buộc cập nhật

1. `docs/work/plans/lite/08-api-admin-ui.md`
   - thêm API editor
   - thêm yêu cầu UI editor

2. `docs/work/plans/lite/implement_plans/07-admin-ui-acceptance.md`
   - issue detail không còn chỉ là viewer
   - thêm manual check cho edit CIS issue

3. `docs/work/plans/lite/09-acceptance.md`
   - thêm Definition of Done cho edit canonical issue

4. `docs/work/11-api-contract.md`
   - thêm contract cho `GET /issues/:issueId/editor`, `PATCH /issues/:issueId`

### Nên cập nhật

5. `docs/work/02-central-issue-store.md`
   - làm rõ ý nghĩa của `fields_json.*.cis`
   - làm rõ revision/journal cho manual issue edit

6. `docs/work/10-state-machine.md`
   - chốt effect của manual edit lên `approved`, `synced`, `update_pending`

7. `docs/work/plans/lite/implement_context.md`
   - thêm context về canonical issue editing nếu coi là scope của Lite

### Không bắt buộc phải sửa ngay

- docs Backlog ingestion
- docs Jira outbound core
- docs backup/runtime

Các doc này chỉ cần cập nhật nếu implementation chi tiết làm thay đổi data flow cụ thể.

---

## Kết luận

`CIS Issue Editor` là phần mở rộng **hợp logic** với vai trò của CIS và **không đi ngược** các nguyên tắc kiến trúc đã chốt trong `docs/work`.

Điểm chính:

- Không cần bảng mới ở vòng đầu.
- Có thể dùng `fields_json.*.cis` + `issue_revisions` + `sync_journal`.
- Không sửa dữ liệu gốc từ Backlog/Jira.
- Không bypass mapping, anomaly, dry-run.
- Không dùng translation review làm gate trực tiếp chặn issue sync trong canonical Issue Editor flow; vẫn tôn trọng sync-state gate.
- Nếu implement thật, phải cập nhật lại một số doc contract/acceptance/state-machine để tránh vùng mơ hồ.

## Khuyến nghị triển khai

Nên triển khai theo 2 bước:

### Bước 1 - Canonical editor tối thiểu

- API `GET/PATCH issue`
- UI màn `Issue Editor`
- save vào `fields_json.*.cis`
- journal cho manual edit
- dry-run đọc canonical value

### Bước 2 - Hoàn thiện workflow

- history view
- stale dry-run detection
- state transition rõ khi edit sau sync
- reset/rebase canonical from source nếu cần

File này hiện đóng vai trò **proposal/workflow note** để chốt hướng trước khi code.
