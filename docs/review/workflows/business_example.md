# Ví Dụ Áp Dụng Workflow Để Hoàn Thiện Layer Business Của CIS

Ngày review: 2026-07-12  
Product: Central Sync Hub (CIS)  
Scope: Lite, `Backlog -> CIS -> Jira`

> Đây là ví dụ triển khai và evidence plan trong `docs/review`. Plan 05-C đã materialize 22 instance trong `docs/app/01-business/`; các mục §6+ vẫn giữ nhãn candidate/gap cho phần chưa materialize hoặc deferred.

Review bộ workflow và target operating model: [all.md](all.md).
So sánh chiến lược materialize Business: [plans/05-business-materialization-strategy.md](plans/05-business-materialization-strategy.md).

## 1. Mục tiêu

Dùng bộ workflow trong guide để chuyển Business layer từ một README tổng hợp thành các knowledge unit:

- truy vấn được theo Problem, Goal, Stakeholder, Process, Scenario và BusinessRule;
- bám business truth hiện hành;
- có code/test evidence nhưng không nhét implementation vào Business;
- relation chỉ được ghi khi có trace need, evidence, slot và valid triple;
- README layer vẫn slim và đóng vai trò entry point.

“Hoàn thiện layer” không có nghĩa là tạo một instance cho mọi entity type. Chỉ tạo entity có identity và evidence thật; type chưa có fact phù hợp được giữ trống có chủ đích.

## 2. Phân loại evidence

Mỗi fact trong quá trình này phải mang một trong bốn nhãn:

| Nhãn | Nghĩa | Có được đưa thẳng vào app truth? |
| --- | --- | --- |
| `CANONICAL` | Đã được chốt trong `docs/app`/decision hiện hành | Có, nhưng vẫn phải đặt đúng entity |
| `CODE-EVIDENCE` | Code/test đang thể hiện hành vi | Không tự động; dùng để xác nhận hoặc phát hiện drift |
| `CANDIDATE` | Cách materialize hợp lý nhưng chưa được reviewer chốt | Không |
| `GAP` | Thiếu evidence, contract hoặc quyết định | Không; giữ note/review |

Quy tắc quan trọng:

```text
Code evidence không tự thắng app truth.
Nếu code và docs mâu thuẫn, dừng ở GAP và yêu cầu review/decision.
```

## 3. Baseline hiện tại

### 3.1 App truth

`docs/app/01-business/README.md` vẫn giữ business truth tổng hợp; **đã materialize** 22 entity instance active/validated theo Plan 05-C (Slice 1–3).

Materialized (app truth):

| Nhóm | ID active |
| --- | --- |
| Discovery/Direction | `PROB-001`, `GOAL-001`, `SC-001` |
| Organization | `STK-001` |
| Behavior | `PROC-002`..`PROC-011`, `SCN-001` |
| Governance | `BRULE-001`..`BRULE-007` |

Entity Index: `docs/app/01-business/README.md` § Entity Index.

Vẫn **candidate / accepted gap** (chưa materialize trong Plan 05):

| ID | Lý do |
| --- | --- |
| `STK-002`, `STK-003` | Accepted gap Plan 05 |
| `PROC-001` | Configure — prose README đủ cho Lite |
| `POL-*`, `BCON-*`, `METRIC-*` | Ngoài scope Plan 05 |
| Scheduled-pull Process | GAP-BIZ-03 deferred |
| Force/duplicate/conflict Process | GAP-BIZ-04 deferred |

Trước materialize, layer chỉ có README. Hiện tại graph Business Lite đã có instance + relation canonical dưới `docs/app/01-business/`.

### 3.2 Meta contract

Business có sẵn 10 entity type:

| Concern | Entity type |
| --- | --- |
| Discovery | Problem |
| Direction | Goal |
| Organization | Stakeholder |
| Behavior | Process, Scenario |
| Governance | BusinessRule, Policy, BusinessConstraint |
| Measurement | Metric, SuccessCriterion |

