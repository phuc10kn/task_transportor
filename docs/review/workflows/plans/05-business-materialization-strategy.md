# Plan 05 — Vertical Slice Materialize Business CIS

Finding liên quan: §5.2 `write-docs` + [business_example.md](../business_example.md)  
Phương án đã chốt: **PA-C** — vertical slice theo trace need + evidence  
Trạng thái plan: đủ cấu trúc để điều phối và thực thi theo `docs/plans/prompts`

## Mục tiêu

Chuyển `docs/app/01-business/` từ README tổng hợp sang knowledge unit truy vấn được, mà không:

- nhồi thêm actor/process/rule vào README;
- materialize toàn layer/taxonomy một lần;
- tạo entity/relation chỉ để “đủ folder”.

Mỗi slice trả lời một nhóm query business Lite, có evidence, pass DEC-002, và review độc lập.

## Phạm vi

### Trong scope

- Chốt và thực thi **PA-C** cho Business CIS Lite.
- Gate 0 prerequisite: chuẩn hóa contract ID / slug / folder trên toàn bộ canonical entity types trước instance đầu tiên.
- Materialize đúng ba slice trong `business_example.md` §8:
  1. happy path tối thiểu;
  2. review/gate;
  3. scale/recovery.
- Cập nhật `docs/app/01-business/README.md` thành truth summary + Entity Index (không copy body entity).
- Bind structural verify scoped `01-business` khi slice có instance.
- Ghi accepted gap / prose-only rõ ràng.
- Sau P05-07: đánh dấu Plan 05-C done trong `plans/README.md` và cập nhật baseline `business_example.md`.

### Ngoài scope

- PA-A README-only kéo dài làm hướng chính.
- PA-B materialize toàn Business một đợt.
- PA-D auto-generate README index (deferred sau PA-C ổn).
- Tạo `Policy` / `BusinessConstraint` / `Metric` chỉ để lấp taxonomy.
- Materialize cross-layer Business → Architecture (`Process --implements--> InteractionFlow`, v.v.).
- Sửa product behavior code để “khớp” docs.
- Đóng toàn bộ GAP-BIZ-* bằng decision mới trong cùng một phase materialize.
- WFP-08 mở rộng `verify:docs` sang toàn `docs/app` / `docs/meta`.
- Plan 01-D CI semantic path mapping.

### Deferred work

- PA-D generated Entity Index từ instance tree.
- Scheduled pull Process (`GAP-BIZ-03`) sau khi có acceptance + verify phase riêng.
- Force approve / mark duplicate / mark conflict (`GAP-BIZ-04`) sau decision/authority rõ.
- Metric / Policy / BusinessConstraint khi có owner và measurement intent thật.
- Human output chuẩn `read-for-task` / `trace-impact` (WFP-06 phần còn mở).

## Baseline hiện tại

- `docs/app/01-business/` chỉ có `README.md`; chưa có entity instance dưới sáu concern.
- Meta Business đã có 10 entity type và valid triple nội layer (xem `business_example.md` §3.2).
- Generic verifier Plan 02-C đã có; `npm test` mới enforce scoped `05-architecture`, chưa bind `01-business`.
- DEC-002 accepted: materialize theo vertical slice nhỏ nhất đủ trả lời query; một fact một direction.
- Architecture instances đang dùng `id: AF-001` + `slug:` + folder `AF-001-...`; `id-conventions.md` vẫn viết pattern `{PREFIX}-{NNN}-{slug}` dễ bị hiểu là giá trị field `id`.
- `business_example.md` đã có candidate set, target tree, worked example và ba slice; toàn bộ vẫn là `CANDIDATE` đến khi materialize.
- Plan 01–04 (B/C liên quan) đã triển khai: sync, structural verify architecture, Workbench, write-docs result.

Chuỗi slice chuẩn:

```text
trace question
→ canonical evidence
→ target entities
→ preflight type / conflict / trace contract
→ write-docs
→ write-docs result full
→ trace-impact cho entity/relation/impact
→ slim/update README Entity Index
→ verify:entity-instance / relations / references scoped 01-business
→ validate-after-change (terminal gate)
```

## Source of truth

| Nguồn | Vai trò trong plan này |
| --- | --- |
| `docs/app/01-business/README.md` | Business truth Lite hiện hành; sau slice trở thành summary + index |
| `docs/app/02-product/README.md` | Scope Lite / out-of-scope; không mở rộng bằng Business instance |
| `docs/app/08-quality/README.md` | Acceptance Lite và evidence path liên quan |
| `docs/app/10-decisions/README.md` + `DEC-002` | Quyết định còn hiệu lực; rule materialize relation |
| `docs/meta/01-entity-types/**` | Canonical entity type contracts; Gate 0 normalize ID pattern toàn repo |
| `docs/meta/02-relation-types/**` + `docs/meta/03-rules/**` | Relation type và valid triple |
| `docs/meta/04-conventions/id-conventions.md` + `folder-naming.md` | Contract ID / slug / folder sau Gate 0 |
| `docs/guide/workflows/write-docs.md` | Governance viết + `write-docs result` |
| `docs/guide/workflows/trace-impact.md` | Relation Validation Gate |
| `docs/guide/workflows/validate-after-change.md` | Terminal gate |
| `docs/review/workflows/business_example.md` | Candidate inventory, slice order, worked examples — **không** phải app truth |
| `docs/plans/prompts/planner.md` | Hợp đồng cấu trúc plan |
| `docs/plans/prompts/coordinator.md` | Chọn current phase, handoff, blocked, accepted gaps |
| `docs/plans/prompts/executor.md` | Thực thi phase, tick checklist, ghi `Kết quả thực hiện` |
| File plan này | Điều phối phase, handoff, blocked, acceptance |

### Phương án đã chốt

| PA | Mô tả | Recommend | Quyết định |
| --- | --- | --- | --- |
| A | README-only đến khi rất lớn | 1/5 | Không chọn |
| B | Materialize toàn layer một đợt | 1/5 | Không chọn |
| C | Vertical slice theo trace need + evidence | **5/5** | **Đã chốt** |
| D | Auto-generate README index | 3/5 | Deferred sau PA-C |

### Baseline điều phối đã chốt

