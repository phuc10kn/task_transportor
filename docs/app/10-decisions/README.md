# 10 - Decisions

`10-decisions/` lưu các quyết định quan trọng còn hiệu lực, phương án đã cân nhắc và quyết định đã bị thay thế. Decision là layer cross-cutting; không chỉ dành cho Architecture. Giải thích generic về decision model nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Theory/decision model: `docs/guide/concepts/theory-and-decision-model.md`
- Cách trace impact: `docs/guide/workflows/trace-impact.md`
- Cách viết docs: `docs/guide/workflows/write-docs.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#10-decisions`
- Relation cheatsheet: `docs/guide/reference/relation-cheatsheet.md`

## Product Decisions Còn Hiệu Lực

| Quyết định | Trạng thái | Ý nghĩa |
| --- | --- | --- |
| Dùng mô hình `System -> CIS -> System` | accepted | Không sync point-to-point Backlog -> Jira trực tiếp. |
| Lite ưu tiên `Backlog -> CIS` và `CIS -> Jira` | accepted | Jira -> CIS đầy đủ để Medium/phase sau. |
| Pull one/candidate sync là inbound chính; project/scheduled pull bị disable | accepted | Không query/enqueue batch project pull; webhook vẫn không bắt buộc trong Lite. |
| Backlog candidate browse là read-only | accepted | Filter/result không lưu DB; issue chỉ vào CIS sau action Sync to CIS riêng. |
| External identity unique theo project và system column | accepted | Backlog chỉ so backlog key, Jira chỉ so Jira key; canonical key lấy từ provider API. |
| Scheduled pull bị disable | accepted | Chỉ xem xét bật lại cùng thiết kế project pull queue-only mới. |
| Admin UI là bắt buộc | accepted | Operator phải review, approve, retry và xử lý anomaly bằng UI. |
| [Admin UI dùng Tabler + JavaScript thuần + client-rendered MPA (`DEC-004`)](01-decision-making/01-decisions/DEC-004-tabler-vanilla-mpa-admin-ui/README.md) | accepted | Mỗi route trả document thật; Node chỉ phục vụ HTML/assets và proxy API. Next.js/React/Vue/SPA router không còn trong implementation active. |
| [Workspace API scope theo Project (`DEC-005`)](01-decision-making/01-decisions/DEC-005-project-scoped-workspace-api/README.md) | accepted | Mọi data-plane endpoint mang `projectId`; owner repository enforce isolation; Backend và Admin Web cutover cùng capability, không giữ route legacy. |
| Project-first Admin UI dùng Project-scoped workspace | accepted | Mỗi login chọn/tạo Project và chỉ đổi tại Projects; Dashboard cùng mọi data-plane API enforce active Project, `enabled=false` chặn workspace. `BE-PROJECT-SCOPE-01/02` đã đóng bởi `DEC-005`. |
| SQLite là database MVP/Lite | accepted | Phù hợp server nội bộ và workload nhỏ. |
| Một service Express + worker nội bộ | accepted | Chưa tách worker process riêng trong Lite. |
| Translation dùng một draft chung nhưng human approval giữ quyền quyết định | accepted | AI/operator cùng chỉnh `ai_draft`; Save Draft không đổi canonical, chỉ Approve mới apply. |
| Translation config canonical dùng `translation_ai_*` | accepted | Field legacy chỉ là tương thích migration. |
| Translation Glossary thuộc Translation và dùng hai bảng normalized | accepted | Project Config không còn glossary; concept hỗ trợ số ngôn ngữ động, mỗi language có variants và đúng một canonical, không thêm cột theo ngôn ngữ. |
| Dry-run Jira trước sync thật | accepted | Không ghi Jira nếu pre-check/dry-run chưa pass. |
| Mapping required cần approval | accepted | Missing mapping chặn sync thật. |
| Medium/Full plan không tự động thành scope Lite | accepted | Chỉ là future scope/provenance nếu chưa có decision mới. |

## Business/Domain Decisions

