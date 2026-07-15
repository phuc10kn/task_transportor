# Điều phối — Migrate Admin UI sang Next.js

## Quy ước điều phối

### Handoff hiện tại

Current phase: MUI-16A - Project-first workspace gate
Done: User đã xác nhận HG-07; MUI-16 legacy cleanup/runbook/local production smoke đã pass. User yêu cầu thêm Project-first workspace trước production cutover.
Next: Trước source edit, materialize MUI-16 hoàn chỉnh cùng MUI-16A plan/docs thành clean `pre-MUI-16A-implementation` commit/SHA; sau đó triển khai selection owner, render-barrier context gate và dirty registry chỉ trong Next UI. Disable Dashboard và Project `enabled=false`, chạy automated gate rồi chờ HG-07A. Thứ tự đã khóa: MUI-16A → MUI-17 với accepted gap → phase BE.
Prompt tiếp theo: executor.md

### Trạng thái Human Gate

| Gate | Trạng thái | Cách hoàn tất |
| --- | --- | --- |
| HG-01 Console foundation | [x] Đã xác nhận | User đã xác nhận shell, Dashboard và dark/light foundation. |
| HG-02 Project Config + Mappings | [x] Chờ xác nhận | User kiểm tra bundle Project Config + Mappings rồi xác nhận rõ `HG-02 pass`. |
| HG-03 Backlog inbound | [x] Đã xác nhận | Backlog actions đã được chấp thuận trên shell light-first. |
| HG-04 Issues + Translation | [x] Đã xác nhận | User yêu cầu tiếp tục MUI-12 sau visual rework. |
| HG-05 Jira outbound | [x] Đã xác nhận | User yêu cầu tiếp tục MUI-13 sau khi MUI-12 automated pass. |
| HG-06 Operations | [x] Đã xác nhận | User yêu cầu tiếp tục MUI-15 sau Operations bundle. |
| HG-07 Release candidate | [x] Đã xác nhận | User xác nhận hoàn tất và yêu cầu tiếp tục MUI-16/MUI-17. |
| HG-07A Project workspace | [ ] Chưa mở | Review chọn/tạo/đổi Project và scope xuyên route sau MUI-16A. |
| HG-08 Production acceptance | [ ] Chưa mở | Chỉ mở sau MUI-17 và xác nhận HG-08. |

### Trạng thái blocked

None

### Accepted gaps

- Project API credential response/write semantics hiện tại được giữ; redacted/write-only DTO là security plan riêng.
- Không thêm Backlog snapshot metadata, table, timestamp, fingerprint, version hoặc freshness state. Operator refresh catalog tại Mappings khi options thiếu/cũ theo đánh giá vận hành.
- Không thêm Sync Job terminal/action/relation/batch metadata; UI dùng contract hiện tại và không giả evidence không tồn tại.
- Không thêm Translation cross-module source-revision transaction contract.
- Không thêm Jira dry-run identity/hash/latest-attempt contract.
- Không sửa Mapping/Assignee backend contract trong migration này; bug backend xác nhận được phải tách plan riêng.
- MUI-16A là phase UI-only theo xác nhận user: không sửa Dashboard API/module/database. Dashboard UI bị disabled và không fetch; Project `enabled=false` không thể mở workspace. Project-scoped Dashboard và server-side project isolation là `BE-PROJECT-SCOPE-01/02`; hai debt không block MUI-17 và phase BE sau mới đóng.
- Server-side pagination/sort, cookie/BFF auth, OpenAPI/generated client và infrastructure hardening được hoãn.
- NextAdmin chỉ là nguồn UI component được vendor có chọn lọc. BetterAuth, Prisma, PostgreSQL, RBAC/demo dashboard và data layer của template không được đưa vào app.
- Medium/Full capability và dead legacy behavior không thuộc scope.

### Ngoại lệ điều phối được user xác nhận

User yêu cầu tiếp tục fast-track NextAdmin trước khi review. Triển khai MUI-11N tới Wave 4 rồi mới trình lại HG-03 + HG-04. Ngoại lệ này chỉ thay đổi thứ tự chờ review, không cho phép agent tự tick checklist Manual/Human Gate hoặc bỏ qua automated evidence.

Accepted gap không được dùng để bỏ active UI behavior, visible evidence, loading/error/retry, responsive, keyboard/focus hoặc browser acceptance.