Valid triple nội layer:

```text
Problem --affects--> Stakeholder
Goal --addresses--> Problem
Goal --measured_by--> SuccessCriterion
Metric --measures--> Goal
Metric --input_to--> SuccessCriterion
Policy --generates--> BusinessRule
BusinessRule --governs--> Process
BusinessConstraint --constrains--> Process
Stakeholder --participates_in--> Process
Scenario --composes--> Process
```

### 3.3 Code/test evidence

| Business behavior | Canonical source | Code evidence | Automated evidence |
| --- | --- | --- | --- |
| Cấu hình project/sync | Business/Product README | `src/modules/Projects/`, `src/modules/Auth/` | `npm run verify:phase01` |
| Pull một issue Backlog | Business/Quality README | `pullIssue.js`, `handleManualPullJob.js` | `npm run verify:phase03` |
| Pull project Backlog | Business/Quality README | `pullProject.js` | `npm run verify:phase03` |
| Translation có human review | Business/Product README | `approveTranslation.js`, reject/retranslate use cases | `npm run verify:phase04` |
| Canonical issue review/edit | Business/Product README | `updateCanonicalIssue.js`, Issue Editor API | `npm run verify:issue-editor` |
| Mapping approval | Business/Quality README | `approveMappingRule.js`, `runJiraDryRun.js` | `npm run verify:phase05` |
| Blocking anomaly | Business/Quality README | `listBlockingAnomalies.js`, `AnomalyRepository.js` | `npm run verify:phase05` |
| Jira dry-run/readiness | Product/Quality README | `runJiraDryRun.js` | `npm run verify:phase05` |
| Publish sang Jira | Product/Quality README | `requestJiraSync.js`, `handlePushIssueJob.js` | `npm run verify:phase06` |
| Retry failed job | Business/Quality README | `retryJob.js`, `recoverStaleJobs.js` | `npm run verify:phase02` |
| Attachment recovery riêng | Business/Quality README | `downloadAttachmentToCis.js`, `retryAttachmentDownload.js` | `npm run verify:phase03` |
| Operator visibility | Business/Quality README | `DashboardRepository.js` | `npm run verify:phase07` |

Tên symbol/path chỉ thuộc `Validation Notes` hoặc evidence record. Steps của Process phải dùng ngôn ngữ business.

## 4. Gate 0 — blocker phải xử lý trước instance đầu tiên

Meta hiện có hai cách thể hiện ID:

- `docs/meta/04-conventions/id-conventions.md` và các entity type ghi pattern `{PREFIX}-{NNN}-{slug}`;
- schema example, metadata example và architecture instance hiện hành dùng:

```yaml
id: AF-001
slug: backlog-manual-pull
```

trong folder:

```text
AF-001-backlog-manual-pull/
```

Đây là contract ambiguity thật, không nên đoán khi tạo Business instance đầu tiên.

Khuyến nghị review:

```text
frontmatter id = stable short ID, ví dụ PROC-002
slug = pull-backlog-issue
folder = PROC-002-pull-backlog-issue
```

Cách này khớp schema example, relation target và 42 architecture instances hiện hành. Nếu được chấp nhận, meta convention/type wording cần phân biệt rõ:

- entity ID;
- slug;
- instance folder pattern.

Cho đến khi chốt, mọi nội dung dưới đây dùng short ID để minh họa và giữ nhãn `CANDIDATE`.

## 5. Definition of Done cho Business layer

Layer được coi là hoàn thiện ở mức Lite khi:

1. Business truth trong README được phân rã thành entity có identity rõ.
2. Sáu concern được cover bằng fact thật hoặc có accepted gap rõ; không tạo entity để lấp folder.
3. Flow chính có một Scenario end-to-end.
4. Mỗi Process có trigger, participants, steps và outcomes ở ngôn ngữ business.
5. Mỗi BusinessRule đánh giá được đúng/sai và trace tới Process có thật.
6. Mỗi code behavior quan trọng có evidence path và command tương ứng.
7. Mọi relation pass slot/type/triple/direction/target và có trace need.
8. Không có relation tự phát từ Business tới architecture flow/module.
9. README layer chỉ giữ app truth tổng hợp, routing và entity index.
10. Validation report không còn violation.

