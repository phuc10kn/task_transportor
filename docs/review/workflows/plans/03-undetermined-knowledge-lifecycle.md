# Plan 03 — Kích Hoạt Workbench Cho Knowledge Chưa Xác Định Canonical Home

Finding liên quan: WFP-09 và stop condition của `read-for-task`, `write-docs`, `validate-after-change`  
Trạng thái: **đã triển khai activation; DEC-003 accepted; CIS Workbench active**

## Kết luận đã chốt

Chọn **PA-B và triển khai ngay**, không tiếp tục dùng volume như điều kiện trì hoãn:

1. Đưa Workbench vào **dispatcher của luồng chính** như nhánh bắt buộc khi project đã kích hoạt và kết quả phân loại là `canonical_home = undetermined-placement`.
2. Dùng **local decision** làm activation/authority gate duy nhất. Guide sở hữu conceptual framework và operating workflow generic của Workbench; không giữ status, TTL, owner hoặc policy riêng của `task_transportor`.

“Vào luồng chính” không có nghĩa mọi task đều phải đi qua Workbench:

- ở mức guide xuyên dự án, Workbench vẫn là capability tùy project;
- ở mức `task_transportor`, sau khi local decision có hiệu lực, route vào Workbench là bắt buộc cho case đúng điều kiện;
- task đã biết canonical home tiếp tục đi thẳng vào luồng canonical, không chịu thêm ceremony;
- Workbench là **temporary-knowledge operating path hạng nhất** của case chưa rõ home, không phải canonical lane song song.

## Workbench là trọng tâm của Plan 03

Plan này không chỉ “cho phép dùng một folder”. Nó đưa Workbench thành cơ chế vận hành chính để knowledge chưa đủ điều kiện canonical không bị thất lạc.

Workbench nhận bốn trách nhiệm:

1. **Capture**: giữ candidate cùng source/evidence reference và owner.
2. **Mature**: làm rõ loại uncertainty, candidate home, contract và blocker.
3. **Govern**: áp lifecycle, review cadence, TTL và terminal disposition.
4. **Handoff**: chuyển candidate đã đủ điều kiện về workflow canonical; không tự ghi truth.

Workbench có authority hẹp nhưng thực:

```text
authoritative cho trạng thái vận hành của item
không authoritative cho claim app/meta/theory trong item
```

Vì vậy Workbench phải là nơi staging chính của `undetermined-placement` trong `task_transportor`; chat, PR comment hoặc issue tracker chỉ là source/integration reference, không được tiếp tục làm temporary knowledge store chính.

Mỗi Workbench intake phải kết thúc bằng `promoted`, `rejected`, `superseded` hoặc `expired`. Không có outcome “để đó vô thời hạn”.

## Căn cứ từ tài liệu hiện có

Hướng xử lý phải giữ đồng thời các ràng buộc sau:

- [`write-docs`](../../../guide/workflows/write-docs.md) và [`validate-after-change`](../../../guide/workflows/validate-after-change.md) dừng đúng khi chưa có canonical home/contract hoặc evidence chưa đủ để nâng candidate thành truth.
- [`sync-product-change`](../../../guide/workflows/sync-product-change.md) không cho phép dùng code làm authority và trả `blocked` khi authority, behavior delta hoặc evidence nền chưa rõ.
- [`use-workbench`](../../../guide/workflows/use-workbench.md) hiện mới giữ boundary và local-policy pointer; để Workbench dùng được, guide còn phải giải thích khung khái niệm và workflow generic.
- [`DEC-001`](../../../app/10-decisions/01-decision-making/01-decisions/DEC-001-guide-pack-materialization/README.md) chốt guide chỉ giữ stable base, còn contract/lifecycle active thuộc project.
- [`docs/meta`](../../../meta/README.md) sở hữu luật của documentation system; `docs/app/10-decisions` sở hữu lựa chọn local có ý nghĩa dài hạn.
- [`validation-and-lifecycle`](../../../guide/concepts/validation-and-lifecycle.md) xác định lifecycle/status active của temporary record thuộc project local; guide vẫn có thể mô tả lifecycle phase trừu tượng để hướng dẫn vận hành.
- [`note-format`](../../../meta/04-conventions/note-format.md) chỉ định nghĩa marker cho gap/candidate; nó chưa cung cấp owner, TTL, review hoặc terminal disposition.
- `docs/workbench` hiện chỉ có trạng thái inactive, lifecycle dự kiến và template nháp; chưa đủ làm một đường vận hành.

Suy ra bốn boundary không được phá:

```text
local decision          = authority để bật/tắt, giới hạn và ratify policy
docs/guide              = conceptual framework + operating workflow generic
local workbench policy  = contract vận hành cho record/lifecycle/validation
workbench items         = operational candidate records
docs/meta               = convention chung đã có; không phải activation gate
```