### Quy tắc resume

- Luôn đọc `Kết quả thực hiện` của phase gần nhất và section này trước khi tiếp tục.
- Resume đúng `Current phase`; không suy phase từ file đang mở trong IDE.
- Đối chiếu Git diff với artifact/checklist phase; không làm lại work đã có evidence pass.
- Chỉ chuyển phase sau automated pass và Human Gate dependency liên quan đã được user xác nhận.
- Mỗi UI phase phải có design review trước implementation: chốt hierarchy, visual direction, interaction states, responsive behavior và motion phù hợp; technical pass không thay thế visual acceptance.
- Human Gate phải kiểm cả behavior lẫn visual quality. Không mở phase tiếp theo nếu visual acceptance của phase hiện tại chưa đạt hoặc còn lỗi hiển thị rõ.
- `Manual check (Người review)` luôn để trống cho tới xác nhận rõ của user.
- `BE-PROJECT-SCOPE-01/02` là known accepted debt nên phần UI độc lập được tiếp tục. Nếu phát hiện capability API thiếu mới ngoài hai debt đó, dừng acceptance liên quan, ghi blocker với endpoint/evidence và đề xuất plan backend riêng; không sửa `src/modules` hoặc migration trong plan này.
- Lỗi UI tại Human Gate quay về phase UI sở hữu behavior và invalidate các phase downstream bị ảnh hưởng.
- Mọi session triển khai phải in dòng dùng `executor.md`, current phase và lý do trước tool/code action.

Chỉ một phase active. Phase không được sửa artifact phase sau, trừ shared primitive nhỏ cần trực tiếp cho acceptance và được ghi trong `Kết quả thực hiện`.

## Mốc human review bắt buộc

Khi đến gate, executor chạy automated checks, khởi động deterministic local UI, đưa URL/checklist và dừng. Chờ review không phải blocker kỹ thuật.

| Gate | Sau phase | Bundle người review kiểm | Điều kiện xác nhận | Phase chưa được mở khi gate chưa pass |
| --- | --- | --- | --- | --- |
| HG-01 Console foundation | MUI-03 | Login, identity/logout, protected deep-link, shell, navigation, Global Refresh, Dashboard và ba viewport | Không dead link; counters/health/alerts đúng; Global Refresh giữ route/filter và không làm mất dirty draft âm thầm; dark/light dùng cùng semantic token contract, canvas/surface/field/policy/state readable và visual direction chấp nhận được. | MUI-04 |
| HG-02 Project Config + Mappings | MUI-05 | Project persist/reload/error, hai chiều mapping, Seen/required state và ba refresh action | Active Project/Mapping workflow không mất field hoặc action. | MUI-06 |
| HG-03 Backlog inbound | MUI-07 | Readiness riêng từng action, Status/Assignee/Not closed, explicit Find, candidate columns, Pull one/project và hai sync actions | Pull project không dùng candidate filters; parent/child translation và `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION` feedback đúng. | MUI-08 |
| HG-04 Issues + Translation | MUI-11N | CIS list/create, editor evidence, dirty/recovery, issue/queue translation, glossary và NextAdmin-adapted foundation | Source/canonical/translation tách rõ; stale item rỗng/blocked, same-source warning, review authority, responsive và dialog accessibility được giữ. | MUI-12 |
| HG-05 Jira outbound | MUI-12 | Target draft/preview, current errors/warnings/payload, `DRY_RUN_STALE` và sync feedback | UI không sync khi `can_sync=false`; stale sync error giữ context/lý do và khóa Sync tới dry-run mới; HTTP code không lấn explicit job evidence. | MUI-13 |
| HG-06 Operations | MUI-14 | Anomaly actions, Jobs retry/cancel và Journal evidence | Visible identifiers/timing/error/message và action feedback đúng. | MUI-15 |
| HG-07 Release candidate | MUI-15 | Toàn bộ route, keyboard/focus, three viewports và critical workflows | User chấp thuận Next candidate trước legacy removal. | MUI-16 |
| HG-07A Project workspace | MUI-16A | Render barrier, create/select, `enabled=false`, context chip, đổi Project tại `Projects`, dirty guard, request binding, Dashboard disabled và object mismatch | Chỉ Project enabled ở state `ready` mount business page; context chỉ đổi explicit; Dashboard không fetch và UI không giả server isolation. | MUI-17 |
| HG-08 Production acceptance | MUI-17 | Login, Dashboard, Backlog read flow, một Issue read flow, API rewrite, listener và legacy 404 | Production Next UI usable; không còn legacy/dual UI. | Plan chưa Complete |

