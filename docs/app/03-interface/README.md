# 03 - Interface

`03-interface/` mô tả cách người dùng hoặc operator chạm vào Product. File này giữ interface truth, routing và rule của app; giải thích generic về interface layer nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Mô hình layer: `docs/guide/concepts/layer-model.md`
- Cách viết docs: `docs/guide/workflows/write-docs.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#03-interface`
- Folder map: `docs/guide/reference/folder-map.md`
- Canonical map: `docs/guide/reference/canonical-map.md`

## Interface Truth Hiện Tại

Lite cần Admin UI để operator vận hành Central Sync Hub, không chỉ là màn hiển thị phụ.

UI tối thiểu phải hỗ trợ:

- Login/logout và trạng thái admin hiện tại.
- Sau login, operator phải chọn hoặc tạo Project tại `Projects` trước khi vào route nghiệp vụ. Project là một phần bắt buộc của document URL theo dạng `/project/:projectId/<workspace-route>`; `projectId` trong path là workspace authority, còn session chỉ nhớ Project gần nhất ở màn `Projects`. Header chỉ hiển thị Project đang active cùng link về `Projects`; các màn nghiệp vụ không có selector hoặc `All projects` và không tự chọn Project đầu tiên.
- Project config cho Backlog/Jira credential, sync policy, translation config và enable/disable. Translation provider cho phép chọn DeepSeek hoặc OpenAI; OpenAI có các lựa chọn `gpt-4.1-mini`, `gpt-5.4-mini`, `gpt-5.6-luna`, `gpt-5.6-terra`, `gpt-5.6-sol`; credential AI chỉ đọc từ environment của API server, không nhập hoặc lưu trong Project UI.
- Mỗi Project có ba external network gate: Backlog read, Jira read và Jira write. Switch nằm trong đúng card provider; đây là kill switch kỹ thuật, không thay thế `Manual pull` hoặc `Sync enabled`. Action bị gate phải báo đúng provider/quyền bị tắt và không enqueue job.
- Dashboard là command view của active Project: hiển thị pending pull/review, missing mapping, failed job, open anomaly và tổng issue; mỗi metric/alert dẫn tới đúng queue xử lý của Project đó. Khi chưa chọn Project hoặc Project bị disabled, Dashboard không tải summary/alerts và hiển thị workspace state tương ứng.
- Pull one issue và resync từ Backlog. Resync trong Issue Editor chạy lại approved Backlog→CIS mappings; khi job thành công UI chỉ nạp lại Issue type, Priority, Status và Assignee tại chỗ, không reload trang hoặc làm mất draft Summary/Description chưa lưu.
- `Pull project` luôn hiển thị disabled với lý do rõ; operator dùng `Sync to CIS`, `Sync + Translate` hoặc `Sync + Translate + Jira` theo từng candidate, hoặc action manual filtered riêng `Pull all matching issues` chỉ để enqueue `manual_pull` vào CIS.
- Màn Backlog Issues riêng theo project, bắt buộc created-from/created-to/limit, có Not closed và dropdown checkbox có search/summary cho multi-select Status/người được gán từ snapshot cấu hình Backlog của project. Khi snapshot cũ hoặc thiếu, operator refresh tại Mappings bằng `Pull Backlog fields`; chỉ `Find candidates` mới browse candidate, cập nhật kết quả tại chỗ mà không reload document. Empty state phải phân biệt Backlog không match giao filter với issue match nhưng đã có trong CIS, đồng thời cho phép bỏ optional filter mà giữ date range; candidate chưa có CIS có Sync to CIS theo từng hàng.
- Mỗi candidate hiển thị ba action `Sync to CIS`, `Sync + Translate` và `Sync + Translate + Jira`; action chỉ enqueue/reuse job và row poll tới terminal. Action Jira dùng job riêng `sync_translate_jira`, là operator authorization để worker auto-approve nguyên translation batch nhưng vẫn bắt buộc dry-run/pre-check trước external write. Candidate response overlay active `manual_pull` hoặc `sync_translate_jira` theo Backlog key; sau reload UI khóa đúng row đó, hiển thị job evidence và tự nối lại polling, không khóa/rerender row khác. Khi active workflow yếu hơn đã running, request promote hiển thị lỗi kèm job evidence.
- `Pull all matching issues` là secondary button additive trong filter card; giữ nguyên `Find candidates`, Result limit, candidate table, Pull one và các row action. Button dùng bộ lọc hiện tại nhưng không gửi Result limit, gọi Count một lần rồi gọi tuần tự từng Page `100`; Count dùng browse readiness, Page dùng readiness của `sync_to_cis` và mỗi issue eligible chỉ tạo/reuse `manual_pull`.
- Button hiển thị enqueue progress inline `Page N/Total · X queued`, không reload document hoặc clear/rerender candidate table. Progress chỉ tồn tại trong phiên browser; refresh/đóng tab dừng vòng Page và làm mất progress, còn các `manual_pull` đã enqueue tiếp tục được worker xử lý. Count/offset là best-effort khi Backlog thay đổi giữa các request, không phải snapshot nhất quán và không dùng batch/coordinator state ở Backend.
- Màn CIS Issues có form tạo issue thủ công và Issue register phân trang cố định 20 dòng; đổi trang cập nhật register tại chỗ, không reload document. Search chỉ contains không phân biệt hoa thường theo canonical Summary và cũng cập nhật register tại chỗ. Cột Source hiển thị system cùng source key theo dạng `Backlog (MAP-94)` hoặc `Jira (ABC-12)`; cột Target hiển thị `Jira (ABC-12)` khi đã sync hoặc `Not synced` khi chưa có Jira identity. Priority và Assignee không nằm trong khu vực search; hai cột này vẫn hiển thị giá trị CIS, không dùng source Backlog/Jira. Issue Editor cho link Backlog issue/Jira task khi field còn trống.
- Issue Editor dùng vùng biên tập chính rộng và rail nhỏ bên phải cho `Identity and state` cùng `Jira outbound gate`; viewport hẹp mới xếp dọc. Source snapshots là block cuối vùng nội dung, hiển thị theo ma trận Field × System: Summary/Description dùng toàn chiều ngang, field ngắn dùng grid compact, nội dung dài mặc định thu gọn và có Show more/Show less. Canonical Summary dùng toàn bộ chiều ngang, Description có Markdown Edit/Preview, formatting toolbar và character count. Preview không thực thi raw HTML từ nội dung.
- Issue Editor hiển thị `Story Point` bằng number input compact, không âm, mặc định `1`; Jira dry-run/publish hiển thị cùng giá trị khi target field áp dụng.
- Translation review luôn hiển thị riêng card Summary và Description; chưa có translation record thì card ở trạng thái `pending`, AI draft trống và không ghi database chỉ vì mở editor. Issue Editor không có bulk action `Translate issue`. Source snapshot render Markdown read-only, draft dùng Markdown Edit/Preview cùng chiều cao. Summary draft giữ marker `【source issue key】`; Description draft và canonical Description bắt đầu bằng URL issue gốc trên một dòng riêng (`Backlog /view/<key>` hoặc `Jira /browse/<key>`), sau đó là một dòng trống và nội dung. Save Draft chỉ lưu draft nhưng vẫn chuẩn hóa URL đầu Description; Approve là action riêng apply draft vào canonical. `Retranslate` gọi AI đồng bộ cho đúng field, tạo translation record khi card còn là placeholder, cập nhật draft và không tạo sync job hoặc thay đổi canonical; operator phải bấm `Approve` riêng. Translation Queue vẫn dùng retranslate background. Translation Queue dùng table compact chỉ hiển thị định danh `[SYSTEM] ISSUE-KEY`, CIS issue, field, status, AI evidence và actions; Source cùng AI draft chỉ hiển thị trong modal Edit. Draft stale vẫn được giữ và cảnh báo, nhưng Approve bị khóa tới khi operator Save Draft theo source hiện tại hoặc `Retranslate`.
- Translation Glossary lazy-load theo Project khi operator mở màn hoặc đổi Project; table có Group, Concept key, danh sách term theo language kèm nhãn Canonical, Note, Actions; Add/Edit/View dùng modal language sections, radio canonical và nút add/remove variant/language, có filter Group, search, loading/empty/error/retry và confirm delete.
- Mỗi term dùng language code động, không hard-code cột ngôn ngữ; lỗi validation/conflict giữ form và hiển thị rõ.
- Mapping review/approval trước outbound; mỗi direction dùng một bảng liên tục, nhóm các value bằng field band compact theo `mapping_type`. Tên field, required marker và tổng value/issue chỉ hiện một lần trên band; operator có thể thu gọn từng field mà không tạo card lồng nhau.
- Mappings lưu từng mapping bằng `fetch` và cập nhật đúng row tại chỗ. Mỗi action chỉ hiển thị loading và khóa control trên đúng row/button khởi phát; không replace flow table hoặc `page-body`, nên draft chưa lưu ở item khác phải được giữ nguyên. Mỗi field band của cả `Backlog → CIS` và `CIS → Jira` có `Save all`, chỉ lưu/approve row đã đổi hoặc đang chờ approve; card `CIS → Jira` có thêm `Fill equal target`: chỉ tự lưu/approve các row chưa map khi nhãn giá trị CIS trùng nhãn target Jira, không ghi đè mapping đã có. Pull Backlog fields, Pull Jira fields và Sync CIS catalog from Jira cập nhật snapshot backend rồi thông báo kết quả; operator dùng refresh route hiện có khi muốn nạp snapshot mới vào bảng.
- Anomaly list/detail để resolve, ignore, keep open theo rủi ro.
- Jira sync modal chạy dry-run, hiển thị `can_sync`, warning, payload preview và hành động sync thật khi gate pass.
- Jira sync modal dùng Project Jira catalog cho Issue type, Priority, Target status và Assignee; select hiển thị user label nhưng submit provider value/ID. Story Point luôn hiện, và bị khóa kèm lý do khi Jira metadata không áp dụng field cho issue type hiện tại.
- Sync Jobs, Journal và Attachment retry để operator phục hồi có chủ đích. Với inbound `Backlog → CIS`, Target issue luôn là `null`/`—`; Backlog key chỉ thuộc Source issue. Target issue chỉ hiển thị Jira key cho direction có đích `Jira`.