## 6. Target entity set

### 6.1 Nên materialize trong slice đầu

#### Discovery / Direction

| ID candidate | Type | Ý nghĩa | Nguồn |
| --- | --- | --- | --- |
| `PROB-001` | Problem | Rủi ro và chi phí khi đồng bộ yêu cầu thủ công giữa hai hệ thống | Business README |
| `GOAL-001` | Goal | Vận hành chuyển giao yêu cầu có kiểm soát, truy vết và phục hồi được | Business + Quality README |

Problem phải mô tả pain, không viết “cần xây CIS”. Goal phải mô tả outcome, không viết feature/API/UI.

#### Organization

| ID candidate | Stakeholder | Vai trò |
| --- | --- | --- |
| `STK-001` | Admin/operator | Pull, review, approve, resolve, publish và recovery |
| `STK-002` | Customer request team | Cung cấp/duy trì yêu cầu trên Backlog |
| `STK-003` | Development delivery team | Nhận và thực thi công việc trên Jira |

Không tạo Stakeholder cho Scheduler, Worker hoặc AI transport.

#### Behavior

| ID candidate | Process | Evidence chính |
| --- | --- | --- |
| `PROC-001` | Configure Sync Project | Projects/Auth + phase01 |
| `PROC-002` | Pull Backlog Issue | `handleManualPullJob.js` + phase03 |
| `PROC-003` | Pull Backlog Project | `pullProject.js` + phase03 |
| `PROC-004` | Review Translation | Translation application + phase04 |
| `PROC-005` | Review Canonical Issue | CIS Issue Editor + issue-editor verify |
| `PROC-006` | Approve Required Mapping | Mapping application + phase05 |
| `PROC-007` | Resolve Blocking Anomaly | Anomaly application + phase05 |
| `PROC-008` | Review Jira Dry-run | `runJiraDryRun.js` + phase05 |
| `PROC-009` | Publish Issue To Jira | `requestJiraSync.js`/push handler + phase06 |
| `PROC-010` | Recover Failed Job | `retryJob.js` + phase02 |
| `PROC-011` | Recover Attachment Download | Backlog attachment recovery + phase03 |
| `SCN-001` | Controlled Lite Issue Delivery | Business flow Lite, compose các Process trên |

`PROC-010`/`PROC-011` là nhánh recovery, không bắt buộc đi qua trong happy path.

#### Governance

| ID candidate | Rule | Process chính |
| --- | --- | --- |
| `BRULE-001` | Mọi outbound delivery đi qua CIS | PROC-002, PROC-003, PROC-009 |
| `BRULE-002` | Human giữ authority đối với translation | PROC-004 |
| `BRULE-003` | Required mapping phải approved trước publish | PROC-006, PROC-008, PROC-009 |
| `BRULE-004` | Critical blocking anomaly phải được xử lý trước publish | PROC-007, PROC-008, PROC-009 |
| `BRULE-005` | Dry-run hợp lệ và còn fresh trước external write | PROC-008, PROC-009 |
| `BRULE-006` | Retry chỉ sau khi có failed operation và operator chủ động | PROC-010 |
| `BRULE-007` | Attachment download failure có recovery riêng, không hủy issue ingest | PROC-002, PROC-003, PROC-011 |

#### Measurement

| ID candidate | Type | Nội dung |
| --- | --- | --- |
| `SC-001` | SuccessCriterion | Một issue đủ điều kiện có thể đi Backlog → CIS → Jira; issue không đủ điều kiện không tạo external write; outcome có journal để giải thích |

`Goal --measured_by--> SuccessCriterion` đủ cover measurement cho slice đầu.

### 6.2 Giữ `CANDIDATE`/`GAP`, chưa materialize