Guide giải thích mô hình, route, input/output, stop condition, validation responsibility và canonical handoff; sau đó bind sang decision/policy local. Workbench không được tự kích hoạt chính nó: policy/template chỉ có hiệu lực khi được accepted decision trỏ tới và phê chuẩn.

## Vấn đề gốc

Stop condition hiện tại đúng về an toàn nhưng chưa đóng vòng vận hành:

```text
không xác định được canonical home
→ dừng
→ không có record owner/TTL/review
→ evidence nằm lại trong chat, PR comment hoặc README gần nhất
→ không có đường audit để promote/reject/expire
```

Khoảng trống này không được giải quyết bằng cách chỉ đổi dòng `STATUS` trong `docs/workbench/README.md`, vì repository còn các mâu thuẫn sau:

1. `docs/workbench/cis/templates/work-item.md` đang chờ guide định nghĩa activation gate, trong khi guide đã nói activation thuộc local decision.
2. Workflow dispatcher đang đặt `use-workbench` ngoài Luồng tổng dưới nhãn optional, nên chưa có route bắt buộc cho `undetermined-placement`.
3. Nhiều AGENT_SKILLS đang cấm hoàn toàn Workbench vì inactive; chỉ sửa guide sẽ làm human flow và agent flow lệch nhau.
4. Template hiện tại thiếu owner, timestamp, review date, TTL, uncertainty classification, authority/evidence refs và promotion result.
5. `NOTE-OPEN`/`NOTE-EVIDENCE` có format nhưng không phải lifecycle. Dùng note làm backlog sẽ tạo item không owner và tồn tại vô hạn.
6. Product activation profile trong WFP-09 chưa được materialize, nên không có binding machine/human-readable từ guide generic sang policy local.

## Luồng chính sau khi kích hoạt

```text
read-for-task
→ nếu task từ code / incident / product behavior:
    sync-product-change
    → blocked:
        clarification / product authority / decision
        Workbench không được đổi verdict này thành ready_for_write
    → ready_for_write:
        tiếp tục canonical-home gate
→ nếu prose / knowledge không đổi behavior:
    đi thẳng canonical-home gate

canonical-home gate
├─ resolved
│  → write-docs
│  → trace-impact khi có entity/relation/impact
│  → validate-after-change
│  → handoff/review
│
└─ undetermined-placement
   → use-workbench
   → intake → triaged → modeling → in_review → ready_for_promotion
   → read-for-task lại để xác nhận home/authority mới nhất
   → sync-product-change nếu candidate làm đổi product behavior
   → write-docs
   → trace-impact khi cần
   → validate-after-change
   → promoted chỉ sau khi canonical handoff pass

terminal khác:
rejected | superseded | expired
```

Workbench là một nhánh core có điều kiện. Nó không đứng trước `read-for-task`, không thay `sync-product-change`, và không được bỏ qua `write-docs`/`validate-after-change` khi promote.

### Phân loại route

| Tình huống | Route đúng | Lý do |
| --- | --- | --- |
| Đã biết loại knowledge, contract và canonical path | Luồng canonical | Workbench không tạo thêm ceremony cho case đã rõ |
| Có source/evidence nhận diện được nhưng chưa biết app/meta/theory home, unit type hoặc cách modeling | Workbench | Đây là `undetermined-placement`, đúng khoảng trống Plan 03 xử lý |
| Code và app truth conflict; thiếu product authority; behavior delta chưa rõ | `sync-product-change = blocked` → clarification/decision | Workbench không phải đường bypass authority |
| Quan sát/candidate có evidence chưa đủ canonical nhưng có owner và nguồn truy được | Workbench để mature evidence; promotion vẫn blocked tới khi đủ authority/evidence | Workbench giữ quá trình, không chứng minh candidate là đúng |
| Canonical home đã biết, chỉ thiếu một fact/evidence cục bộ | `NOTE-OPEN`/`NOTE-EVIDENCE` trong unit đó theo meta convention | Gap phụ thuộc đã có home; không cần tạo candidate độc lập |
| Bug/task implementation đã có home trong issue tracker | Issue/task flow hiện có | Workbench không thay backlog delivery |
| Secret, credential, raw payload nhạy cảm hoặc dữ liệu runtime lớn | Không ghi vào Workbench; chỉ giữ reference an toàn | Workbench là docs workspace, không phải secret/raw-event store |

Điểm phân biệt quan trọng:

```text
placement/modeling uncertainty → Workbench
truth/authority conflict       → clarification hoặc decision trước
known-home local gap           → NOTE-* trong canonical context
```

Một Workbench item có thể ghi evidence gap, nhưng sự tồn tại của item không thay verdict `blocked` và không tạo authority để promote.

## Kích hoạt Workbench: local decision là gate chính

