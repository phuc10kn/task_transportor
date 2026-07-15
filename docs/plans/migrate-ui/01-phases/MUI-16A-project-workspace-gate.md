# MUI-16A — Project-first workspace gate

## Mục tiêu

Trước production cutover, đổi Console thành workspace một Project rõ ràng ở **UI**: sau mỗi lần login operator bắt buộc chọn Project hiện có hoặc tạo Project đầu tiên. Khi context đã được xác nhận, các màn nghiệp vụ dùng Project đó theo đúng khả năng của API hiện tại; muốn đổi phải quay về `Projects`.

MUI-16A không tạo project isolation hay authorization ở server. Những bảo đảm cần backend được ghi thành nợ BE riêng và không được kéo vào phase UI này.

## Design direction

- Mục đích: giúp operator luôn biết mình đang thao tác trong Project nào và không đổi Project ngoài ý muốn.
- Tone: **Modern Operations Console** điềm tĩnh, chính xác, compact và data-dense.
- Layout: shell giữ active Project chip cố định; `Projects` là selection owner duy nhất, không có dropdown đổi Project ở header hoặc màn nghiệp vụ.
- Typography: tiếp tục Geist/Inter và hierarchy hiện có; tên Project nổi bật hơn metadata nhưng không cạnh tranh page heading.
- Color/surface: dùng semantic token hiện có; context chip là surface trung tính với accent xanh cho trạng thái active, không thêm palette hoặc design system mới.
- Motion: chỉ dùng feedback ngắn sau chọn/đổi; focus chuyển tới heading route đích và tôn trọng reduced motion.
- Signature differentiator: context chip `Tên Project · #ID` nhất quán và luôn nhận diện được workspace trên desktop/mobile.

Không cần external inspiration; thay đổi này mở rộng đúng visual direction và primitive hiện có.

## Scope lock

### In scope

- `apps/admin-web` source, E2E/UI verifier và tài liệu migration/interface/product/quality/decision bị ảnh hưởng.
- Project workspace context phía client, render barrier, route gate, intended route, context chip và shared dirty-navigation guard.
- `Projects` list/create/edit bằng API hiện có; action explicit để mở hoặc đổi workspace.
- Bỏ Project selector, `All projects` và fallback Project đầu tiên khỏi màn nghiệp vụ; truyền active Project vào request đã hỗ trợ `project_id`/Project path.
- Loading/empty/error/retry/block state, keyboard/focus, responsive, reduced-motion và browser acceptance cho flow Project-first.

### Out of scope tuyệt đối

- Mọi thay đổi trong `src/modules/**`, `src/db/**`, migration, Express controller/repository hoặc API semantics.
- Thêm Dashboard `project_id` filter, sửa detail/mutation endpoint thành project-scoped hoặc tạo server-side project authorization/RBAC.
- Đổi schema/DTO Project, auth token/session backend, Sync state machine hoặc business workflow.
- Thêm global state/data-fetching library, BFF/cookie auth, gọi SQLite/Backlog/Jira từ browser hoặc redesign lại feature page.
- Triển khai nợ BE trong section dưới; executor chỉ được ghi evidence/block state phía UI.

Hai debt đã biết được xử lý theo accepted gap bên dưới. Nếu phát hiện **capability API mới** ngoài hai debt đó làm active UI behavior không thể hoàn tất, dừng acceptance liên quan, ghi exact blocker và đề xuất phase BE riêng; không tự sửa BE và không dùng blocker đó để mở rộng MUI-16A.

## Nợ BE và release stance đã khóa

