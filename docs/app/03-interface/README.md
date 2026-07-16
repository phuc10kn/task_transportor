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
- Sau login, operator phải chọn hoặc tạo Project tại `Projects` trước khi vào route nghiệp vụ. Header chỉ hiển thị Project đang active cùng link về `Projects`; các màn nghiệp vụ không có selector hoặc `All projects` và không tự chọn Project đầu tiên.
- Project config cho Backlog/Jira credential, sync policy, translation config và enable/disable.
- Dashboard là capability mục tiêu cho pending review, missing mapping, failed job và open anomaly. Trong accepted Admin UI gap hiện tại, Dashboard nav/direct route bị disabled có reason và không gọi summary/alerts; phase BE sau mới mở lại khi có Project filter.
- Pull one issue và resync từ Backlog.
- Màn Backlog Issues riêng theo project, bắt buộc created-from/created-to/limit, có Not closed và dropdown checkbox có search/summary cho multi-select Status/người được gán từ snapshot cấu hình Backlog của project. Khi snapshot cũ hoặc thiếu, operator refresh tại Mappings bằng `Pull Backlog fields`; chỉ `Find candidates` mới browse candidate. Empty state phải phân biệt Backlog không match giao filter với issue match nhưng đã có trong CIS, đồng thời cho phép bỏ optional filter mà giữ date range; candidate chưa có CIS có Sync to CIS theo từng hàng.
- Mỗi candidate hiển thị `Sync to CIS` và `Sync to CIS + Translate`; action mới chỉ enqueue parent job, row poll tới terminal rồi operator review Translation Queue. Khi active Sync thường đang running, request action mới hiển thị lỗi có job evidence và không tuyên bố đã queue translation.
- Màn CIS Issues có form tạo issue thủ công; Issue Editor cho link Backlog issue/Jira task khi field còn trống.
- Issue Editor dùng vùng biên tập chính rộng và rail nhỏ bên phải cho `Identity and state` cùng `Jira outbound gate`; viewport hẹp mới xếp dọc. Source snapshots là block cuối vùng nội dung, hiển thị theo ma trận Field × System: Summary/Description dùng toàn chiều ngang, field ngắn dùng grid compact, nội dung dài mặc định thu gọn và có Show more/Show less. Canonical Summary dùng toàn bộ chiều ngang, Description có Markdown Edit/Preview, formatting toolbar và character count. Preview không thực thi raw HTML từ nội dung.
- Translation review cho summary/description dùng một `AI draft` chung cho AI và operator: source snapshot render Markdown read-only, draft dùng Markdown Edit/Preview cùng chiều cao. Save Draft chỉ lưu draft; Approve là action riêng duy nhất apply draft vào canonical; vẫn hỗ trợ retranslate và reject. Translation Queue dùng table compact chỉ hiển thị định danh `[SYSTEM] ISSUE-KEY`, CIS issue, field, status, AI evidence và actions; Source cùng AI draft chỉ hiển thị trong modal Edit. Draft stale vẫn được giữ và cảnh báo, nhưng Approve bị khóa tới khi operator Save Draft theo source hiện tại hoặc retranslate.
- Translation Glossary lazy-load theo Project khi operator mở màn hoặc đổi Project; table có Group, Concept key, danh sách term theo language kèm nhãn Canonical, Note, Actions; Add/Edit/View dùng modal language sections, radio canonical và nút add/remove variant/language, có filter Group, search, loading/empty/error/retry và confirm delete.
- Mỗi term dùng language code động, không hard-code cột ngôn ngữ; lỗi validation/conflict giữ form và hiển thị rõ.
- Mapping review/approval trước outbound; mỗi direction dùng một bảng liên tục, nhóm các value bằng field band compact theo `mapping_type`. Tên field, required marker và tổng value/issue chỉ hiện một lần trên band; operator có thể thu gọn từng field mà không tạo card lồng nhau.
- Mappings lưu từng mapping bằng `fetch` và cập nhật đúng row tại chỗ. Mỗi action chỉ hiển thị loading và khóa control trên đúng row/button khởi phát; không replace flow table hoặc `page-body`, nên draft chưa lưu ở item khác phải được giữ nguyên. Pull Backlog fields, Pull Jira fields và Sync CIS catalog from Jira cập nhật snapshot backend rồi thông báo kết quả; operator dùng refresh route hiện có khi muốn nạp snapshot mới vào bảng.
- Anomaly list/detail để resolve, ignore, keep open theo rủi ro.
- Jira sync modal chạy dry-run, hiển thị `can_sync`, warning, payload preview và hành động sync thật khi gate pass.
- Sync Jobs, Journal và Attachment retry để operator phục hồi có chủ đích.

UI không được làm sai product truth:

- Không trình bày Backlog -> Jira direct sync như đường chính.
- Không làm AI translation giống authority cuối.
- Không cho sync thật khi dry-run/pre-check fail.
- Không che mất lý do block như missing mapping, anomaly, stale dry-run, config lỗi.

### Design direction của Admin UI mới

- Phong cách: **Modern Operations Console** — điềm tĩnh, chính xác, gọn và ưu tiên mật độ thông tin vận hành.
- Nền/surface dùng dải neutral slate; xanh dương dịu là accent chính cho hành động, selection và trạng thái tích cực; màu cảnh báo chỉ dùng theo semantic state.
- Typography ưu tiên Geist hoặc Inter; hierarchy rõ, bảng và form compact nhưng không giảm khả năng đọc.
- Spacing theo nhịp 8 px, radius vừa phải khoảng 8 px, border nhẹ; tránh gradient trang trí, glassmorphism, card lồng nhiều tầng và khoảng trắng phóng đại.
- Navigation, page header, filter bar, data table, form field, modal/drawer, status badge, toast và state panel phải đi qua primitive/token dùng chung.
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
- UI không được làm AI translation giống authority cuối; người review/admin giữ quyết định cuối.
- UI không cho sync thật khi dry-run/pre-check fail.
- UI phải lộ rõ lý do block: missing mapping, anomaly, stale dry-run, config lỗi, credential lỗi.
- Pull one, Pull project và Sync to CIS dùng readiness/execution mode riêng; UI không coi HTTP 202 là issue đã tạo và poll job tới terminal/timeout.
- Không chọn Status/người được gán nghĩa là không gửi filter tương ứng; UI chỉ gọi API CIS scope theo project, không gọi Backlog trực tiếp.
- Pull Backlog fields và Pull Jira fields giữ nguyên các mảng text mapping hiện có, đồng thời lưu directory `{ id, value, name }` cho `issue_type`, `status`, `priority`, `user` và `component`. Mapping UI là nơi duy nhất refresh source snapshot; màn cần provider ID chỉ đọc directory tương ứng. Status và người được gán ở Backlog Issues dùng `status_directory`/`user_directory`; khi bấm Find, module dùng các ID đó để query issue thực tế trên Backlog.
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