### Authority model

Activation phải được materialize bằng một decision local mới trong `docs/app/10-decisions/` (dự kiến `DEC-003` nếu ID vẫn còn trống lúc triển khai).

Decision phải chốt tối thiểu:

```text
scope được kích hoạt
workspace path
allowed item kinds
intake owner / lifecycle owner
ai có quyền đưa item sang review
ai có quyền chấp nhận canonical destination
ai có quyền approve promotion theo từng canonical home
truth boundary
lifecycle terminal outcomes
policy/template/profile paths
promotion và validation obligations
review triggers
deactivation / rollback rule
```

Decision ở trạng thái `proposed` hoặc chỉ có PR/chat approval chưa đủ để bật. Gate chỉ mở khi:

1. decision record có status `accepted`;
2. local contract và template mà decision trỏ tới đã tồn tại;
3. owner/reviewer role resolve được;
4. dispatcher và agent skill đã route cùng một cách;
5. workspace công bố activation decision hiện hành;
6. ít nhất các scenario acceptance bắt buộc đã được kiểm tra.

### Không tạo hai nguồn activation truth

Local workflow profile có thể hiển thị `workbench.active`, nhưng đây chỉ là derived/mirror state. Nguồn authority vẫn là status của decision:

```text
activation decision accepted và chưa bị superseded
→ profile/workbench README hiển thị active
```

Nếu profile hoặc `docs/workbench/README.md` mâu thuẫn với decision, decision thắng và activation phải bị coi là lỗi cấu hình. Không được dùng một boolean trong Workbench để tự bật Workbench.

### Phân chia nơi sở hữu

| Nơi | Được sở hữu | Không được sở hữu |
| --- | --- | --- |
| `docs/app/10-decisions/` | Lựa chọn bật Workbench, scope, authority, boundary, core lifecycle, policy được ratify, trade-off, review/deactivation trigger | Template item đang vận hành hoặc backlog candidate |
| `docs/workbench/` policy/template | Required field theo stage, transition, TTL/cadence, validation checklist, registry/terminal-retention procedure | Activation authority, app truth, meta contract hoặc theory |
| `docs/workbench/` items | Candidate, evidence reference, owner, lifecycle/disposition và handoff audit của item | App/meta/theory truth hoặc quyền tự approve promotion |
| `docs/meta/` | Convention documentation chung đã có, gồm `NOTE-*`; chỉ mở rộng khi project thật sự cần contract dùng ngoài Workbench | Activation state hoặc Workbench item instance |
| `docs/guide/` | Khái niệm Workbench, trigger/non-trigger, generic lifecycle phase, input/output, stop condition, validation responsibility, local binding và canonical handoff | CIS status vocabulary, TTL value, owner cụ thể, item field/path hoặc local command như universal rule |
| `docs/AGENT_SKILLS/` | Checklist thực thi contract đã có | Tự tạo policy hoặc tự approve candidate |

`DEC-001` yêu cầu lifecycle local không nằm trong guide, nhưng tài liệu hiện có chưa yêu cầu Workbench item trở thành một schema trong `docs/meta`. Vì vậy activation phase dùng decision để ratify policy/template dưới `docs/workbench/**`. Chỉ tạo meta schema mới nếu sau này Workbench record trở thành contract dùng chung ngoài workspace này; không tạo meta contract chỉ để bật folder.

## Các giá trị local phải chốt

Plan đã xác định loại giá trị cần có nhưng trước đây chưa gán baseline cụ thể. Bộ dưới đây là **giá trị đề xuất để triển khai**, chưa có hiệu lực cho tới khi decision activation ở trạng thái `accepted`.