- `BE-PROJECT-SCOPE-01`: Dashboard summary/alerts chưa nhận `project_id`. MUI-16A giữ API nguyên trạng nhưng **disable Dashboard**: navigation có disabled state/reason, direct `/dashboard` chỉ render block state và không gọi summary/alerts API.
- `BE-PROJECT-SCOPE-02`: Các detail/mutation endpoint nhận object ID không bảo đảm server-side project isolation. UI dùng response nhỏ nhất **đang tồn tại** có `project_id` để xác minh, sau đó không render dữ liệu phụ và không gửi mutation khi mismatch; không tạo identity endpoint mới và đây không phải security boundary.
- User đã khóa thứ tự `MUI-16A → MUI-17 với accepted gap → BE phase`. Hai debt không block MUI-17 nếu HG-07A chứng minh Dashboard thật sự disabled và UI không giả server isolation.
- Hoàn tất UI migration/MUI-17 không đồng nghĩa hai debt BE đã đóng. Phase BE sau sở hữu API filtering/authorization, regression và contract update.

## Artifact mục tiêu

- Một Project workspace context theo phiên ở client; Project API/DB vẫn là authority, UI không gọi context này là canonical business state.
- Shared gate không mount business page cho tới khi active Project được resolve hợp lệ; redirect bằng effect sau khi child đã mount không được coi là gate.
- Navigation, Global Refresh và request có Project scope dùng cùng active Project. Project selector rời rạc/`All projects` bị xóa khỏi màn nghiệp vụ.
- `Projects` tách rõ project đang edit, project được gợi ý bởi deep-link và active workspace; click/edit/save không ngầm đổi workspace.
- Dashboard giữ API contract hiện tại nhưng bị vô hiệu hóa ở UI, không fetch/render dữ liệu cho tới phase BE.
- Playwright evidence cho create/select/change/invalid/unavailable context, request binding, mismatch guard, dirty guard và keyboard/mobile.

## Điều kiện mở phase

- MUI-16 automated cleanup pass; chưa deploy production.
- User đã xác nhận yêu cầu Project-first workspace, xác nhận MUI-16A không sửa BE và chấp nhận release stance của hai debt đã biết.
- Trước source edit đầu tiên, materialize toàn bộ trạng thái đã được chấp nhận hiện tại — gồm MUI-16 hoàn chỉnh và MUI-16A plan/source-of-truth docs — thành clean commit `pre-MUI-16A-implementation`, rồi ghi SHA. Không dùng toàn bộ dirty worktree làm bằng chứng scope; mọi boundary/diff evidence của implementation MUI-16A so với đúng SHA này.
- API hiện tại đủ cho flow chọn/tạo Project và các request project-scoped đang tồn tại; capability còn thiếu chỉ gồm hai accepted debt đã liệt kê.

## State machine và render barrier

| State | Điều kiện | UI/side effect được phép |
| --- | --- | --- |
| `unselected` | Không có `cis_active_project_id` hợp lệ | Chỉ mount `Projects`; business navigation ẩn/disabled có giải thích; không mount business page. |
| `resolving` | Có ID dương nhưng đang đọc Project authority | Chỉ loading shell; không mount child, không gọi business read/mutation. |
| `ready` | Project list/read thành công, có đúng active ID và `enabled !== false` | Mount route; bind active ID vào request và URL allowlist; bật business navigation trừ Dashboard. |
| `invalid` | Project list/read thành công nhưng ID không tồn tại | Xóa context, bỏ stale `next`, về `Projects`; không mount child. |
| `disabled` | Project tồn tại nhưng `enabled=false` | Xóa active context, về `Projects` với reason; disable `Open workspace` và toàn bộ business route/read/mutation. Chỉ Project Config được phép re-enable. |
| `unavailable` | Timeout/network/`5xx` khi resolve Project | Giữ ID, hiển thị retry tại shell, không mount child hoặc mutation; `401` đi auth flow và xóa context. |

Active ID đọc từ `sessionStorage` phải parse thành positive integer; Project name/status luôn resolve lại từ API, không tin snapshot do browser tự ghi. Project authority revalidation phải abort hoặc ignore response cũ để Project trước không ghi đè Project hiện tại.

## Contract và state đã khóa