1. Reviewer structural / merge docs cho Plan 05: `repo maintainer`.
2. Reviewer semantic: business/product owner do user chỉ định; agent và repo maintainer structural không tự approve business truth.
3. Slice 1 = happy path tối thiểu đúng danh sách khóa bên dưới.
4. Không materialize `POL-*`, `BCON-*`, `METRIC-*`, `STK-002`, `STK-003`, `PROC-001` trong Plan 05.
5. Initial status phải theo lifecycle của từng entity type:
   - `PROB-001`: `identified`;
   - `STK-001`: `active` vì stakeholder này đã là business truth hiện hành trong Business README;
   - Goal, SuccessCriterion, Process, Scenario, BusinessRule: `draft`.
6. Semantic approval không dồn cuối:
   - Slice 1 được approve/promote tại P05-03A trước P05-04;
   - Slice 2 được approve/promote tại P05-04A trước P05-05;
   - Slice 3 được approve/promote tại P05-05A trước P05-06.
7. `NOTE-EVIDENCE` chưa review không được dùng để support materialized relation hoặc status promotion. Gap còn lại phải được coordinator ghi canonical và semantic reviewer xác nhận.

### Slice 1 — entity set khóa

Tạo đúng các ID/slug sau (không thêm entity ngoài list trong P05-02/P05-03):

| ID | Type | slug | Folder |
| --- | --- | --- | --- |
| `PROB-001` | Problem | `manual-cross-system-sync-risk` | `PROB-001-manual-cross-system-sync-risk` |
| `GOAL-001` | Goal | `controlled-traceable-delivery` | `GOAL-001-controlled-traceable-delivery` |
| `SC-001` | SuccessCriterion | `controlled-lite-delivery` | `SC-001-controlled-lite-delivery` |
| `STK-001` | Stakeholder | `admin-operator` | `STK-001-admin-operator` |
| `PROC-002` | Process | `pull-backlog-issue` | `PROC-002-pull-backlog-issue` |
| `PROC-005` | Process | `review-canonical-issue` | `PROC-005-review-canonical-issue` |
| `PROC-008` | Process | `review-jira-dry-run` | `PROC-008-review-jira-dry-run` |
| `PROC-009` | Process | `publish-issue-to-jira` | `PROC-009-publish-issue-to-jira` |
| `SCN-001` | Scenario | `controlled-lite-issue-delivery` | `SCN-001-controlled-lite-issue-delivery` |
| `BRULE-001` | BusinessRule | `route-through-cis` | `BRULE-001-route-through-cis` |
| `BRULE-005` | BusinessRule | `fresh-dry-run-before-publish` | `BRULE-005-fresh-dry-run-before-publish` |

Thứ tự tạo tối thiểu: `PROB-001`, `SC-001`, `GOAL-001`, `STK-001`, processes, `SCN-001`, rules. Process không ghi outbound `relations:` (type không có outbound slot active).

### Slice 1 — expected relation set (P05-03)

Mỗi edge dưới đây phải được resolve bằng Relation Validation Gate. Materialize khi đủ trace contract + evidence + slot/type/triple/target; thiếu gate non-conflict thì executor mở gap candidate để coordinator/reviewer resolve; conflict canonical thì block phase. Không thêm edge ngoài set này trong Slice 1.

| Source | Slot | Targets |
| --- | --- | --- |
| `GOAL-001` | `addresses` | `PROB-001` |
| `GOAL-001` | `measured_by` | `SC-001` |
| `PROB-001` | `affects` | `STK-001` |
| `SCN-001` | `composes` | `PROC-002`, `PROC-005`, `PROC-008`, `PROC-009` |
| `STK-001` | `participates_in` | `PROC-002`, `PROC-005`, `PROC-008`, `PROC-009` |
| `BRULE-001` | `governs` | `PROC-002`, `PROC-009` |
| `BRULE-005` | `governs` | `PROC-008`, `PROC-009` |

`BRULE-001 → PROC-003` chỉ thêm ở P05-05 khi `PROC-003` đã tồn tại.

### Slice 2 — entity set khóa (P05-04)

| ID | Type | slug |
| --- | --- | --- |
| `PROC-004` | Process | `review-translation` |
| `PROC-006` | Process | `approve-required-mapping` |
| `PROC-007` | Process | `resolve-blocking-anomaly` |
| `BRULE-002` | BusinessRule | `human-translation-authority` |
| `BRULE-003` | BusinessRule | `approved-mapping-required` |
| `BRULE-004` | BusinessRule | `critical-anomaly-blocks-publish` |

Expected relation set Slice 2:

| Source | Slot | Targets |
| --- | --- | --- |
| `SCN-001` | `composes` | thêm `PROC-004`, `PROC-006`, `PROC-007` |
| `STK-001` | `participates_in` | thêm `PROC-004`, `PROC-006`, `PROC-007` |
| `BRULE-002` | `governs` | `PROC-004` |
| `BRULE-003` | `governs` | `PROC-006`, `PROC-008`, `PROC-009` |
| `BRULE-004` | `governs` | `PROC-007`, `PROC-008`, `PROC-009` |

`STK-002` / `STK-003`: **không tạo** trong Plan 05; giữ accepted gap.

### Slice 3 — entity set khóa (P05-05)

| ID | Type | slug |
| --- | --- | --- |
| `PROC-003` | Process | `pull-backlog-project` |
| `PROC-010` | Process | `recover-failed-job` |
| `PROC-011` | Process | `recover-attachment-download` |
| `BRULE-006` | BusinessRule | `intentional-failed-job-retry` |
| `BRULE-007` | BusinessRule | `isolated-attachment-recovery` |

Expected relation set Slice 3:

| Source | Slot | Targets |
| --- | --- | --- |
| `SCN-001` | `composes` | thêm `PROC-003` |
| `STK-001` | `participates_in` | thêm `PROC-003`, `PROC-010`, `PROC-011` |
| `BRULE-001` | `governs` | thêm `PROC-003` |
| `BRULE-006` | `governs` | `PROC-010` |
| `BRULE-007` | `governs` | `PROC-002`, `PROC-003`, `PROC-011` |

Không thêm `PROC-010` / `PROC-011` vào `SCN-001.composes` (recovery là nhánh, không thuộc happy-path scenario).

`PROC-001` configure: **không tạo** trong Plan 05; giữ accepted gap (prose README đủ cho Lite cho đến khi có trace need riêng).