| Quyết định | Trạng thái | Ý nghĩa |
| --- | --- | --- |
| Source snapshot, canonical data và target preview là ba lớp khác nhau | accepted | Backlog/Jira snapshot không tự ghi đè canonical, preview không tự thành publish. |
| Anomaly là tín hiệu vận hành | accepted | Không coi anomaly chỉ là log kỹ thuật; open/critical anomaly có quyền block outbound. |
| Retry là recovery có chủ đích | accepted | Admin xem dashboard/journal và xử lý nguyên nhân trước khi retry. |
| Attachment có lifecycle riêng | accepted | Attachment download failure không mặc định fail toàn bộ issue ingest; retry attachment có đường riêng. |
| Mapping và anomaly là hai lớp chặn độc lập | accepted | Issue chỉ ready khi mapping required approved và anomaly block đã xử lý. |
| Business workflow không chứa chi tiết code/schema | accepted | API/schema/handler/retry implementation thuộc Technical/Implementation. |
| Lite implementation source nằm trong docs/app hiện hành và code | accepted | Source hiện tại là `docs/app/07-implementation`, `docs/app/08-quality`, `docs/app/09-operation` và code. |

## Theory/Governance Decisions

| Quyết định | Trạng thái | Ý nghĩa |
| --- | --- | --- |
| 6 theory core là active set hiện tại | accepted | `TH-MODULAR`, `TH-HUBFLOW`, `TH-CANON`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE` dùng cho toàn app. |
| [Guide stable base boundary (`DEC-001`)](01-decision-making/01-decisions/DEC-001-guide-pack-materialization/README.md) | accepted | Guide chỉ giữ stable base xuyên dự án; `docs/meta/` giữ contract active, `docs/app/` giữ app truth cùng migration/provenance local. |
| [App graph materialization policy (`DEC-002`)](01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/README.md) | accepted | App relation chỉ materialize theo trace need, evidence và meta contract local. |
| [Workbench activation policy (`DEC-003`)](01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md) | accepted | Kích hoạt `docs/workbench/cis/` cho undetermined-placement với owner/TTL/handoff; không phải canonical SoT. |
| Theory source hiện hành nằm trong `docs/theories` | accepted | Không dùng tài liệu import hoặc ghi chú trung gian làm execution source. |
| Documentation governance thuộc `docs/meta` | accepted | Ownership/update/checklist rule của docs là meta-governance, không phải business rule của Central Sync Hub. |

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#10-decisions`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ decision truth, template và rule áp dụng trong repo.

Chỉ mục nhanh:

- `01-decision-making/01-decisions/`
- `01-decision-making/02-alternatives/`
- `02-lifecycle/superseded/`

Không chia mặc định theo business/product/architecture/technical vì một decision thường ảnh hưởng nhiều layer cùng lúc.

## Decision Format

Mẫu decision và status chuẩn đọc ở `docs/guide/concepts/theory-and-decision-model.md`.

Decision trong app tối thiểu phải nêu status, context, choice, theory basis khi có, affected layers/entities, alternatives, consequences và review triggers.

## Theory Routing

Layer này reference trực tiếp toàn bộ 6 theory core:

- `TH-MODULAR`
- `TH-HUBFLOW`
- `TH-CANON`
- `TH-AI-GOV`
- `TH-SYNC-SAFE`
- `TH-OPS-TRACE`

Decision là nơi app chọn cách áp dụng, giới hạn, challenge và tinh chỉnh theory cho repo hiện tại. Nếu quyết định mâu thuẫn với theory đang active, phải mở challenge/decision tương ứng trong governance của theory home.

## Rule Riêng Hiện Tại

- Accepted decision trong layer này có hiệu lực với docs/app và code trong scope tương ứng.
- Không chia decision mặc định theo business/product/architecture/technical vì một decision thường ảnh hưởng nhiều layer.
- Không xóa decision cũ; dùng `superseded`, `deprecated`, `rejected` theo lifecycle folder.
- Alternative chỉ lưu khi có giá trị giải thích lâu dài.
- Agent được draft decision; decision impact lớn cần human approval trước khi accepted.