- `Projects` là route console duy nhất không cần active Project. Sau login, route console khác đi qua render barrier; không được phát business request rồi mới redirect.
- `cis_active_project_id` dùng `sessionStorage`: giữ qua refresh trong cùng tab nhưng bị xóa khi logout, auth hết hạn/`401` và sau login thành công để buộc chọn lại. Không dùng `localStorage` persistent cho workspace.
- Chỉ action explicit `Open workspace`/`Create and open workspace` tại `Projects` mới ghi active context. POST create phải thành công mới được mở workspace; validation/error giữ nguyên input và focus lỗi.
- Project đang edit dùng local state hoặc `edit_project_id`; click row, edit hoặc save không tự đổi workspace. Save active Project phải refresh context chip theo cùng ID, không tạo context switch.
- Project `enabled=false` vẫn được xem/sửa tại `Projects` nhưng `Open workspace` bị disabled có reason. Nếu active Project bị chuyển sang disabled, UI xóa context và chặn toàn bộ business navigation/read/mutation cho tới khi Project được re-enable rồi explicit mở lại.
- Intended route đi qua `next` internal console pathname + query hợp lệ, loại `project_id` không đáng tin; từ chối `/login`, `/projects`, `/dashboard`, external/`//` và redirect loop, fallback `/backlog-issues` vì Dashboard đang disabled.
- Chỉ list route mà API hiện tại thật sự hỗ trợ Project filter mới mirror active `project_id`. URL có ID khác bị canonicalize sang active ID **trước khi child mount**. Dashboard và object-detail route không có `project_id` mirror; URL không phải nguồn đổi workspace.
- Object deep-link tải response nhỏ nhất đang tồn tại có `project_id` trước. Nếu mismatch, giữ active context, không tải companion data/render action; hiển thị block state với link về `Projects`, `suggested_project_id` chỉ highlight và không đổi context.
- Projects chỉ resume object deep-link khi operator explicit mở đúng `suggested_project_id`; nếu mở Project khác thì bỏ offending `next` và vào `/backlog-issues`, tránh mismatch loop.
- Issue Editor phải tải/validate editor identity trước history/attachments/Jira/translation/recovery. Route detail khác áp dụng cùng nguyên tắc: xác minh bằng response ít nhất trước related read/mutation khi contract hiện có cho phép.
- Project chỉ bị xóa khỏi context sau response có authority xác nhận ID không tồn tại, ví dụ `404` hoặc Project list thành công không còn ID. Timeout/`5xx` giữ context và vào `unavailable`; `401` đi auth flow.
- Màn nghiệp vụ không còn option `All projects`, không tự fallback sang Project đầu tiên và không expose control đổi Project. Cột/evidence Project được giữ khi cần traceability.
- Dashboard navigation luôn disabled có reason `Chờ BE project scope`. Direct `/dashboard` chỉ render accessible block state dẫn về `/backlog-issues`/`Projects`; không gọi `/api/v1/dashboard/summary` hoặc `/api/v1/dashboard/alerts`.

## Dirty-navigation contract

- Dùng shared dirty registry/guard bằng primitive React hiện có, không thêm dependency. Route/modal đăng ký và gỡ dirty source; shell chỉ hỏi một guard trước navigation có thể làm mất draft.
- Guard bao phủ Project Config form, Mapping row drafts, Issue canonical + Jira draft, Translation Queue edit modal và Translation Glossary create/edit modal.
- Guard áp dụng cho sidebar/header link, link về `Projects`, browser Back/Forward, logout, workspace selection và reload/close tab. `Global Refresh` không refetch owner đang dirty; phải thông báo vì sao refresh bị giữ.
- Confirm có `Stay` và `Discard and continue`; focus quay về trigger khi Stay, còn Discard phải clear đúng dirty owner trước navigation. Không dùng native confirm cho client navigation; `beforeunload` chỉ là fallback reload/close tab.

## Công việc

