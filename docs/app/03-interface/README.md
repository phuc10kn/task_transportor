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
- Project config cho Backlog/Jira credential, sync policy, translation config và enable/disable.
- Dashboard hiển thị pending review, missing mapping, failed job và open anomaly.
- Pull one issue và resync từ Backlog.
- Màn Backlog Issues riêng theo project, bắt buộc created-from/created-to/limit, có Not closed và multi-select Status/người được gán từ snapshot cấu hình Backlog của project. Khi snapshot cũ hoặc thiếu, operator refresh tại Mappings bằng `Pull Backlog fields`; chỉ `Find issues` mới browse candidate, sau đó hiển thị candidate chưa có CIS và Sync to CIS theo từng hàng.
- Mỗi candidate hiển thị `Sync to CIS` và `Sync to CIS + Translate`; action mới chỉ enqueue parent job, row poll tới terminal rồi operator review Translation Queue. Khi active Sync thường đang running, request action mới hiển thị lỗi có job evidence và không tuyên bố đã queue translation.
- Màn CIS Issues có form tạo issue thủ công; Issue Editor cho link Backlog issue/Jira task khi field còn trống.
- Issue Editor hiển thị source snapshot, canonical CIS data, Jira target preview và sync state.
- Translation modal/action cho summary/description: translate, retranslate, edit, approve + save, reject.
- Translation Glossary lazy-load theo Project khi operator mở màn hoặc đổi Project; table có Group, Concept key, số variant theo language, Note, Actions; Add/Edit/View dùng modal language sections, radio canonical và nút add/remove variant/language, có filter Group, search, loading/empty/error/retry và confirm delete.
- Mỗi term dùng language code động, không hard-code cột ngôn ngữ; lỗi validation/conflict giữ form và hiển thị rõ.
- Mapping review/approval trước outbound.
- Anomaly list/detail để resolve, ignore, keep open theo rủi ro.
- Jira sync modal chạy dry-run, hiển thị `can_sync`, warning, payload preview và hành động sync thật khi gate pass.
- Sync Jobs, Journal và Attachment retry để operator phục hồi có chủ đích.

UI không được làm sai product truth:

- Không trình bày Backlog -> Jira direct sync như đường chính.
- Không làm AI translation giống authority cuối.
- Không cho sync thật khi dry-run/pre-check fail.
- Không che mất lý do block như missing mapping, anomaly, stale dry-run, config lỗi.

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
