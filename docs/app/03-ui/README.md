# 03 - UI

`03-ui/` mô tả cách người dùng nhìn thấy, hiểu và tương tác với Product. File này giữ UI routing và rule của app; giải thích generic về UI entity nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Mô hình layer: `docs/guide/concepts/layer-model.md`
- Cách viết docs: `docs/guide/workflows/write-docs.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#03-ui`
- Folder map: `docs/guide/reference/folder-map.md`
- Canonical map: `docs/guide/reference/canonical-map.md`

## UI Truth Hiện Tại

Lite cần Admin UI để operator vận hành Central Sync Hub, không chỉ là màn hiển thị phụ.

UI tối thiểu phải hỗ trợ:

- Login/logout và trạng thái admin hiện tại.
- Project config cho Backlog/Jira credential, sync policy, translation config và enable/disable.
- Dashboard hiển thị pending review, missing mapping, failed job và open anomaly.
- Pull one issue và resync từ Backlog.
- Issue Editor hiển thị source snapshot, canonical CIS data, Jira target preview và sync state.
- Translation modal/action cho summary/description: translate, retranslate, edit, approve + save, reject.
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

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#03-ui`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ UI truth, guardrail và routing riêng của Admin UI.

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
- UI phải lộ rõ lý do block: missing mapping, anomaly, stale dry-run, config lỗi hoặc credential lỗi.
- Source component tree và validation implementation detail thuộc `07-implementation/`.
- Rule generic của UI layer đọc ở `docs/guide/reference/folder-structure.md#03-ui`.

## Routing Sang Layer Khác

- Business actor và process: `docs/app/01-business/`.
- Product capability, use case, acceptance: `docs/app/02-product/`.
- Domain meaning/state: `docs/app/04-domain/`.
- API contract và data shape kỹ thuật: `docs/app/06-technical/`.
- Component/source implementation: `docs/app/07-implementation/`.
- Product quality gate: `docs/app/08-quality/`.