- Tạo shared Project context/gate trong Next layout bằng primitive hiện có; implement đúng state machine/render barrier và không thêm dependency.
- Chuyển `Projects` thành selection owner: list/loading/error/empty/create/edit, explicit open/change, safe intended return, suggested-project hint và focus management.
- Tách project edit selection khỏi active workspace; thêm context chip `Tên · #ID`, disabled Project/open state, selection-mode navigation và shared dirty guard.
- Chuyển mappings, Backlog Issues, CIS Issues/editor, Translation Queue/Glossary, Anomalies, Sync Jobs và Journal sang active Project bằng contract hiện có; xóa selector/fallback per-route nhưng giữ filter riêng của từng màn.
- Với detail route, xác minh identity trước related fetch/action; mismatch chỉ render block state và đường về `Projects`, không gửi mutation.
- Giữ Dashboard API nguyên trạng; disable Dashboard navigation/direct route, render accepted-gap block state và assert không phát summary/alerts request.
- Tách test helper: `loginToProjectGate` kiểm login → Projects; `loginWithWorkspace` login xong mới seed/resolve Project rồi navigate cho spec không kiểm gate. Không preseed trước login vì login phải xóa context.
- Có ít nhất một flow dùng UI và Express test API thật: login → Projects → select/create → workspace. Các route spec còn lại phải mock Project authority và assert active ID trên network request.
- Test Back/Forward, stale/late Project response, invalid/unavailable state, object mismatch không companion request/mutation, dirty guard, logout/`401`, refresh và three viewports.
- Update interface/product/quality/decision/implementation docs trong phạm vi UI và accepted gap; không cập nhật API contract như thể debt BE đã được làm.

## Checklist nghiệm thu

- [ ] Clean `pre-MUI-16A-implementation` SHA đã materialize MUI-16 hoàn chỉnh cùng MUI-16A plan/docs; implementation scope diff chỉ tính từ SHA này.
- [ ] `unselected/resolving/invalid/disabled/unavailable` không mount business page hoặc gửi business read/mutation; chỉ `ready` được mount.
- [ ] Mỗi login buộc chọn lại; refresh cùng phiên giữ context; logout/`401` xóa context.
- [ ] Chọn hoặc tạo Project là action explicit; edit/save không ngầm đổi workspace; validation lỗi giữ form; intended route hợp lệ được restore.
- [ ] Header/nav hiển thị `Tên Project · #ID`; trước selection business nav không tương tác được; `enabled=false` không thể mở workspace và không còn selector/`All projects` nghiệp vụ.
- [ ] List/request có Project scope dùng active Project; object mismatch không tải companion data, không hiển thị data/action và không gửi mutation.
- [ ] Mismatch flow không loop; suggested Project chỉ được highlight, context chỉ đổi sau action explicit tại `Projects`.
- [ ] Shared dirty guard bao phủ Project/Mapping/Issue/Jira/Queue/Glossary, navigation/Back/logout/reload và Global Refresh.
- [ ] Dashboard API không đổi; navigation/direct route bị disabled có reason và browser không gửi summary/alerts request.
- [ ] Acceptance không tuyên bố chặn mọi HTTP read hoặc server isolation; `BE-PROJECT-SCOPE-01/02` vẫn open và không bị tính là hoàn tất bởi MUI-17.
- [ ] Desktop/tablet/mobile, focus/reduced-motion/axe và stale-response gate pass.
- [ ] Diff từ baseline không chạm `src/modules/**`, `src/db/**`, Express API/controller/repository hoặc API semantics.
- [ ] `npm test`, `admin:ci`, full Playwright và boundary search pass.
- [ ] HG-07A được user xác nhận.
- [ ] Manual check (Người review tại HG-07A).
- [ ] Unit test check (Agent).

## Kết quả thực hiện

In-progress: MUI-16A - plan đã review và khóa UI-only; chưa triển khai source hoặc mở HG-07A. Thứ tự đã xác nhận: MUI-16A → MUI-17 với Dashboard disabled/server-isolation accepted gap → phase BE đóng `BE-PROJECT-SCOPE-01/02`.