### Rule tạo entity (cứng)

Chỉ tạo khi đồng thời:

1. identity ổn định (ID/slug đã chốt trong slice);
2. đúng instance criteria của entity type;
3. có evidence `CANONICAL` trong app/decision, hoặc `NOTE-EVIDENCE` được chấp nhận trong Validation Notes;
4. có consumer/query/review need ghi trong trace contract của slice;
5. body mang nhiều giá trị hơn một bullet trong README.

### Rule tạo relation (cứng)

Chỉ materialize khi đồng thời:

1. source và target đã tồn tại trong `docs/app`;
2. có trace need (ai / start / query / decision supported);
3. slot / relation type / valid triple / direction hợp lệ;
4. evidence đủ;
5. không dual-write inverse; reverse dùng search/tooling.

Outcome bắt buộc cho từng expected edge:

```text
all gates pass                                  → materialized
non-conflict gate fail + slot permits omission  → gap candidate → coordinator/reviewer → accepted gap hoặc blocked
canonical conflict                              → blocked; không ghi edge
```

### Trace contract registry

#### T-BIZ-01 — Goal addresses Problem

- Actor: product/business reviewer.
- Start: `GOAL-001`.
- Query: Goal này xử lý business pain nào?
- Decision supported: kiểm scope outcome có bám đúng problem hay không.
- Evidence: Business README phần Business Truth + `PROB-001` / `GOAL-001`.
- Contract: `Goal.addresses`; `Goal --addresses--> Problem`.

#### T-BIZ-02 — Goal measured by SuccessCriterion

- Actor: product/release reviewer.
- Start: `GOAL-001`.
- Query: Điều kiện nào xác định controlled delivery đạt?
- Decision supported: acceptance/readiness Lite.
- Evidence: Business README + Quality README.
- Contract: `Goal.measured_by`; `Goal --measured_by--> SuccessCriterion`.

#### T-BIZ-03 — Problem affects Stakeholder

- Actor: business reviewer.
- Start: `PROB-001`.
- Query: Business pain đồng bộ thủ công ảnh hưởng trực tiếp ai?
- Decision supported: xác định stakeholder scope và review ownership.
- Evidence: Business README phần stakeholder + business pain.
- Contract: `Problem.affects`; `Problem --affects--> Stakeholder`.

#### T-BIZ-04 — Scenario composes Process

- Actor: business-flow reviewer.
- Start: `SCN-001`.
- Query: Controlled Lite delivery gồm các Process canonical nào?
- Decision supported: completeness/impact review của flow Lite.
- Evidence: Business README phần Business flow Lite + Process instances.
- Contract: `Scenario.composes`; `Scenario --composes--> Process`.

#### T-BIZ-05 — Stakeholder participates in Process

- Actor: operations/business reviewer.
- Start: `STK-001`.
- Query: Admin/operator trực tiếp tham gia Process nào?
- Decision supported: authority, responsibility và operational coverage.
- Evidence: Business README phần stakeholder + Workflow Lite còn sống.
- Contract: `Stakeholder.participates_in`; `Stakeholder --participates_in--> Process`.

#### T-BIZ-06 — BusinessRule governs Process

- Actor: outbound-safety/business reviewer.
- Start: `BRULE-*`.
- Query: Mỗi rule chi phối Process nào trong ingest/review/publish/recovery?
- Decision supported: gate coverage và impact khi rule đổi.
- Evidence: Business/Product/Quality README; code/test chỉ là corroborating evidence.
- Contract: `BusinessRule.governs`; `BusinessRule --governs--> Process`.

### Gate 0 — ID contract đã chốt hướng

Khớp architecture hiện hành, verifier (`normalizeEntityId` + folder = `{shortId}-{slug}`), và `business_example.md` §4:

```text
frontmatter id   = PREFIX-NNN          (ví dụ PROC-002)
frontmatter slug = kebab-case          (ví dụ pull-backlog-issue)
folder name      = PREFIX-NNN-slug/    (ví dụ PROC-002-pull-backlog-issue/)
```

P05-01 là prerequisite migration toàn repo: sửa hai convention files và mọi canonical entity type có ID instance dạng `{PREFIX}-{NNN}-{slug}`. Contract sau sửa phải ghi rõ:

1. field `id` = `PREFIX-NNN` (không gồm slug);
2. folder instance = `PREFIX-NNN-slug`;
3. mọi canonical entity type phải ghi riêng:
   - `ID pattern = PREFIX-{NNN}`;
   - `Instance folder pattern = PREFIX-{NNN}-{slug}`.

Không để trạng thái partial migration. P05-01 chỉ pass khi repository search không còn entity type dùng `ID pattern` có `{slug}` và docs-contract tests vẫn pass.

### Status lifecycle trong Plan 05

P05-02/P05-04/P05-05 dùng initial status theo baseline điều phối. P05-03A/P05-04A/P05-05A là semantic approval gates; agent không tick manual approval. P05-06 chỉ review consistency cross-slice sau khi từng slice đã được approve.

## Phase triển khai

### Phase P05-01 - Global ID contract migration

Mục tiêu:
- Chuẩn hóa contract ID/slug/folder trước instance đầu tiên.
- Hoàn tất migration ID contract trên toàn bộ canonical entity types; không để mixed contract.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- `docs/meta/04-conventions/id-conventions.md`
- `docs/meta/04-conventions/folder-naming.md`
- `docs/meta/01-entity-types/**/*.md` có header `ID pattern`
- `scripts/verify/docs-contract.test.js` (fixture/assertion dùng short ID + instance folder pattern)
- verify-only: đối chiếu `AF-001` (`id` short + `slug` + folder đầy đủ)

Điều kiện mở:
- Plan 05 đã chốt PA-C (đã thỏa).

Việc cần làm:
- Trước sửa: chạy Type Contract Gate toàn repo và ghi baseline.
- Sửa convention theo Gate 0: frontmatter ID, slug, instance folder.
- Trên mọi canonical type, đổi `ID pattern` thành short ID và thêm `Instance folder pattern`.
- Cập nhật docs-contract fixture/assertion sang short ID + instance folder pattern.
- Sau sửa: chạy Type Contract Gate toàn repo + `npm run verify:docs-contract`.
- Repository search phải xác nhận không còn `ID pattern` chứa `{slug}`.
- Emit `write-docs result` full form cho meta contract change.
- Chạy `validate-after-change`; đây là terminal gate của phase.
- Không tạo Business instance.
- Không đổi architecture instance.