UI không được làm sai product truth:

- Không trình bày Backlog -> Jira direct sync như đường chính.
- Không làm AI translation giống authority cuối; auto-approval chỉ được phép khi operator chọn action Jira explicit hoặc `Retranslate` explicit trong CIS Issue Editor.
- Không cho sync thật khi dry-run/pre-check fail.
- Không che mất lý do block như missing mapping, anomaly, stale dry-run, config lỗi.

### Design direction của Admin UI mới

- Phong cách: **Modern Operations Console** — điềm tĩnh, chính xác, gọn và ưu tiên mật độ thông tin vận hành.
- Nền/surface dùng dải neutral slate; xanh dương dịu là accent chính cho hành động, selection và trạng thái tích cực; màu cảnh báo chỉ dùng theo semantic state.
- Typography ưu tiên Geist hoặc Inter; hierarchy rõ, bảng và form compact nhưng không giảm khả năng đọc.
- Spacing theo nhịp 8 px, radius vừa phải khoảng 8 px, border nhẹ; tránh gradient trang trí, glassmorphism, card lồng nhiều tầng và khoảng trắng phóng đại.
- Navigation, page header, filter bar, data table, form field, modal/drawer, status badge, toast và state panel phải đi qua primitive/token dùng chung.
- Sidebar gom `Backlog Issues`/`CIS Issues` dưới nhóm `Issues` và gom `Translation Queue`/`Translation Glossary` dưới nhóm `Translation`; nhóm chứa route active tự mở, vẫn dùng route document hiện có.
- `Login` và `Projects` là route toàn cục (`/login`, `/projects`). Dashboard, Mappings, Backlog Issues, CIS Issues/Issue Editor, Translation Queue/Glossary, Anomalies, Sync Jobs và Journal chỉ tồn tại dưới `/project/:projectId/...`; không duy trì route workspace toàn cục cũ hoặc `project_id` query fallback.
- Mỗi màn dữ liệu phải thể hiện loading, empty, error/retry và success feedback phù hợp. Accessibility tối thiểu WCAG AA, dùng được bằng bàn phím và có focus visible.
- Figma không phải dependency. Design direction được chốt trong code và tài liệu này; external inspiration chỉ dùng có chọn lọc, không sao chép 1:1.
- Admin Web là client-rendered MPA dùng Tabler local và JavaScript thuần; mỗi route trả document HTML thật, browser chỉ gọi public Express API và không truy cập SQLite hoặc sở hữu lại business rule.
- Cutover cuối cùng thay thế hoàn toàn Admin UI cũ; không duy trì legacy UI, fallback hoặc hai UI active sau khi acceptance pass.
- Sau cutover DEC-004, Tabler MPA tại `apps/admin-web` là UI duy nhất; không còn source, dependency, route fallback hoặc listener Next/React/Vue/legacy.
- Route map, phase và thứ tự cutover thuộc kế hoạch migration riêng; chưa được suy diễn từ section này.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#03-interface`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ interface truth, guardrail và routing riêng của Admin UI hiện tại.