| Key | Giá trị đề xuất | Nơi chốt/triển khai |
| --- | --- | --- |
| `activation_decision` | `DEC-003-workbench-activation-policy` nếu ID còn trống | Decision local |
| `activation_scope` | Chỉ `docs/workbench/cis/`; không mở toàn bộ Workbench cho domain khác | Decision |
| `workspace_owner` | `repo maintainer` làm lifecycle custodian | Decision |
| `intake_actor` | Human hoặc workbench-support agent được tạo draft; mọi item phải gán human owner role ngay khi tạo | Decision + policy |
| `promotion_approver` | Theo canonical target: product/app owner, doc-system/meta owner hoặc theory owner | Decision + ownership hiện có trong `docs/meta/README.md` |
| `source_type` | `idea`, `code_observation`, `incident_evidence`, `product_question`, `implementation_gap` | Policy/template |
| `uncertainty.type` | `canonical_home`, `contract`, `modeling`, `evidence` | Policy/template |
| Item lifecycle | `intake → triaged → modeling ↔ in_review → ready_for_promotion → promoted`; terminal khác: `rejected`, `superseded`, `expired` | Decision ratify; policy thực thi |
| Initial review | `review_by = created_at + 7 ngày lịch` | Policy |
| Expiry mặc định | `expires_at = created_at + 30 ngày lịch` | Decision ratify; policy thực thi |
| Gia hạn | Tối đa một lần, thêm không quá 30 ngày; bắt buộc reason + approver + timestamp | Decision + policy |
| Review cadence | Weekly triage cho `intake`/overdue; monthly audit cho toàn workspace | Decision + policy |
| Stale semantics | Derived condition khi quá `review_by`; không là canonical status và không tự promote/delete | Policy |
| Policy path | `docs/workbench/cis/policy.md` | Decision pointer + Workbench |
| Workflow profile path | `workflow-profile.md` cạnh DEC-003; đây là supporting artifact của decision, không nằm trong guide | Decision folder |
| Item ID | `WB-CIS-NNNN`; bốn chữ số, tăng đơn điệu, không tái sử dụng | Policy |
| Item path | `docs/workbench/cis/items/wb-cis-NNNN.md`; path giữ ổn định suốt lifecycle | Policy |
| Item registry | `docs/workbench/cis/items/README.md`, nhóm theo active/terminal state | Workbench |
| Terminal retention | Không move/rename file; giữ metadata + disposition read-only tại path cũ để tránh link rot | Policy |
| Validation activation | Có `verify:workbench` ngay trong activation change set; structural-only, không thay semantic/human approval | Tooling local |
| First item | Không tạo candidate giả để làm đẹp folder; dùng fixture cho test và chỉ tạo item thật từ nhu cầu thật | Policy + acceptance |

### Giá trị bắt buộc human ratify

Các giá trị sau là governance choice, không để agent âm thầm đổi khi implement:

1. `workspace_owner`;
2. reviewer/approver mapping theo canonical target;
3. TTL 30 ngày, quyền gia hạn và weekly/monthly cadence;
4. phạm vi chỉ `cis/`;
5. quyền của workbench-support agent;
6. minimal `verify:workbench` là activation gate.

Các path, ID format và stable-file strategy là implementation choice có thể dùng baseline trên, trừ khi decision ghi khác.

## Workbench operational contract tối thiểu

### Item shape đề xuất

Decision phải ratify local policy/template trước khi tạo item thật. Shape tối thiểu cần bao phủ:

```yaml
id: WB-CIS-0001
policy_version: 1
status: intake
source_type: idea | code_observation | incident_evidence | product_question | implementation_gap
title:
claim_or_question:
owner:
created_at:
updated_at:
review_by:
expires_at:

source_refs: []
evidence_refs: []
authority_refs: []

uncertainty:
  type: canonical_home | contract | modeling | evidence
  reason:

candidate_destinations: []
candidate_entities: []
candidate_relations: []
open_questions: []

handoff:
  workflow:
  canonical_targets: []
  validation_result:

disposition:
  result:
  reason:
  superseded_by:
  closed_at:

history: []
```

Không paste credential, token, raw webhook payload hoặc dữ liệu nhạy cảm vào item. `source_refs`/`evidence_refs` phải trỏ tới nguồn được phép đọc.

Mỗi entry trong `history` phải có `at`, `actor`, `from`, `to` và `reason`; entry đầu ghi việc tạo item từ `none` sang `intake`.

### Required field theo stage

Không nên bắt `canonical destination` chính xác ngay tại intake, vì đó chính là điều Workbench cần khám phá. Contract phải tăng dần:

| Stage | Điều kiện tối thiểu |
| --- | --- |
| `intake` | ID, policy version, source type, title/question, human owner role, source refs, uncertainty reason, created/updated/review/expiry date và history entry đầu |
| `triaged` | Xác nhận in-scope, ít nhất một destination candidate hoặc lý do chưa có, next action |
| `modeling` | Candidate claim/model, evidence đã có, evidence/contract gap, không trình bày candidate như truth |
| `in_review` | Claim đủ cụ thể để review, reviewer theo target home, open question còn lại được nêu rõ |
| `ready_for_promotion` | Chính xác một canonical destination, authority/evidence đủ, workflow handoff và required validation đã xác định |
| `promoted` | Canonical target tồn tại, validation result pass/accepted-gap hợp lệ, link handoff được ghi |
| `rejected` | Lý do và reviewer/authority từ chối |
| `superseded` | Stable target item hoặc canonical target thay thế |
| `expired` | Lý do hết hạn và terminal-retention record |

### Lifecycle đề xuất

```text
intake
→ triaged
→ modeling
↔ in_review
→ ready_for_promotion
→ promoted

terminal từ active state khi có lý do:
rejected | superseded | expired
```

`stale` nên là condition được suy ra từ `review_by`/`expires_at`, không nhất thiết là status độc lập. Khi stale, owner phải review và chuyển sang một state có nghĩa; quá hạn không tự biến candidate thành truth và cũng không được xóa mất audit record.