| Type/fact | Lý do chưa tạo |
| --- | --- |
| Policy | README có nhiều rule nhưng chưa khẳng định một policy có owner/governance intent riêng |
| BusinessConstraint “không sync trực tiếp” | Có thể là BusinessRule/architecture guardrail, chưa có evidence đây là regulatory/operational business constraint |
| Metric failed-job count | Code hiển thị count nhưng chưa có business owner, target/baseline và quyết định nó đo Goal nào |
| Scheduled pull Process | Code tồn tại, product chỉ coi optional và chưa có verify phase riêng |
| Force approve / mark duplicate / mark conflict Process | Code surface tồn tại nhưng business meaning/authority chưa được README hoặc decision giải thích đủ |

Không tạo `POL-*`, `BCON-*` hoặc `METRIC-*` chỉ để folder trông đầy.

## 7. Target tree

```text
docs/app/01-business/
├── README.md
├── 01-discovery/
│   └── problems/
│       └── PROB-001-manual-cross-system-sync-risk/README.md
├── 02-direction/
│   └── goals/
│       └── GOAL-001-controlled-traceable-delivery/README.md
├── 03-organization/
│   └── stakeholders/
│       ├── STK-001-admin-operator/README.md
│       ├── STK-002-customer-request-team/README.md
│       └── STK-003-development-delivery-team/README.md
├── 04-behavior/
│   ├── 01-processes/
│   │   └── processes/
│   │       ├── PROC-001-configure-sync-project/README.md
│   │       ├── PROC-002-pull-backlog-issue/README.md
│   │       ├── PROC-003-pull-backlog-project/README.md
│   │       ├── PROC-004-review-translation/README.md
│   │       ├── PROC-005-review-canonical-issue/README.md
│   │       ├── PROC-006-approve-required-mapping/README.md
│   │       ├── PROC-007-resolve-blocking-anomaly/README.md
│   │       ├── PROC-008-review-jira-dry-run/README.md
│   │       ├── PROC-009-publish-issue-to-jira/README.md
│   │       ├── PROC-010-recover-failed-job/README.md
│   │       └── PROC-011-recover-attachment-download/README.md
│   └── 02-scenarios/
│       └── scenarios/
│           └── SCN-001-controlled-lite-issue-delivery/README.md
├── 05-governance/
│   └── 01-business-rules/
│       └── business-rules/
│           ├── BRULE-001-route-through-cis/README.md
│           ├── BRULE-002-human-translation-authority/README.md
│           ├── BRULE-003-approved-mapping-required/README.md
│           ├── BRULE-004-critical-anomaly-blocks-publish/README.md
│           ├── BRULE-005-fresh-dry-run-before-publish/README.md
│           ├── BRULE-006-intentional-failed-job-retry/README.md
│           └── BRULE-007-isolated-attachment-recovery/README.md
└── 06-measurement/
    └── 02-success-criteria/
        └── success-criteria/
            └── SC-001-controlled-lite-delivery/README.md
```

Đây là target tree sau review, không phải yêu cầu tạo tất cả trong một commit.

## 8. Thứ tự materialize thực dụng

### Slice 1 — happy path tối thiểu

1. Resolve ID convention ở Gate 0.
2. Tạo `PROB-001`, `SC-001`.
3. Tạo `GOAL-001` và chỉ thêm relation sau khi targets tồn tại.
4. Tạo `STK-001`.
5. Tạo `PROC-002`, `PROC-005`, `PROC-008`, `PROC-009`.
6. Tạo `SCN-001`.
7. Tạo `BRULE-001`, `BRULE-005`.
8. Trace và validate.

### Slice 2 — review/gate

1. Thêm `PROC-004`, `PROC-006`, `PROC-007`.
2. Thêm `BRULE-002`, `BRULE-003`, `BRULE-004`.
3. Thêm stakeholder source/delivery team nếu reviewer xác nhận participation semantics.
4. Trace và validate.

### Slice 3 — scale/recovery

