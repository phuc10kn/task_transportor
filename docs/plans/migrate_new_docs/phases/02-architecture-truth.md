# Phase 02 - Sự thật kiến trúc

## Mục tiêu

Phase này hấp thụ architecture truth còn sống từ `docs_legacy/architecture/` vào đúng home trong `docs/`.

Architecture truth gồm:

- direction kiến trúc hiện tại;
- module structure;
- boundary và ownership rule;
- workflow architecture;
- custom modular monolith reasoning;
- rule triển khai module còn ảnh hưởng tới code.

Phần generic reusable không nên nằm trong app instance. Phần app-specific không nên nằm trong theory.

## Inputs bắt buộc

- `docs_legacy/architecture/README.md`
- `docs_legacy/architecture/01-direction.md`
- `docs_legacy/architecture/02-module-structure.md`
- `docs_legacy/architecture/03-module-template.md`
- `docs_legacy/architecture/04-boundaries.md`
- `docs_legacy/architecture/05-flow-template.md`
- `docs_legacy/architecture/06-evolution.md`
- `docs_legacy/architecture/07-boundary-cleanup.md`
- `docs_legacy/architecture/module-boundary-rules.md`
- `docs_legacy/architecture/custom_modular_monolith_theory/**`
- `docs_legacy/architecture/workflows/**`
- `docs/plans/migrate_new_docs/migration_matrix.md`
- `docs/app/05-architecture/**`
- `docs/app_technical/custom_modular_monolith/**`
- `docs/theories/modular-architecture/**`
- `docs/theories/hub-mediated-integration/**`
- `docs/theories/canonical-state-governance/**`
- `src/**`
- `package.json`

## Phân loại nội dung

| Nội dung legacy architecture | Destination |
| --- | --- |
| Generic modular monolith principle | `docs/theories/modular-architecture` |
| Generic reusable entity/template | `docs/app_technical/custom_modular_monolith` |
| Module thật của repo | `docs/app/05-architecture/01-structure` |
| Boundary thật của repo | `docs/app/05-architecture/02-boundaries` |
| Workflow thật | `docs/app/05-architecture/03-interactions` |
| State owner/data flow thật | `docs/app/05-architecture/04-state`, `05-data` |
| Module template reusable | `docs/app_technical/custom_modular_monolith` hoặc `docs/meta` |
| Boundary cleanup history | `docs/app/10-decisions` nếu còn lý do; `superseded` nếu chỉ là task history |
| Compatibility pointer | `docs/meta` hoặc discard nếu đã thay bằng docs mới |
| Quyết định kiến trúc | `docs/app/10-decisions` |

## Việc cần làm

1. So sánh `docs_legacy/architecture/02-module-structure.md` với module docs hiện tại.
2. So sánh `04-boundaries.md` với module-boundary entities hiện tại.
3. So sánh module/boundary docs với `src/` để tránh migrate rule đã lệch code.
4. Phân loại `03-module-template.md`, `07-boundary-cleanup.md`, `module-boundary-rules.md`.
5. Chuyển workflow architecture vào interaction-flow entities.
6. Chuyển reusable pattern vào `app_technical` hoặc theory, tùy abstraction.
7. Gắn `theory_basis` cho entity chính nếu còn thiếu.
8. Ghi conflict thành decision hoặc theory challenge.
9. Cập nhật matrix cho mọi file `docs_legacy/architecture/**`.
10. Xóa dependency đọc `docs_legacy/architecture` khỏi docs mới sau khi nội dung đã có home.

## Mapping ưu tiên

| Legacy file/cụm | Xử lý ưu tiên |
| --- | --- |
| `01-direction.md` | Merge vào context/architecture routing và decision |
| `02-module-structure.md` | Merge vào module entities và app_technical template |
| `03-module-template.md` | Split reusable template sang `app_technical`/`meta`, không trộn app instance |
| `04-boundaries.md` | Merge vào module-boundary/cross-cutting rules |
| `07-boundary-cleanup.md` | Extract decision/evidence nếu còn giá trị, không giữ task history thô |
| `module-boundary-rules.md` | Classify compatibility pointer; replace by current boundary home nếu đã superseded |
| `workflows/backlog-*.md` | Merge vào inbound interaction flows |
| `workflows/jira-dry-run.md` | Merge vào dry-run flow và sync safety docs |
| `workflows/cis-to-jira-sync.md` | Merge vào outbound sync interaction/data flow |
| `custom_modular_monolith_theory/**` | Split giữa `theories` và `app_technical` |