### Hai loại “source of truth” phải tách rõ

- Candidate content trong item **không** là app/meta/theory truth và không được dùng làm implementation authority.
- Item là operational record cho chính lifecycle của nó: owner, status, review và disposition. Nếu không cho record này có giá trị audit, TTL/handoff sẽ không thể kiểm chứng.

Vì vậy câu “Workbench không phải source of truth” phải được diễn đạt chính xác là “Workbench không phải source of canonical product/documentation knowledge”.

## Workbench authority và canonical promotion

| Vai trò | Quyền |
| --- | --- |
| Intake author | Tạo item theo allowed source type; không approve truth |
| Workbench owner/custodian | Triage, yêu cầu evidence, quản lý TTL/cadence; không tự approve app/meta truth nếu không đồng thời có role tương ứng |
| Product/app owner | Xác nhận authority và destination cho `docs/app` |
| Doc-system/meta owner | Xác nhận schema/contract/destination cho `docs/meta` |
| Theory owner | Xác nhận candidate đủ điều kiện đi vào `docs/theories` hoặc route sang challenge/refine |
| Standard docs agent/workflow | Materialize thay đổi vào canonical home và chạy validation; không tự thay reviewer |

Promotion phải tạo handoff record tối thiểu:

```text
workbench item ID
claim được promote
authority/evidence refs
exact canonical target
workflow phải chạy
reviewer/approval
validation result
terminal disposition
```

Quy tắc promotion:

1. Chạy lại `read-for-task`; kết luận cũ trong Workbench chỉ là candidate.
2. Nếu nội dung đổi product behavior, phải có `sync-product-change = ready_for_write`.
3. Dùng `write-docs` để materialize; không copy nguyên item vào canonical home.
4. Dùng `trace-impact` khi có entity/relation/impact.
5. Chạy `validate-after-change` và local gate áp dụng.
6. Chỉ set `promoted` sau khi canonical target tồn tại và validation trả `ready` hoặc `accepted-gap` hợp lệ.
7. Nếu handoff/validation fail, item quay về `modeling`/`in_review` với blocker; không ghi `promoted`.

Workbench item không đủ để tạo entity type, relation type, valid triple, entity instance hoặc canonical relation. Các Type Contract Gate, relation gate và DEC-002 vẫn giữ nguyên.

## Quan hệ với `NOTE-*`

`NOTE-*` và Workbench phục vụ hai độ lớn khác nhau:

| Cơ chế | Dùng khi | Không dùng khi |
| --- | --- | --- |
| `NOTE-OPEN` / `NOTE-EVIDENCE` | Home đã biết; thiếu một fact/evidence cục bộ, có context gần | Candidate độc lập, cross-layer hoặc cần owner/TTL/review |
| Workbench item | Chưa rõ home/contract/modeling; cần maturation và disposition có audit | Fact đã đủ canonical hoặc chỉ là delivery task |

Không migrate mọi `NOTE-*` sang Workbench. Chỉ migrate note nào thực chất là candidate độc lập hoặc đã trở thành backlog không owner. Ngược lại, không tạo Workbench item cho từng open question nhỏ trong một unit đã có home.

## Đưa Workbench vào hoạt động bằng một change set nguyên tử

Không bật trạng thái active trước rồi mới bổ sung governance sau. Activation change set phải đồng thời xử lý:

### A. Authority và local contract

- Tạo decision activation trong `docs/app/10-decisions/01-decision-making/01-decisions/` và cập nhật decision index.
- Materialize product workflow profile tại canonical home local do decision chốt, trong đó bind:
  - activation decision;
  - temporary knowledge policy;
  - Workbench workspace;
  - reviewer roles;
  - validation hooks.
- Tạo policy local dưới `docs/workbench/**` cho item shape, status/transition, TTL/cadence, validation checklist và terminal retention; decision phải trỏ tới đúng policy version/path này.
- Chỉ sửa `docs/meta` để làm rõ convention chung như ranh giới `NOTE-*` nếu cần; không coi meta schema mới là precondition mặc định của activation.

WFP-09 chưa chốt sẵn canonical home của workflow profile, nên Plan 03 không tự đặt profile vào guide hoặc meta. Decision local phải chọn path, còn profile chỉ bind các nguồn và không tạo activation authority thứ hai.

### B. Workspace vận hành

- Đổi `docs/workbench/README.md` và `docs/workbench/cis/README.md` từ inactive sang active mirror có link về decision/policy.
- Thay template nháp bằng template theo policy đã được decision ratify.
- Quy định registry active/terminal item, terminal retention và naming/ID.
- Không biến folder thành nơi chứa prose tự do không có item contract.

### C. Khung Workbench trong guide và main dispatcher