1. Thêm project pull.
2. Thêm failed-job và attachment recovery.
3. Thêm các rule recovery.
4. Review scheduled pull riêng; không gộp vào canonical happy path chỉ vì code đã có.

Mỗi slice phải review được độc lập. Không tạo 22 file rồi mới kiểm tra relation.

## 9. Worked example — một Process hoàn chỉnh

Target path:

```text
docs/app/01-business/04-behavior/01-processes/processes/PROC-002-pull-backlog-issue/README.md
```

Draft sau đây chỉ được tạo sau Gate 0:

```md
---
schema: entity-instance/v1
id: PROC-002
slug: pull-backlog-issue
title: Pull Backlog Issue
entity_type: Process
layer: 01-business
concern: 04-behavior
status: draft
summary: Operator đưa snapshot hiện tại của một issue Backlog vào CIS để review và xử lý tiếp.
theory_basis:
  - TH-HUBFLOW
  - TH-OPS-TRACE
---

# PROC-002 - Pull Backlog Issue

## Summary

Operator chọn một issue thuộc project đã cấu hình và yêu cầu CIS thu nhận trạng thái hiện tại của issue đó.

## Meaning

Process này tạo điểm vào có kiểm soát từ Backlog sang CIS. Nó không publish sang Jira.

## Trigger

Operator chủ động chọn thao tác pull/resync một issue Backlog.

## Participants

- Admin/operator.
- Customer request team là bên duy trì yêu cầu nguồn; participation canonical chỉ ghi sau khi reviewer xác nhận.

## Steps

1. Operator chọn project và issue nguồn cần thu nhận.
2. CIS xác nhận issue thuộc project được cấu hình cho nguồn đó.
3. CIS thu nhận issue, comment và metadata attachment hiện tại.
4. CIS cập nhật source snapshot và canonical review entry.
5. CIS ghi outcome để operator có thể phân biệt ingest mới, update hoặc snapshot không đổi.

## Outcomes

- Issue có review entry trong CIS.
- Snapshot thay đổi tạo revision mới; snapshot không đổi không tạo duplicate revision.
- Attachment download failure được ghi riêng và có recovery path; issue ingest không bị hủy chỉ vì lỗi download đó.
- Không có external write sang Jira trong process này.

## Rules

- Flow phải đi qua CIS.
- Routing mismatch phải dừng ingest.
- Attachment failure được tách khỏi kết quả ingest issue.

## Relations

Process không có outbound relation slot active.

Các canonical edge, nếu có trace need và đã pass gate, phải được ghi từ source đúng:

- `SCN-001 --composes--> PROC-002`
- `STK-001 --participates_in--> PROC-002`
- `BRULE-001 --governs--> PROC-002`
- `BRULE-007 --governs--> PROC-002`

## Validation Notes

- Canonical evidence: `docs/app/01-business/README.md`, `docs/app/02-product/README.md`, `docs/app/08-quality/README.md`.
- Code evidence: `src/modules/Backlog/application/handleManualPullJob.js`, `src/modules/Backlog/application/downloadAttachmentToCis.js`.
- Automated evidence: `npm run verify:phase03`.
- `status: draft` cho đến khi business owner/reviewer xác nhận wording và participants.
```

Điểm cần giữ:

- không đưa API route, SQL hay worker loop vào Steps;
- không thêm `relations:` vào Process vì type không có outbound slot;
- code paths chỉ nằm trong Validation Notes;
- duplicate snapshot và attachment recovery được diễn đạt ở outcome business.

## 10. Worked example — relation-bearing source

Sau khi `PROC-008` và `PROC-009` tồn tại, `BRULE-005` có thể dùng:

```yaml
---
schema: entity-instance/v1
id: BRULE-005
slug: fresh-dry-run-before-publish
title: Fresh Dry-run Before Publish
entity_type: BusinessRule
layer: 01-business
concern: 05-governance
status: draft
summary: External write sang Jira chỉ được yêu cầu sau khi readiness check pass và preview vẫn khớp canonical data hiện tại.
relations:
  governs:
    - PROC-008
    - PROC-009
---
```