Chỉ mục nhanh:

- `01-audience/`
- `02-experience/`
- `03-structure/`
- `04-composition/`
- `05-interaction/`
- `06-quality/`
- `07-system/`

## Rule Riêng Hiện Tại

- UI không được trình bày Backlog -> Jira direct sync như đường chính.
- UI không được làm AI translation giống authority cuối; người review/admin giữ quyết định cuối qua review thường hoặc action auto-delivery explicit.
- UI không cho sync thật khi dry-run/pre-check fail.
- UI phải lộ rõ lý do block: missing mapping, anomaly, stale dry-run, config lỗi, credential lỗi.
- Pull one và Sync to CIS dùng readiness/execution mode riêng; Pull project không phát request; UI không coi HTTP 202 là issue đã tạo và poll job tới terminal/timeout. Reload không tạo request sync mới: active job từ candidate response được dùng để phục hồi trạng thái và polling theo row.
- Không chọn Status/người được gán nghĩa là không gửi filter tương ứng; UI chỉ gọi API CIS scope theo project, không gọi Backlog trực tiếp.
- Pull Backlog fields và Pull Jira fields giữ nguyên các mảng text mapping hiện có, đồng thời lưu directory `{ id, value, name }` cho `issue_type`, `status`, `priority`, `user` và `component`. Pull Jira fields loại user hệ thống/integration, gồm `GitHub for Atlassian`, `Free JQL Filter Counter & KPI Dashboard Gadget for Jira` và `Proforma Migrator`, khỏi `user` và `user_directory`. Mapping UI là nơi duy nhất refresh source snapshot; màn cần provider ID chỉ đọc directory tương ứng. Status và người được gán ở Backlog Issues dùng `status_directory`/`user_directory`; khi bấm Find, module dùng các ID đó để query issue thực tế trên Backlog.
- Not closed không gửi direct route tới Backlog; Backlog module resolve từ snapshot Status rồi chỉ gửi các `statusId[]` không có status chuẩn `Closed`/`Close`. Status select vẫn hoạt động; khi chọn cả hai thì kết quả là giao của Status đã chọn và Not closed.
- Layer này đang dùng Admin UI làm touchpoint chính của Lite; nếu sau này có CLI hoặc API operator touchpoint, vẫn route về `03-interface`.
- Source component tree và validation implementation detail thuộc `07-implementation/`.

## Routing Sang Layer Khác

- Business actor và process: `docs/app/01-business/`.
- Product capability, use case, acceptance: `docs/app/02-product/`.
- Domain meaning/state: `docs/app/04-domain/`.
- API contract và data shape kỹ thuật: `docs/app/06-technical/`.
- Component/source implementation: `docs/app/07-implementation/`.
- Product quality gate: `docs/app/08-quality/`.