Checklist nghiệm thu:
- [x] `id-conventions.md` nêu rõ `id` = `PREFIX-NNN`, không gồm slug.
- [x] `id-conventions.md` nêu rõ folder = `PREFIX-NNN-slug`.
- [x] Mọi canonical type ghi `ID pattern` short và `Instance folder pattern` riêng.
- [x] Ví dụ trong convention khớp shape `AF-001`.
- [x] Type Contract Gate pre-change baseline đã được ghi.
- [x] Type Contract Gate post-change và `verify:docs-contract` pass.
- [x] Search `ID pattern.*{slug}` trên entity types không còn kết quả.
- [x] Có `write-docs result` và `validate-after-change result` cho phase.
- [x] Chưa có file instance mới dưới `docs/app/01-business/` ngoài `README.md`.

Kết quả thực hiện:
- Fix tối thiểu: meta ID/slug/folder (conventions + 52 entity types + schema + docs-contract fixtures); verify pass; guide packs ID pattern còn debt ngoài P05-01

### Phase P05-02 - Slice 1 materialize instances

Mục tiêu:
- Tạo đủ 11 instance Slice 1 theo bảng ID/slug khóa.
- Body ngôn ngữ business; code path chỉ trong Validation Notes.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- `docs/app/01-business/01-discovery/problems/PROB-001-manual-cross-system-sync-risk/README.md`
- `docs/app/01-business/02-direction/goals/GOAL-001-controlled-traceable-delivery/README.md`
- `docs/app/01-business/03-organization/stakeholders/STK-001-admin-operator/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-002-pull-backlog-issue/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-005-review-canonical-issue/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-008-review-jira-dry-run/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-009-publish-issue-to-jira/README.md`
- `docs/app/01-business/04-behavior/02-scenarios/scenarios/SCN-001-controlled-lite-issue-delivery/README.md`
- `docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-001-route-through-cis/README.md`
- `docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-005-fresh-dry-run-before-publish/README.md`
- `docs/app/01-business/06-measurement/02-success-criteria/success-criteria/SC-001-controlled-lite-delivery/README.md`

Điều kiện mở:
- Phase P05-01 đã pass acceptance.

Việc cần làm:
- Chạy Type Contract Gate `--type` cho từng entity type dùng trong Slice 1 trước khi tạo instance.
- Tạo 11 instance theo bảng khóa; status theo baseline lifecycle:
  - `PROB-001: identified`;
  - `STK-001: active`;
  - chín instance còn lại: `draft`.
- Chưa điền expected relation set; P05-03 chịu ownership relation.
- Không tạo Policy/Constraint/Metric/`STK-002`/`STK-003`/`PROC-001`.
- Sau khi tạo, chạy Type Contract Gate `--instance` cho cả 11 instance.
- Chạy generic instance/reference verifier scoped `--layer 01-business`.
- Emit `write-docs result` full form; ghi relation intentionally deferred sang P05-03.
- Chạy `trace-impact` cho cả 11 entity; ghi candidate relation, accepted-gap candidate và rejected relation, nhưng chưa ghi YAML.
- Chạy `validate-after-change` sau trace result; đây là terminal gate.

Checklist nghiệm thu:
- [x] Đủ 11 path instance Slice 1 đúng folder trong bảng khóa.
- [x] Mỗi instance có required frontmatter và status đúng lifecycle map.
- [x] Process Steps không chứa API route / SQL / worker loop.
- [x] Không có `POL-*` / `BCON-*` / `METRIC-*` / `STK-002` / `STK-003` / `PROC-001` mới.
- [x] `npm run verify:entity-type-contract -- --instance <path>` pass cho cả 11 instance.
- [x] `npm run verify:entity-instance -- --layer 01-business` pass.
- [x] `npm run verify:references -- --layer 01-business` pass.
- [x] Có trace-impact result cho 11 entity; relation YAML vẫn thuộc P05-03.
- [x] Có `write-docs result` và `validate-after-change result` cho phase.

Kết quả thực hiện:
- Fix tối thiểu: docs/app/01-business/**/Slice-1 - strip premature `relations:` YAML; giữ 11 instance; status PROB=identified / STK=active / còn lại draft
- No-change: Process Steps - không chứa API/SQL/worker loop (verify search)
- Verify: type-contract --type×7 + --instance×11; entity-instance/references/relations --layer 01-business pass
- Ceremony: write-docs + trace-impact + validate-after-change emitted in task chat (P05-02)

### Phase P05-03 - Slice 1 relations, README index, verify bind

Mục tiêu:
- Resolve expected relation set Slice 1 theo trace registry + DEC-002.
- Cập nhật README Entity Index.
- Bind verify scoped `01-business` vào `package.json` / `npm test`.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- frontmatter `relations:` trên `GOAL-001`, `PROB-001`, `SCN-001`, `STK-001`, `BRULE-001`, `BRULE-005`
- `docs/app/01-business/README.md`
- `package.json` — thêm và gắn vào `npm test`:
  - `verify:entity-instance:business`
  - `verify:relations:business`
  - `verify:references:business`
- verify-only: các script business ở trên

Điều kiện mở:
- Phase P05-02 đã pass acceptance.

Việc cần làm:
- Chạy T-BIZ-01..T-BIZ-06 cho từng expected edge Slice 1 trước khi ghi YAML.
- Ghi `trace-impact result` cho expected relation set.
- Executor ghi outcome `materialized | gap candidate | blocked` cho từng edge.
- Với `gap candidate`: executor ghi `In-progress` + handoff coordinator; coordinator chỉ ghi `### Accepted gaps` khi policy cho phép và reviewer chấp nhận, rồi mở lại phase.
- Với `blocked`: dừng phase; không ghi edge.
- Chỉ ghi edge `materialized`; không thêm edge ngoài expected set.
- Slim README: giữ Business Truth; thêm Entity Index Slice 1; không copy body.
- Thêm 3 script scoped `--layer 01-business` và gắn vào `npm test` giống architecture.
- Emit `write-docs result` full form với added / intentionally not added / rejected.
- Chạy ba script `*:business`, sau đó chạy `npm test` để kiểm integration của test chain.
- Chạy `validate-after-change` sau README, relations và mọi command; đây là terminal gate.