Nếu user báo lỗi tại gate, không tick manual item. Quay lại phase UI sở hữu behavior, bỏ evidence downstream bị ảnh hưởng, sửa/rerun tuần tự rồi trình lại đúng gate.

## Risk register và stop trigger

| Risk | Detection | Disposition |
| --- | --- | --- |
| Plan kéo backend hardening/schema/state-machine change vào UI migration | Implementation diff tính từ clean `pre-MUI-16A-implementation` SHA chạm `src/modules`, `src/db/migrations` hoặc thay API semantics | Dừng; revert scope và tạo plan backend riêng. SHA phải materialize MUI-16 hoàn chỉnh cùng MUI-16A plan/docs trước source edit. |
| Active behavior/cột evidence bị mất | MUI-00 parity matrix + feature Playwright + Human Gate | Block owning UI phase. |
| Pull project bị gửi candidate filters | Network assertion trong Backlog Playwright | Block MUI-07. |
| Browser gọi DB hoặc external Backlog/Jira | Import/hostname search | Block release; chỉ dùng relative Express API. |
| HTTP status lấn explicit body evidence | Async browser cases có terminal/non-terminal/aggregate response | Block feature phase; chỉ poll non-terminal job có ID. |
| Stale async response ghi đè route/filter mới | Abort/request-identity tests | Fix trước handoff. |
| Dirty canonical không chặn downstream UI action | Issue/Jira Playwright | Block MUI-12 trở đi. |
| Accessibility chỉ kiểm source | Keyboard/focus/axe assertions | Block feature/release gate. |
| Browser tests mock toàn bộ API | Harness inspection | Happy path phải dùng Express test API thật. |
| Legacy UI còn reachable sau cleanup | Source search + local/production HTTP smoke | Block completion. |
| Dual UI listener/service | Service/listener inspection | Dừng cutover; chỉ một UI trên `8001`. |
| Production smoke/HG-08 fail | HTTP/browser/service evidence | Restore previous release pointer; không hot-fix production. |

## Definition of ready cho mỗi phase

- Phase trước automated pass và Human Gate dependency đã được xác nhận.
- Input API/primitive/runtime tồn tại theo MUI-00 matrix.
- Scope và exact artifacts rõ, không cần backend redesign.
- Existing user changes đã inventory và không bị overwrite.
- Required source-of-truth docs đã đọc trong lượt làm việc.

## Definition of done cho mỗi phase

- Artifact mục tiêu tồn tại và chỉ nằm trong scope phase.
- Automated commands pass; exact command/result được ghi.
- Visible behavior và negative/error cases có evidence.
- Docs bị ảnh hưởng được cập nhật ở phase sở hữu.
- `Kết quả thực hiện` chỉ dùng `No-change`, `Fix tối thiểu` hoặc `In-progress` canonical.
- Agent chỉ tick `Unit test check (Agent)` sau pass; manual item chỉ tick sau user confirmation.

## Acceptance tổng hợp

```text
npm ci
npm run admin:ci
npm run admin:e2e:install
npm test
npm run verify:docs
git diff --check
```

Manual release acceptance:

- Login/logout và protected deep-link.
- Project Config + Mappings không mất field/action.
- Backlog Find và một candidate sync flow với đúng feedback.
- Issue Editor source/canonical/evidence, dirty guard và translation review.
- Jira dry-run/payload/sync gate theo API hiện tại.
- Anomaly, Job và Journal operations.
- Desktop/tablet/mobile và keyboard-only.
- Production API rewrite hoạt động; `/admin*` không còn reachable.

## Điều kiện đóng plan

Plan UI migration chỉ chuyển `Complete` khi MUI-00 đến MUI-16A và MUI-17 đều có result/evidence, HG-01 đến HG-08 cùng HG-07A được xác nhận, full automated gate pass sau legacy cleanup, production smoke pass và không còn blocker UI migration. Trạng thái này không đóng `BE-PROJECT-SCOPE-01/02`; phase BE sau theo dõi riêng.