Cập nhật các entry point để cùng một route:

- `docs/guide/README.md`;
- `docs/guide/concepts/workbench-model.md` (mới);
- `docs/guide/workflows/README.md`;
- `read-for-task.md`;
- `write-docs.md`;
- `use-workbench.md`;
- `quick-start.md`;
- `first-doc-change.md`;
- concept/reference có câu “lifecycle local” hoặc “optional workspace” nếu cần làm rõ.

Guide phải đủ để một project hiểu và vận hành Workbench mà chưa cần biết policy của `task_transportor`:

```text
purpose / conceptual model
trigger và non-trigger
precondition và cách resolve local activation/policy
generic input và intake result
generic lifecycle phase
authority boundary
output / terminal outcomes
canonical handoff
stop condition và validation responsibility
anti-pattern / failure mode
```

Lifecycle trong guide chỉ mang meaning trừu tượng:

```text
capture
→ mature / model
→ review
→ canonical handoff | terminal disposition
```

Guide được nêu capability tối thiểu như “phải có owner, source, review/expiry rule và destination hypothesis”, nhưng không được chuẩn hóa field name hoặc local value. Guide không copy status vocabulary, TTL số ngày, CIS owner, `WB-CIS-NNNN`, item path hoặc local verify command.

Phân chia artifact trong guide:

- `concepts/workbench-model.md`: giải thích Workbench là gì, temporary operational authority, canonical boundary và quan hệ với note/decision/issue tracker.
- `workflows/use-workbench.md`: procedure generic có trigger, input, workflow, output, stop condition, validation và handoff.
- `workflows/README.md`: đặt Workbench vào dispatcher như conditional core branch.

### D. Agent operations

Đồng bộ mọi rule hiện đang nói Workbench inactive:

- `docs/AGENT_SKILLS/README.md`;
- `guides/mandatory-rules.md`;
- `guides/reading-strategy.md`;
- `guides/system-overview.md`;
- `doc-navigate/SKILL.md`;
- `doc-create-entity/SKILL.md`;
- các skill khác có guardrail liên quan.

Standard agent phải nhận biết route Workbench trong dispatcher. Workbench-support procedure có thể quản lý intake/lifecycle, nhưng không có authority cao hơn local decision hoặc canonical owner; canonical promotion luôn handoff lại standard flow.

### E. Validation và review record

- `npm run verify:docs` tiếp tục kiểm link/anchor của Workbench nhưng không được claim validate lifecycle semantics.
- Activation change set phải thêm `verify:workbench` hoặc extension tương đương của docs-contract để kiểm required fields, ID/path/status, owner, review/expiry date và terminal target.
- Verifier chỉ là structural gate; authority, evidence quality, canonical placement và promotion approval vẫn review thủ công.
- Sau khi implementation hoàn tất, cập nhật `docs/review/workflows/all.md` và `plans/README.md` từ finding mở sang trạng thái đã triển khai.

## Phạm vi triển khai để fill Workbench và hướng dẫn

### Đánh giá mức đầy đủ

Phần reasoning/lifecycle ở trên đủ để thiết kế, nhưng Workbench hiện đang trống về vận hành. Chỉ sửa `docs/workbench/README.md` và `use-workbench.md` sẽ **không đủ**: kết quả vẫn thiếu decision authority, policy, item registry, agent procedure và validation.

Với baseline value và manifest dưới đây, Plan 03 đã **fill-ready**. Workbench chỉ được coi là operational khi toàn bộ row bắt buộc của manifest đã được thực hiện và activation gate pass.

### Cấu trúc đích

```text
docs/workbench/
├── README.md                         # active mirror + boundary + route
└── cis/
    ├── README.md                     # entry point và operating summary
    ├── policy.md                     # lifecycle/TTL/authority/transition
    ├── templates/
    │   └── work-item.md              # item contract được ratify
    └── items/
        ├── README.md                 # registry active/terminal
        └── wb-cis-NNNN.md            # chỉ xuất hiện khi có candidate thật
```

Không cần tạo physical `archive/` ở phase đầu. Stable item path + terminal status + registry grouping cho audit tốt hơn việc move file và làm gãy reference.

### Implementation manifest bắt buộc