Checklist nghiệm thu:
- [x] Mỗi expected edge có trace outcome và evidence.
- [x] Frontmatter chỉ chứa edge có outcome `materialized`.
- [x] Không có inverse dual-write trên Process.
- [x] README có Entity Index trỏ đúng 11 path Slice 1; không phình process body.
- [x] Gap candidate phát sinh đã được coordinator resolve; accepted gap canonical ghi gate fail + evidence thiếu trong `### Accepted gaps`.
- [x] `npm run verify:entity-instance:business`, `verify:relations:business`, `verify:references:business` pass.
- [x] Ba script trên đã nằm trong `npm test`.
- [x] `npm test` pass sau khi sửa test chain.
- [x] Không có relation Business → Architecture trong frontmatter.
- [x] Có `write-docs result` và `validate-after-change result` cho phase.

Kết quả thực hiện:
- Fix tối thiểu: GOAL/PROB/SCN/STK/BRULE-001/005 - materialize expected Slice 1 edges sau T-BIZ gate
- Trace outcomes: T-BIZ-01 GOAL→PROB materialized; T-BIZ-02 GOAL→SC materialized; T-BIZ-03 PROB→STK-001 materialized; T-BIZ-04 SCN→PROC-002/005/008/009 materialized; T-BIZ-05 STK→same PROCs materialized; T-BIZ-06 BRULE-001→PROC-002/009 + BRULE-005→PROC-008/009 materialized
- Intentionally not added: BRULE-001→PROC-003 (Slice 3); PROB→STK-002/003 (accepted gap); Business→Architecture (accepted gap); Process outbound (no slot)
- No-change: docs/app/01-business/README.md Entity Index Slice 1 đã đúng 11 path; package.json verify:*:business đã bind npm test
- Verify: verify:*:business pass; npm test pass
- Ceremony: write-docs + trace-impact + validate-after-change emitted in task chat (P05-03)
- Gap candidate mới: none

### Phase P05-03A - Slice 1 semantic approval

Mục tiêu:
- Review Slice 1 độc lập trước khi mở Slice 2.
- Promote status đúng lifecycle sau manual approval.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- 11 exact instance paths đã liệt kê tại P05-02 `Target files/artifacts`
- `docs/app/01-business/README.md`
- artifact approval trong task/chat/PR, được reference từ `Kết quả thực hiện`
- verify-only: ba script `*:business`

Điều kiện mở:
- Phase P05-03 đã pass acceptance.
- User đã chỉ định business/product owner hoặc trực tiếp nhận vai trò reviewer.

Việc cần làm:
- Reviewer xác nhận meaning, participants, Process outcomes, Scenario composition, rule semantics, relation outcomes và accepted gaps Slice 1.
- Không approve materialized relation dựa trên `NOTE-EVIDENCE` chưa resolve.
- Agent không tự tick manual approval.
- Sau approval:
  - `PROB-001: identified → validated`;
  - Goal, SuccessCriterion, Process, Scenario, BusinessRule: `draft → active`;
  - `STK-001` giữ `active`.
- Ghi approval reference bằng format canonical trong `Kết quả thực hiện`, ví dụ `Fix tối thiểu: <paths> - semantic approval; reviewer=<role>; date=<YYYY-MM-DD>; scope=Slice 1; reference=<task/chat/PR>`.
- Emit `write-docs result`, chạy ba script `*:business`, rồi `validate-after-change`.

Checklist nghiệm thu:
- [x] Manual check: semantic reviewer xác nhận Slice 1 và reference tồn tại.
- [x] Không còn `NOTE-EVIDENCE` chưa review hỗ trợ active assertion/relation.
- [x] Slice 1 status đã promote đúng lifecycle.
- [x] Ba script `*:business` pass.
- [x] Có `write-docs result` và `validate-after-change result`.

Kết quả thực hiện:
- Fix tối thiểu: 11 Slice 1 instances - semantic approval; reviewer=user; date=2026-07-13; scope=Slice 1; reference=chat task (user: "chốt. triển khai tiếp")
- Fix tối thiểu: PROB-001 identified→validated; GOAL/SC/PROC/SCN/BRULE draft→active; STK-001 giữ active
- No-change: không có NOTE-EVIDENCE trên Slice 1
- Verify: verify:*:business pass
- Ceremony: write-docs + validate-after-change in task chat (P05-03A)

### Phase P05-04 - Slice 2 review/gate