## Deliverables

- `app/05-architecture` tự đứng được như source of truth architecture.
- `app_technical/custom_modular_monolith` giữ template reusable đủ rõ.
- `theories/modular-architecture` không chứa workflow cụ thể của repo.
- Legacy architecture files có status cuối phase.
- Matrix rows for `docs_legacy/architecture/**` have owner, status and destination/reason.
- Không còn reference bắt buộc tới `docs_legacy/architecture` trong docs mới.

## Câu hỏi review

- Rule nào là reusable theory, rule nào chỉ là áp dụng trong repo này?
- Boundary docs mới đã đủ để code agent sửa module chưa?
- Workflow architecture có bị trùng giữa business và architecture không?
- Có module hoặc boundary nào trong legacy đã lỗi thời theo code hiện tại không?
- Template nào thuộc `app_technical`, template nào thuộc `meta`, template nào chỉ là history?

## Chốt chặn

Phase đạt khi:

- có thể review module boundary từ `docs/app/05-architecture`;
- các workflow chính có entity trong `03-interactions`;
- boundary và owner API rules không còn phụ thuộc file cũ;
- module/boundary docs đã được đối chiếu với code hiện tại;
- generic custom modular monolith không bị trộn với app instance.

## Không coi là xong nếu

- vẫn còn file trong docs mới nói nguồn chính đến từ `docs_legacy/architecture` mà chưa có home mới;
- generic theory bị trộn với source path, route, schema cụ thể;
- architecture workflow chỉ được paste vào một file tổng hợp;
- module map mới mâu thuẫn code mà không có note.
- `module-boundary-rules.md` vẫn là nguồn chính thay vì pointer/superseded record.

## Checklist nghiệm thu

- [x] Đã phân loại các file chính trong `docs_legacy/architecture`.
- [x] Đã phân loại `03-module-template.md`, `07-boundary-cleanup.md`, `module-boundary-rules.md`.
- [x] Module structure còn sống đã được phản ánh trong `docs/app/05-architecture`.
- [x] Boundary và ownership rule còn sống đã có entity hoặc rule home.
- [x] Workflow architecture chính đã được route vào interaction-flow phù hợp.
- [x] Ranh giới giữa app-specific architecture, reusable template và theory nền đã được chốt; deep import `custom_modular_monolith_theory/**` vẫn để Phase 05.
- [x] Nội dung reusable đã được đặt vào `docs/app_technical` hoặc `docs/theories`.
- [x] Conflict giữa architecture legacy và docs mới đã có decision, challenge hoặc note.
- [x] Reference bắt buộc tới `docs_legacy/architecture` ngoài migration plan đã được xóa; các reference còn lại trong matrix có phase owner/deadline.
- [x] Module/boundary docs đã được đối chiếu với `src/` trước khi chốt.
- [x] Matrix rows thuộc `docs_legacy/architecture` đã được cập nhật bằng status cuối phase.
- [x] Đã chạy lệnh verification của phase và ghi lại kết quả.
- [x] Người review đã xác nhận phase 02 đạt chốt chặn.

## Verification

```powershell
rg -n "docs_legacy/architecture" docs AGENTS.md -g "!docs/plans/migrate_new_docs/**"
rg -n "theory_basis:" docs/app/05-architecture
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]*docs_legacy/architecture/[^|]*\|[^|]+\|\s*02\s*\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
rg --files src/modules
```

Kết quả chạy Phase 02:

- `rg -n "docs_legacy/architecture" docs AGENTS.md -g "!docs/plans/migrate_new_docs/**"`: không còn reference bắt buộc ngoài migration plan.
- `rg -n "theory_basis:" docs/app/05-architecture`: có `theory_basis` trong module, boundary, interaction, state, data, deployment và cross-cutting entities chính.
- Matrix Phase 02 không còn row `docs_legacy/architecture/**` ở trạng thái `migrate`, `merge`, `defer` hoặc `keep-temporary`.
- Các row `docs_legacy/architecture/custom_modular_monolith_theory/**` vẫn thuộc Phase 05; Phase 02 không claim đã deep-import nhóm theory này.
- `rg --files src/modules`: xác nhận module code hiện có `Auth`, `Projects`, `Cis`, `Backlog`, `Translation`, `Mapping`, `Anomaly`, `Sync`, `Jira`, `Dashboard` và các `*Api.js` boundary chính.