| Nhóm | File/action | Nội dung phải fill |
| --- | --- | --- |
| Authority | Tạo `docs/app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md` | Choice, scope CIS, owner, authority, lifecycle core, TTL/cadence, policy pointer, alternatives, consequences, review/deactivation triggers |
| Authority | Tạo `workflow-profile.md` cạnh DEC-003 | Bind decision, policy, workspace, reviewers và verify command; `active` chỉ là mirror |
| Authority | Sửa `docs/app/10-decisions/README.md` | Index DEC-003 như governance decision active |
| Workbench root | Sửa `docs/workbench/README.md` | Bỏ trạng thái inactive; link DEC-003/profile; nêu scope active và canonical boundary |
| CIS workspace | Viết lại `docs/workbench/cis/README.md` | Entry point, trigger, folder map, lifecycle summary, owner, cách intake/promote/review |
| CIS policy | Tạo `docs/workbench/cis/policy.md` | Giá trị local ở bảng trên, transition table, required field by stage, TTL, extension, stale sweep, terminal retention |
| Template | Viết lại `docs/workbench/cis/templates/work-item.md` | YAML/body contract, bỏ gate “chờ guide”, link decision/policy |
| Registry | Tạo `docs/workbench/cis/items/README.md` | ID allocation rule, active/terminal indexes, next review visibility; không tạo fake item |
| Guide concept | Tạo `docs/guide/concepts/workbench-model.md` và link từ guide entry points | Purpose, temporary operational authority, generic lifecycle meaning, canonical boundary, quan hệ với note/decision/issue tracker |
| Guide workflow | Mở rộng `docs/guide/workflows/use-workbench.md` | Trigger/non-trigger, precondition, generic input/lifecycle/output, stop condition, validation responsibility và handoff; không copy status/TTL local |
| Main dispatcher | Sửa `docs/guide/workflows/README.md`, `read-for-task.md`, `write-docs.md` | Route bắt buộc `undetermined-placement → use-workbench` khi local decision active |
| Product sync | Sửa `sync-product-change.md` | Phân biệt evidence staging với authority `blocked`; Workbench không đổi verdict |
| Entry points | Sửa `docs/guide/README.md`, `quick-start.md`, `first-doc-change.md`, `docs/README.md` | Cùng một flow và cùng một local-decision gate; bỏ wording “chờ guide harness” |
| Note boundary | Rà `docs/meta/04-conventions/note-format.md`, `docs/AGENT_SKILLS/guides/note-types.md`, `docs/app/00-context/README.md` | Known-home local gap dùng `NOTE-*`; independent unknown-home candidate dùng Workbench |
| Agent index/rules | Sửa `docs/AGENT_SKILLS/README.md`, `guides/mandatory-rules.md`, `guides/reading-strategy.md`, `guides/system-overview.md` | Bỏ blanket ban khi active; giữ canonical authority guardrail |
| Agent routing | Sửa `doc-navigate/SKILL.md`, `doc-create-entity/SKILL.md` | Route unknown placement sang Workbench; không tạo entity/relation vì candidate |
| Workbench agent | Tạo `docs/AGENT_SKILLS/workbench-intake/SKILL.md` | Intake/triage/update/handoff procedure; agent không approve truth |
| Verification | Tạo `scripts/verify/workbench.js` và test/fixtures; thêm `verify:workbench` vào `package.json` và `npm test` | Structural contract, dates, ID/path, status, stage/terminal requirements |
| Validation guide | Sửa `docs/guide/workflows/validate-after-change.md` | Ghi đúng coverage của `verify:workbench`; semantic/authority vẫn manual |
| Review closure | Sửa `docs/review/workflows/all.md`, `plans/README.md`, và snapshot guide review có kết luận inactive | WFP-09/Plan 03 chuyển từ proposal sang implemented, ghi coverage thật |

### Phạm vi không cần fill

- Không tạo app entity/relation để “đại diện” Workbench.
- Không đưa local lifecycle vào guide generic.
- Không xây runtime database, Express route hoặc Admin UI cho Workbench.
- Không tạo item mẫu ở active registry nếu không có candidate thật.
- Không mở workspace ngoài `cis/`.
- Không bắt `verify:entity-instance`/`verify:relations` quét Workbench item; dùng verifier riêng.

### Điều kiện đủ để bắt đầu và đủ để activate

```text
đủ để bắt đầu implementation
= manifest file/action đã rõ
+ baseline value đã có

đủ để activate
= DEC-003 accepted
+ human ratify sáu governance values
+ policy/template/profile/workspace cùng version
+ guide/AGENT_SKILLS không còn route inactive mâu thuẫn
+ verify:workbench và verify:docs pass
+ acceptance scenarios pass
```

## Failure modes và cách chặn