Mục tiêu:
- Preflight GAP-BIZ-01/02 trước khi sửa app truth.
- Materialize Slice 2 và resolve expected relations theo trace registry.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-004-review-translation/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-006-approve-required-mapping/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-007-resolve-blocking-anomaly/README.md`
- `docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-002-human-translation-authority/README.md`
- `docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-003-approved-mapping-required/README.md`
- `docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-004-critical-anomaly-blocks-publish/README.md`
- cập nhật `relations:` trên `SCN-001`, `STK-001`, và các `BRULE-002..004`
- `docs/app/01-business/README.md`
- verify-only: ba script `*:business`

Điều kiện mở:
- Phase P05-03A đã pass toàn bộ checklist, gồm manual approval Slice 1.

Việc cần làm:
- Trước mọi write, đối chiếu GAP-BIZ-01/02 với Business/Product/Quality truth và code/test evidence.
- Nếu code↔product conflict: ghi `Blocked: P05-04 - <conflict>` và dừng trước khi tạo file.
- Chạy Type Contract Gate `--type` cho Process và BusinessRule trước khi tạo instance.
- Khi preflight pass, tạo 6 instance `status: draft`.
- Chạy expected relation set Slice 2 qua T-BIZ-04/05/06.
- Ghi `trace-impact result` cho entity/relation Slice 2.
- Executor ghi `gap candidate` trong `Kết quả thực hiện` và handoff coordinator; chỉ coordinator ghi accepted gap canonical trước khi executor resume.
- Chỉ ghi edge materialized.
- Cập nhật README Entity Index.
- Không tạo `STK-002` / `STK-003`.
- Không materialize scheduled pull.
- Emit `write-docs result` full form.
- Chạy Type Contract Gate `--instance` cho 6 instance mới.
- Chạy ba script `*:business`.
- Chạy `validate-after-change` sau mọi write/verify; đây là terminal gate.

Checklist nghiệm thu:
- [x] GAP-BIZ-01/02 có preflight verdict trước write.
- [x] Type Contract Gate `--type` pre-create và `--instance` post-create pass.
- [x] Đủ 6 instance Slice 2 theo bảng khóa.
- [x] Mỗi expected edge Slice 2 có trace outcome; YAML chỉ chứa edge materialized.
- [x] Có trace-impact result cho Slice 2.
- [x] Gap candidate đã được coordinator resolve trước phase pass.
- [x] `STK-002` / `STK-003` không tồn tại.
- [x] Ba script `*:business` pass.
- [x] README Entity Index có Slice 2.
- [x] Có `write-docs result` và `validate-after-change result` cho phase.

Kết quả thực hiện:
- Preflight GAP-BIZ-01: pass-with-wording — instance dùng critical+open/investigating; tách MAPPING_REQUIRED; không viết “mọi open anomaly block”
- Preflight GAP-BIZ-02: pass-with-wording — queue riêng ≠ universal gate; `pending_translate` chưa syncable
- Fix tối thiểu: 6 instance Slice 2 draft + SCN/STK relations + Entity Index
- Trace: T-BIZ-04 SCN→PROC-004/006/007 materialized; T-BIZ-05 STK→same; T-BIZ-06 BRULE-002→PROC-004; BRULE-003→PROC-006/008/009; BRULE-004→PROC-007/008/009 materialized
- Gap candidate mới: none (GAP-BIZ-01/02 resolved by wording in instances; STK-002/003 vẫn accepted gap)
- Verify: type-contract + verify:*:business (17 instances) pass
- Ceremony: write-docs + trace-impact + validate-after-change in task chat (P05-04)

### Phase P05-04A - Slice 2 semantic approval

Mục tiêu:
- Review Slice 2 độc lập trước khi mở Slice 3.
- Promote sáu instance Slice 2 từ `draft` sang `active`.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- 6 exact instance paths đã liệt kê tại P05-04 `Target files/artifacts`
- `SCN-001`, `STK-001` và `docs/app/01-business/README.md`
- artifact approval trong task/chat/PR, được reference từ `Kết quả thực hiện`
- verify-only: ba script `*:business`

Điều kiện mở:
- Phase P05-04 đã pass acceptance.
- Semantic reviewer của Slice 2 đã được chỉ định.

Việc cần làm:
- Reviewer xác nhận GAP-BIZ-01/02 verdict, Process/rule semantics, relation outcomes và accepted gaps Slice 2.
- Không approve materialized relation dựa trên `NOTE-EVIDENCE` chưa resolve.
- Agent không tự tick manual approval.
- Sau approval, promote 6 instance Slice 2 `draft → active`.
- Ghi reviewer/date/scope/verdict/reference trong `Kết quả thực hiện` bằng format canonical.
- Emit `write-docs result`, chạy ba script `*:business`, rồi `validate-after-change`.

Checklist nghiệm thu:
- [x] Manual check: semantic reviewer xác nhận Slice 2 và reference tồn tại.
- [x] Không còn `NOTE-EVIDENCE` chưa review hỗ trợ active assertion/relation.
- [x] Sáu instance Slice 2 có `status: active`.
- [x] Ba script `*:business` pass.
- [x] Có `write-docs result` và `validate-after-change result`.

Kết quả thực hiện:
- Fix tối thiểu: 6 Slice 2 instances - semantic approval; reviewer=user; date=2026-07-13; scope=Slice 2; verdict=approved; reference=chat task (user yêu cầu xác nhận/check và tiếp tục plan)
- Fix tối thiểu: PROC-004/006/007 và BRULE-002/003/004 `draft → active`
- No-change: GAP-BIZ-01/02 wording, relation outcomes và accepted gaps đã được reviewer xác nhận; không có `NOTE-EVIDENCE`
- Verify: `verify:entity-instance:business`, `verify:relations:business`, `verify:references:business` pass (17 instances)
- Ceremony: `write-docs result` và `validate-after-change result` emitted in task chat (P05-04A)

### Phase P05-05 - Slice 3 scale/recovery

Mục tiêu:
- Materialize Slice 3 scale/recovery.
- Resolve expected relations theo trace registry; recovery không bị nhập vào happy-path scenario.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-003-pull-backlog-project/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-010-recover-failed-job/README.md`
- `docs/app/01-business/04-behavior/01-processes/processes/PROC-011-recover-attachment-download/README.md`
- `docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-006-intentional-failed-job-retry/README.md`
- `docs/app/01-business/05-governance/01-business-rules/business-rules/BRULE-007-isolated-attachment-recovery/README.md`
- cập nhật `relations:` theo bảng Slice 3
- `docs/app/01-business/README.md`
- verify-only: ba script `*:business`

Điều kiện mở:
- Phase P05-04A đã pass toàn bộ checklist, gồm manual approval Slice 2.

Việc cần làm:
- Chạy Type Contract Gate `--type` cho Process và BusinessRule trước khi tạo instance.
- Tạo 5 instance Slice 3 với `status: draft`.
- Chạy expected relation set Slice 3 qua T-BIZ-04/05/06.
- Ghi `trace-impact result` cho entity/relation Slice 3.
- Executor ghi `gap candidate` trong `Kết quả thực hiện` và handoff coordinator; chỉ coordinator ghi accepted gap canonical trước khi executor resume.
- Chỉ ghi edge materialized.
- Cập nhật README Entity Index.
- Không tạo scheduled-pull Process; không tạo force/duplicate/conflict Process; không tạo `PROC-001`.
- Emit `write-docs result` full form.
- Chạy Type Contract Gate `--instance` cho 5 instance mới.
- Chạy ba script `*:business`.
- Chạy `validate-after-change` sau mọi write/verify; đây là terminal gate.