Required body phải có:

- `Statement`: external write cần pre-check pass và fresh;
- `Condition`: khi operator yêu cầu publish sang Jira;
- `Outcome`: reject publish nếu blocked/stale;
- `Scope`: outbound issue publish trong Lite;
- `Validation Notes`: `runJiraDryRun.js`, `requestJiraSync.js`, phase05 và phase06.

Không ghi relation ngược trong Process.

## 11. Trace contracts trước khi thêm edge

### 11.1 Scenario composition

```md
Actor: reviewer business flow
Start entity: SCN-001
Query: Flow Lite gồm những Process canonical nào?
Decision supported: review completeness và impact khi một bước đổi
Evidence: Business README + Process instances
Candidate edge: SCN-001 --composes--> PROC-*
Slot/triple: Scenario.composes / Scenario --composes--> Process
```

### 11.2 Rule coverage

```md
Actor: reviewer outbound safety
Start entity: BRULE-005
Query: Rule dry-run chi phối Process nào?
Decision supported: review thay đổi readiness/publish
Evidence: Product/Quality README + code gates
Candidate edge: BRULE-005 --governs--> PROC-008|PROC-009
Slot/triple: BusinessRule.governs / BusinessRule --governs--> Process
```

### 11.3 Goal success

```md
Actor: product/business reviewer
Start entity: GOAL-001
Query: Điều kiện nào cho biết outcome đã đạt?
Decision supported: release/readiness review
Evidence: Business + Quality acceptance
Candidate edge: GOAL-001 --measured_by--> SC-001
Slot/triple: Goal.measured_by / Goal --measured_by--> SuccessCriterion
```

Nếu không trả lời được “decision supported”, giữ link ở prose/evidence; không materialize.

## 12. Relation candidates

Chỉ xét sau khi source và target cùng tồn tại:

| Source | Relation | Target | Trạng thái ban đầu |
| --- | --- | --- | --- |
| `PROB-001` | `affects` | `STK-001` | Candidate; explicit trong Business README |
| `PROB-001` | `affects` | `STK-002`, `STK-003` | Review mức affected trực tiếp |
| `GOAL-001` | `addresses` | `PROB-001` | Candidate mạnh |
| `GOAL-001` | `measured_by` | `SC-001` | Candidate mạnh |
| `SCN-001` | `composes` | Core Process | Candidate mạnh |
| `STK-001` | `participates_in` | Operator-driven Process | Candidate mạnh |
| `STK-002`, `STK-003` | `participates_in` | Process liên quan | Accepted gap đến khi semantics trực tiếp được review |
| `BRULE-*` | `governs` | Process tương ứng | Candidate mạnh nếu code/business evidence cùng khớp |

Không hợp lệ với contract hiện tại:

```text
Process --implements--> InteractionFlow
Process --uses--> Module
BusinessRule --constrains--> Module
Scenario --involves--> ArchitectureFlow
```

Architecture flow `AF-*` chỉ được dùng trong `Validation Notes`/Context evidence nếu không có valid cross-layer triple.

## 13. Doc-code gaps phải review

### GAP-BIZ-01 — anomaly wording

Business README nói `critical/open anomaly`. Code outbound gate chỉ lấy anomaly:

```text
severity = critical
AND status IN (open, investigating)
```

Mapping gap bị block riêng qua `MAPPING_REQUIRED`, không phải mọi open anomaly đều gây `ANOMALY_BLOCKED`.

Hướng:

- tách rule mapping approval khỏi critical anomaly rule;
- sửa wording canonical nếu reviewer xác nhận code là behavior mong muốn;
- không viết “mọi open anomaly block publish”.

### GAP-BIZ-02 — translation queue và issue state

Product truth nói translation queue riêng không mặc định chặn canonical sync, nhưng `pending_translate` chưa syncable.

Hai fact không nhất thiết mâu thuẫn:

- queue item riêng không phải universal gate;
- issue đang ở state `pending_translate` không đủ readiness.

Process/Rule phải dùng wording này, không rút gọn thành “translation luôn block” hoặc “translation không bao giờ block”.

### GAP-BIZ-03 — scheduled pull

Scheduled pull có code tại `runScheduledPullScan.js`, nhưng Product chỉ coi optional và không có verify phase riêng.

Giữ ở candidate cho đến khi:

- có acceptance rõ;
- có command/test evidence;
- reviewer xác nhận nó là business process sống, không chỉ mechanism sẵn có.

### GAP-BIZ-04 — force/duplicate/conflict actions

Code có `forceApproveIssue`, `markDuplicateIssue`, `markIssueConflict`, nhưng Business README chưa chốt authority, condition và outcome đầy đủ.

Không materialize Process/Rule từ API surface đơn thuần.

### GAP-BIZ-05 — Metric

Dashboard có `sync_jobs_failed`, `pull_jobs_failed`, `translation_pending`, `mapping_missing`, `anomaly_open`.

Đây là observable count, chưa đủ thành business Metric nếu thiếu:

- definition/calculation ổn định;
- business owner;
- frequency;
- Goal/SuccessCriterion mà nó phục vụ;
- baseline/target nếu cần.

## 14. Validation sequence

Dùng terminal workflow [validate-after-change.md](../../guide/workflows/validate-after-change.md) sau mỗi slice. Chi tiết checklist dưới đây bổ sung coverage local cho CIS; không thay workflow đó.

### 14.1 Trước khi tạo instance

Chạy Type Contract Gate cho type được dùng:

```powershell
npm run verify:entity-type-contract -- --type docs/meta/01-entity-types/01-business/04-behavior/01-processes/processes/process.md
```

Lặp cho Problem, Goal, Stakeholder, Scenario, BusinessRule và SuccessCriterion khi slice chạm tới.

### 14.2 Sau khi tạo từng instance

```powershell
npm run verify:entity-type-contract -- --instance docs/app/01-business/04-behavior/01-processes/processes/PROC-002-pull-backlog-issue/README.md
npm run verify:entity-instance -- --instance docs/app/01-business/04-behavior/01-processes/processes/PROC-002-pull-backlog-issue/README.md
npm run verify:relations -- --instance docs/app/01-business/04-behavior/01-processes/processes/PROC-002-pull-backlog-issue/README.md
npm run verify:references -- --instance docs/app/01-business/04-behavior/01-processes/processes/PROC-002-pull-backlog-issue/README.md
```

Lưu ý:

- `entity-type-contract --instance` chỉ xác nhận path resolve tới type có contract tối thiểu.
- `verify:entity-instance` / `relations` / `references` cover structural/reference contract.
- Meaning, boundary, evidence và trace need vẫn thuộc checklist thủ công trong `validate-after-change` / `meta-validate`.

### 14.3 Manual meta validation bắt buộc

Với mỗi file (trong report `validate-after-change`):

- [ ] Path khớp relative type directory trong meta. *(structural: entity-instance)*
- [ ] ID/slug/folder khớp convention đã được chốt ở Gate 0. *(structural: entity-instance)*
- [ ] Frontmatter đủ required fields. *(structural: entity-instance)*
- [ ] Body đủ base sections và structure extension. *(structural: entity-instance)*
- [ ] Meaning đúng type, không lẫn Product/Domain/Architecture. *(manual)*
- [ ] Status hợp lifecycle type. *(structural một phần)*
- [ ] Relation key là slot thật. *(structural: relations)*
- [ ] Relation type và valid triple tồn tại. *(structural: relations)*
- [ ] Direction đúng canonical. *(structural: relations)*
- [ ] Target instance tồn tại. *(structural: relations)*
- [ ] Có trace need và evidence trước khi materialize. *(manual)*
- [ ] `theory_basis` / `decision_basis` resolve. *(structural: references)*

### 14.4 Behavior evidence

Theo slice:

```powershell
npm run verify:phase01
npm run verify:phase02
npm run verify:phase03
npm run verify:phase04
npm run verify:phase05
npm run verify:phase06
npm run verify:issue-editor
```

Không cần chạy mọi command cho từng file. Validation report phải map Process/Rule tới command có coverage thực.

### 14.5 Navigation

`npm run verify:docs` hiện không quét `docs/app` hoặc `docs/meta`. Vì vậy:

- có thể chạy để bảo vệ review/guide links;
- không được dùng nó làm bằng chứng rằng Business instance links đã hợp lệ;
- Business links/references vẫn cần manual check hoặc generic verifier mới.

Baseline fragment `#luong-tong` và link universal pack được xử lý trong remediation §4; vẫn không claim navigation cho `docs/app` instance paths.

## 15. Cập nhật layer README sau mỗi slice

Giữ nguyên các phần:

- Business Truth Hiện Tại;
- Theory Routing;
- Rule Riêng Hiện Tại;
- Routing Sang Layer Khác.

Thêm Entity Index ngắn:

```md
## Entity Index

| Type | Instances |
| --- | --- |
| Problem | PROB-001 |
| Goal | GOAL-001 |
| Stakeholder | STK-001 ... |
| Process | PROC-001 ... |
| Scenario | SCN-001 |
| BusinessRule | BRULE-001 ... |
| SuccessCriterion | SC-001 |
```

Không copy body của entity về README. Nếu một business statement đã được materialize, README chỉ tóm tắt và route.

## 16. Output record cho mỗi slice

```md
## Business materialization result

### Scope
- Slice:
- App truth sources:
- Code/test evidence:

### Created/updated candidates
- ...

### Canonical relations
- ...

### Intentionally prose-only
- Fact:
- Reason:

### Gaps
- ...

### Commands
- Command:
- Result:
- Coverage:

### Manual validation
- Passed:
- Violations:
- Warnings:

### Reviewer decisions required
- ...

### Verdict
ready | blocked | accepted-gap
```

## 17. Acceptance checklist cuối

- [ ] Gate 0 về ID đã được chốt trước instance đầu tiên.
- [ ] Chỉ materialize scope Lite; không kéo webhook/Medium/Full.
- [ ] Problem mô tả pain, Goal mô tả outcome.
- [ ] Scheduler/Worker/AI không bị tạo thành Stakeholder.
- [ ] Mọi Process dùng ngôn ngữ business, không API/SQL/worker mechanics.
- [ ] Scenario compose Process bằng canonical direction.
- [ ] BusinessRule govern Process bằng fact đánh giá được đúng/sai.
- [ ] Mapping gate và critical anomaly gate được tách đúng.
- [ ] Pending translation queue và issue state không bị diễn giải nhập nhằng.
- [ ] Không tạo Policy/Constraint/Metric chỉ để lấp taxonomy.
- [ ] Không materialize Business → Architecture edge khi meta chưa cho phép.
- [ ] Mỗi entity có canonical evidence hoặc `NOTE-EVIDENCE`.
- [ ] Mỗi behavior có test evidence hoặc ghi rõ thiếu evidence.
- [ ] Type Contract Gate pass cho type/instance path.
- [ ] Manual schema/relation/reference validation pass.
- [ ] Business README vẫn slim và route được tới entity.
- [ ] Reviewer xác nhận manual checks; agent không tự tick thay.

## 18. Kết luận

CIS đã có đủ business truth tổng hợp, code path và phase tests để materialize Business layer theo vertical slice. Việc nên làm đầu tiên không phải tạo toàn bộ tree, mà là:

1. chốt ambiguity ID;
2. tạo happy-path slice nhỏ;
3. ghi relation từ đúng canonical source;
4. validate thủ công những gì tooling chưa cover;
5. mở rộng sang review/recovery sau khi slice đầu pass.

Cách này tạo Business layer dùng được cho impact review mà không biến code structure thành business model và không tạo graph chỉ để “đủ đẹp”.