| Failure mode | Cách chặn |
| --- | --- |
| Workbench thành source of truth thứ hai | Truth boundary trong decision/policy; cấm implementation cite candidate; promotion bắt buộc qua canonical flow |
| Bật bằng cách sửa `STATUS` trong chính Workbench | Accepted local decision là authority duy nhất; README/profile chỉ mirror |
| Mọi task bị ép qua Workbench | Chỉ route `undetermined-placement`; resolved home đi thẳng |
| Dùng Workbench để lách `sync-product-change = blocked` | Admission/handoff giữ nguyên verdict; cần authority/decision trước promotion |
| Backlog rác tồn tại vô hạn | Owner, `review_by`, `expires_at`, cadence và terminal disposition bắt buộc |
| Item tự approve chính nó | Tách custodian khỏi canonical owner/reviewer; promotion cần approval theo target home |
| Guide bị nhiễm policy CIS | Guide giữ framework/workflow generic; local field/status/value ở decision/workbench policy |
| Item bị đánh dấu promoted dù canonical write fail | `promoted` chỉ sau canonical target + validation result |
| Xóa item hết hạn làm mất audit | Giữ terminal record read-only hoặc tombstone có reason; không silent delete |
| `NOTE-*` và Workbench duplicate cùng candidate | Phân loại known-home local gap so với independent placement candidate; một tracking owner |

## Phương án đã loại

| PA | Kết luận | Lý do |
| --- | --- | --- |
| A — strict stop, không staging | Loại | An toàn cục bộ nhưng làm thất lạc knowledge và không đóng vòng |
| B — activate Workbench bằng local decision | **Chọn và làm ngay** | Giải quyết lifecycle gốc mà vẫn giữ canonical boundary |
| C — dùng `NOTE-*` làm nơi staging chính | Loại làm hướng chính | Marker không có owner/TTL/review/disposition; chỉ giữ cho known-home local gap |
| D — external issue/decision intake | Giữ như integration/supporting reference, không làm hướng chính | Có thể giữ notification/delivery task nhưng không thay local knowledge maturation/handoff |

## Acceptance scenarios bắt buộc

1. **Resolved home**: một prose change đã biết target đi thẳng `write-docs`; không tạo Workbench item.
2. **Placement uncertainty**: một CIS observation có source refs và owner nhưng chưa rõ app/meta home được tạo item, triage và có review date.
3. **Blocked authority**: code/docs conflict không có authority vẫn dừng ở `sync-product-change = blocked`; Workbench không làm nó thành `ready_for_write`.
4. **Known-home gap**: một unit chỉ thiếu evidence cục bộ dùng `NOTE-EVIDENCE`, không tạo item không cần thiết.
5. **Promotion success**: item có exact target, approval, canonical change và validation result rồi mới thành `promoted`.
6. **Promotion failure**: validation fail thì item không thành `promoted`, blocker được trả lại lifecycle.
7. **Stale handling**: item quá `review_by` được review và chuyển state; quá `expires_at` không bị silent delete.
8. **Boundary**: không file implementation/app/meta nào dùng Workbench candidate làm authority cho claim active.
9. **Decision gate**: thiếu/supersede activation decision làm intake mới bị chặn dù README/profile còn ghi active.
10. **Agent/human parity**: guide dispatcher và AGENT_SKILLS cho cùng kết quả route trên cùng input.

## Definition of Done

### Authority

- [x] Local activation decision ở trạng thái `accepted`.
- [x] Decision index và workflow profile resolve tới đúng decision/policy/workspace.
- [x] Không còn activation authority vòng tròn từ Workbench sang chính Workbench.

### Contract và workspace

- [x] Item contract/template, status transition, owner, review/TTL và disposition đã được local policy chốt và decision ratify.
- [x] `docs/workbench/cis` active và có template/index/terminal-retention rule dùng được.
- [x] Không còn câu “Workbench inactive/không được dùng” mâu thuẫn trong guide, workbench hoặc AGENT_SKILLS.

### Main flow

- [x] Dispatcher có nhánh `undetermined-placement → use-workbench`.
- [x] `workbench-model.md` giải thích đủ conceptual framework và `use-workbench.md` đủ trigger/input/output/stop/validation/handoff generic.
- [x] Route là mandatory trong `task_transportor` khi decision active, nhưng không chạm case resolved.
- [x] `sync-product-change = blocked` không bị Workbench bypass.
- [x] Promotion quay lại `read-for-task` → sync khi cần → `write-docs` → trace khi cần → `validate-after-change`.

### Audit và quality

- [x] Active item có owner, source refs, review date và expiry date.
- [x] Item từ `triaged` có destination candidate hoặc explicit reason/next action.
- [x] `ready_for_promotion` có đúng một canonical destination và authority/evidence đủ.
- [x] Terminal item có reason/target/validation result theo loại disposition.
- [x] Workbench không được cite như canonical app/meta/theory truth.
- [ ] Các acceptance scenario bắt buộc pass và kết quả verify ghi đúng coverage.

## Ngoài phạm vi

- Không xây product UI/runtime feature tên Workbench.
- Không thay issue tracker cho delivery/bug management.
- Không tự động suy ra canonical home bằng AI rồi promote không review.
- Không mở rộng ngay Workbench ngoài scope CIS nếu decision chưa review.
- Không dùng activation này để nới Type Contract Gate, relation gate, DEC-002 hoặc product authority gate.