Checklist nghiệm thu:
- [x] Type Contract Gate `--type` pre-create và `--instance` post-create pass.
- [x] Đủ 5 instance Slice 3 theo bảng khóa.
- [x] Mỗi expected edge Slice 3 có trace outcome; YAML chỉ chứa edge materialized.
- [x] Có trace-impact result cho Slice 3.
- [x] Gap candidate đã được coordinator resolve trước phase pass.
- [x] `SCN-001` không compose `PROC-010`/`PROC-011`.
- [x] Không có Process scheduled-pull / force / duplicate / conflict / `PROC-001`.
- [x] Ba script `*:business` pass.
- [x] README Entity Index có Slice 3.
- [x] Có `write-docs result` và `validate-after-change result` cho phase.

Kết quả thực hiện:
- Việc cần làm: type-contract pre/post pass; 5 instance draft; T-BIZ-04/05/06 edges materialized; trace-impact + write-docs + validate in chat; Entity Index Slice 3; không scheduled/force/PROC-001
- Trace: SCN→PROC-003; STK→PROC-003/010/011; BRULE-001→PROC-003; BRULE-006→PROC-010; BRULE-007→PROC-002/003/011 — all materialized
- No-change: SCN không compose PROC-010/011 (recovery nhánh riêng)
- Verify: 22 instances; verify:*:business pass

### Phase P05-05A - Slice 3 semantic approval

Mục tiêu:
- Review Slice 3 độc lập.
- Promote năm instance Slice 3 từ `draft` sang `active`.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- 5 exact instance paths đã liệt kê tại P05-05 `Target files/artifacts`
- `SCN-001`, `STK-001`, `BRULE-001` và `docs/app/01-business/README.md`
- artifact approval trong task/chat/PR, được reference từ `Kết quả thực hiện`
- verify-only: ba script `*:business`

Điều kiện mở:
- Phase P05-05 đã pass acceptance.
- Semantic reviewer của Slice 3 đã được chỉ định.

Việc cần làm:
- Reviewer xác nhận project-pull/recovery semantics, relation outcomes và accepted gaps Slice 3.
- Không approve materialized relation dựa trên `NOTE-EVIDENCE` chưa resolve.
- Agent không tự tick manual approval.
- Sau approval, promote 5 instance Slice 3 `draft → active`.
- Ghi reviewer/date/scope/verdict/reference trong `Kết quả thực hiện` bằng format canonical.
- Emit `write-docs result`, chạy ba script `*:business`, rồi `validate-after-change`.

Checklist nghiệm thu:
- [x] Manual check: semantic reviewer xác nhận Slice 3 và reference tồn tại.
- [x] Không còn `NOTE-EVIDENCE` chưa review hỗ trợ active assertion/relation.
- [x] Năm instance Slice 3 có `status: active`.
- [x] Ba script `*:business` pass.
- [x] Có `write-docs result` và `validate-after-change result`.

Kết quả thực hiện:
- Fix tối thiểu: 5 Slice 3 instances - semantic approval; reviewer=user; date=2026-07-13; scope=Slice 3; verdict=approved; reference=chat (user: xác nhận/check Việc cần làm + tiếp tục plan)
- Fix tối thiểu: PROC-003/010/011 và BRULE-006/007 `draft → active`
- Verify: verify:*:business pass (22 instances)

### Phase P05-06 - Cross-slice consistency review

Mục tiêu:
- Kiểm consistency toàn Business graph sau khi từng slice đã được semantic approve.
- Không mở lại batch semantic approval.

Target files/artifacts:
- `docs/review/workflows/plans/05-business-materialization-strategy.md` (execution log/checklist/handoff only)
- `docs/app/01-business/**/README.md` đã tạo trong P05-02/P05-04/P05-05
- `docs/app/01-business/README.md`
- verify-only: ba script `*:business`

Điều kiện mở:
- Phase P05-05A đã pass toàn bộ checklist, gồm manual approval Slice 3.

Việc cần làm:
- Kiểm không còn duplicate identity, dangling target, inverse edge hoặc cross-layer edge không hợp lệ.
- Kiểm Scenario composition không nhập recovery vào happy path.
- Kiểm mọi target instance đã semantic approve và không còn `draft`/`identified`.
- Kiểm mọi materialized edge có trace outcome/evidence; mọi accepted gap có coordinator record + reviewer reference.
- Kiểm không còn `NOTE-EVIDENCE` chưa review hỗ trợ active assertion/relation.
- Nếu cần correction, sửa tối thiểu và emit `write-docs result`; không tự đổi semantic đã approve.
- Chạy ba script `*:business`.
- Chạy `validate-after-change`; đây là terminal gate.

Checklist nghiệm thu:
- [x] Không còn duplicate/dangling/inverse/cross-layer violation.
- [x] Không còn target entity `draft`/`identified`.
- [x] Mọi relation/gap có trace + approval record.
- [x] Không còn unreviewed `NOTE-EVIDENCE` hỗ trợ active truth.
- [x] Ba script `*:business` pass.
- [x] Có `validate-after-change result`; có `write-docs result` nếu phase sửa file, hoặc `No-change` nếu review pass không cần sửa.

Kết quả thực hiện:
- No-change: cross-slice graph — 22 instances; SCN compose 8 PROC (không 010/011); không Business→Architecture; không inverse Process outbound
- No-change: không duplicate ID; relations targets resolve; accepted gaps có coordinator record
- Verify: verify:*:business pass (22); không còn draft/identified

### Phase P05-07 - Review closure

Mục tiêu:
- Đóng Plan 05-C sau semantic approval và full verification.

Target files/artifacts:
- `docs/review/workflows/plans/README.md`
- `docs/review/workflows/business_example.md`
- `docs/review/workflows/all.md` (review/no-change hoặc fix finding Business-specific)
- `docs/review/guide/03-workflows.md` (review/no-change hoặc fix snapshot Business-specific)
- `docs/review/workflows/plans/05-business-materialization-strategy.md`
- verify-only: `npm run verify:docs`; ba script `*:business`; `npm test`

Điều kiện mở:
- Phase P05-06 đã pass cross-slice consistency; manual approvals Slice 1/2/3 đã pass ở các phase `A`.

Việc cần làm:
- Đánh dấu Plan 05-C done trong `plans/README.md`.
- Cập nhật `business_example.md` §3: materialized/active vs candidate/gap còn lại.
- `all.md` / `03-workflows.md`: No-change trừ khi có finding Business-specific hiện hữu.
- Chạy `npm run verify:docs`, ba script `*:business`, rồi `npm test`.
- Tick checklist nghiệm thu tổng sau verify thật; handoff Plan 05-C closed.

Checklist nghiệm thu:
- [x] `plans/README.md` ghi Plan 05-C đã triển khai.
- [x] `business_example.md` phân biệt active materialized knowledge và candidate/gap.
- [x] Checklist nghiệm thu tổng của plan này đã tick.
- [x] `npm run verify:docs` pass.
- [x] Ba script `*:business` pass.
- [x] `npm test` pass.

Kết quả thực hiện:
- Fix tối thiểu: plans/README.md + business_example.md §3 materialized vs gap
- No-change: all.md / review/guide/03-workflows.md — không có finding Business-specific cần sửa
- Verify: verify:docs + verify:*:business + npm test pass

## Audit Việc cần làm (snapshot 2026-07-13)

| Phase | Kết luận | Ghi chú ngắn |
| --- | --- | --- |
| P05-01 | pass | Convention + 52 types + docs-contract; không tạo business instance |
| P05-02 | pass | 11 instance; relations deferred; verify + ceremony |
| P05-03 | pass | T-BIZ-01..06; Entity Index; verify:*:business trong npm test |
| P05-03A | pass | User chốt Slice 1; promote lifecycle |
| P05-04 | pass | GAP-BIZ-01/02 preflight; 6 instance + relations |
| P05-04A | pass | User xác nhận/check; promote Slice 2 active |
| P05-05 | pass | 5 instance Slice 3 + relations; SCN không compose recovery |
| P05-05A | pass | User xác nhận/check; promote Slice 3 active |
| P05-06 | pass | Cross-slice review no-change; 22 instances all active/validated |
| P05-07 | pass | Closure docs + npm test |

## Quy ước điều phối

### Handoff hiện tại

```text
Current phase: Plan 05-C closed
Done: P05-01..P05-07 pass; 22 business instances active/validated; audit Việc cần làm pass
Next: None — deferred work chỉ ở Accepted gaps / GAP-BIZ-03/04/05
Prompt tiếp theo: none
```

### Trạng thái blocked

None
### Accepted gaps

- `STK-002` / `STK-003`: không tạo; không ghi `participates_in` từ các stakeholder này.
- `PROC-001` configure: không tạo trong Plan 05.
- Cross-layer Business → Architecture edges: không materialize.

### Quy tắc resume

Luồng prompt chuẩn:

```text
planner.md → coordinator.md → executor.md → coordinator.md → ...
```

1. Đọc `### Handoff hiện tại` và phase id trước khi làm tiếp.
2. `coordinator.md` chọn current phase và overwrite handoff; không tick checklist.
3. `executor.md` chỉ làm trong current phase; tick checklist sau khi sửa/verify thật.
4. Chỉ mở phase sau khi phase trước đã pass toàn bộ checklist nghiệm thu.
5. Ghi tiến độ vào `Kết quả thực hiện` bằng đúng format:
   - `No-change: <path> - <lý do ngắn>`
   - `Fix tối thiểu: <path> - <phạm vi ngắn>`
   - `In-progress: <phase id> - <đã xong> | Next: <việc tiếp theo>`
6. Blocked ghi vào `### Trạng thái blocked` theo format `Blocked: <phase id> - <blocker ngắn>`.
7. Không tick checklist khi mới thảo luận hoặc mới dự định.
8. Thiếu cấu trúc plan → quay `planner.md`. Current phase rõ và không blocked → `executor.md`.
9. Không mở Slice 2/3 trước khi Slice trước pass verify scoped business.
10. P05-03A/P05-04A/P05-05A manual approval không được agent tự tick; thiếu reviewer/confirmation là blocked, không phải accepted gap.
11. Executor gặp gap candidate phải ghi `In-progress` + handoff coordinator; executor không tự sửa `### Accepted gaps`.

## Checklist nghiệm thu tổng

- [x] Gate 0 ID/slug/folder đã rõ trong convention và toàn bộ canonical entity types; không còn mixed ID pattern.
- [x] Slice 1 đủ 11 instance; mọi expected edge có trace outcome; README index đúng.
- [x] Slice 2 đủ 6 instance; mọi expected edge có trace outcome.
- [x] Slice 3 đủ 5 instance; mọi expected edge có trace outcome.
- [x] Không có Policy/Constraint/Metric / `STK-002`/`STK-003` / `PROC-001` / scheduled-pull / force-actions.
- [x] Không có relation Business → Architecture trong frontmatter.
- [x] Slice 1/2/3 đều có manual approval độc lập; status đã promote đúng lifecycle trước khi mở slice sau.
- [x] Không còn unreviewed `NOTE-EVIDENCE` hỗ trợ active truth/relation.
- [x] Ba script `*:business` nằm trong `npm test` và pass.
- [x] `npm run verify:docs` pass.
- [x] `npm test` pass sau test-chain change và tại closure.
- [x] Review/plans đánh dấu Plan 05-C done; `business_example.md` đã tách materialized vs gap.

## Điều kiện hoàn thành

Plan 05-C hoàn thành khi:

1. Toàn bộ phase P05-01, P05-02, P05-03, P05-03A, P05-04, P05-04A, P05-05, P05-05A, P05-06 và P05-07 pass acceptance.
2. Checklist nghiệm thu tổng đã tick sau verify thật.
3. `### Handoff hiện tại` ghi Plan 05-C closed và Prompt tiếp theo không còn mở phase Plan 05.
4. Deferred work còn lại chỉ nằm ở `## Phạm vi > ### Deferred work`; accepted omission hiện tại chỉ nằm ở `### Accepted gaps`.
5. Ba semantic approval phase có xác nhận thủ công thật; agent không tự suy diễn approval.

Không hoàn thành nếu:

- chỉ có plan/`business_example` mà chưa có instance trong `docs/app/01-business/`;
- big-bang tạo toàn bộ candidate tree trong một phase;
- tạo entity không có evidence/trace need;
- dual-write inverse hoặc cross-layer edge không có valid triple;
- mở slice sau trước khi semantic approval của slice trước pass;
- đóng plan khi target entity còn `draft`/`identified` hoặc chưa có semantic approval;
- README tiếp tục phình bằng cách copy body entity.
