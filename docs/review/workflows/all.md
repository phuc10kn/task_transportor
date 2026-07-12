# Review Workflows Trong Guide

Ngày review: 2026-07-12  
Phạm vi: `docs/guide/workflows/` và các entry point, contract, verifier liên quan  
Mục tiêu: đánh giá tính hợp lý, tính thực dụng và phần cần mở rộng để product có thể dùng ngay

> File này là review và thiết kế đề xuất. Nó không thay source of truth trong `docs/app`, contract trong `docs/meta` hoặc decision local của project.

Ví dụ áp dụng cho CIS: [business_example.md](business_example.md).
Các phương án bù khoảng trống: [plans/README.md](plans/README.md).

## 1. Kết luận

Bộ workflow hiện tại **hợp lý về tư duy** nhưng mới **thực dụng một phần**:

- `read-for-task` giúp đọc hẹp và tìm đúng canonical home;
- `write-docs` giữ boundary và schema gate tốt;
- `trace-impact` có doctrine relation đúng;
- `slim-layer-readme` có checklist rõ;
- `use-workbench` là conditional core branch cho undetermined-placement khi local decision active.

Bộ này chưa thật sự “đưa vào product và dùng ngay” vì các khoảng trống còn lại:

1. `verify:docs` chưa quét `docs/app` / `docs/meta` (WFP-08).
2. Human output chuẩn còn thiếu ở `read-for-task` / `trace-impact` (WFP-06 phần còn mở).

Đã remediate: terminal `validate-after-change`, bridge `sync-product-change` (WFP-02), generic structural verifiers (WFP-03), Workbench activation DEC-003 + `verify:workbench` (WFP-09 một phần / Plan 03), và `write-docs result` short/full (Plan 04-B).

Verdict:

| Tiêu chí | Kết luận |
| --- | --- |
| Logic giữa các workflow | Đạt |
| Boundary guide/meta/app | Đạt |
| Dùng thủ công trong repo hiện tại | Dùng được |
| Human và agent cùng một contract output | Một phần — sync/validate/write có output; read/trace còn mở |
| CI bảo vệ docs/app nói chung | Chưa đạt |
| Plug-and-play cho product khác | Chưa đạt; cần local activation profile |

## 2. Nguồn đã đối chiếu

Workflow chính:

- `docs/guide/workflows/README.md`
- `docs/guide/workflows/read-for-task.md`
- `docs/guide/workflows/sync-product-change.md`
- `docs/guide/workflows/write-docs.md`
- `docs/guide/workflows/trace-impact.md`
- `docs/guide/workflows/validate-after-change.md`
- `docs/guide/workflows/slim-layer-readme.md`
- `docs/guide/workflows/use-workbench.md`

Entry point và contract liên quan:

- `docs/guide/README.md`
- `docs/guide/getting-started/quick-start.md`
- `docs/guide/getting-started/first-doc-change.md`
- `docs/guide/unit-structure/`
- `docs/meta/04-conventions/validation-model.md`
- `docs/AGENT_SKILLS/doc-navigate/SKILL.md`
- `docs/AGENT_SKILLS/meta-validate/SKILL.md`
- `docs/AGENT_SKILLS/graph-materialize/SKILL.md`
- `package.json`
- `scripts/verify/docs-navigation.js`
- `scripts/verify/entity-type-contract.js`

## 3. Tiêu chí của một workflow dùng được trong product

Một workflow vận hành được phải trả lời đủ:

1. **Trigger** — khi nào bắt đầu.
2. **Input** — cần task, path, ID, evidence nào.
3. **Precondition** — điều kiện phải đúng trước khi sửa.
4. **Steps** — thứ tự thao tác và nhánh quyết định.
5. **Output** — artifact hoặc kết luận bắt buộc.
6. **Validation** — kiểm tra thủ công và lệnh tự động.
7. **Evidence** — log/path/test nào chứng minh kết quả.
8. **Stop condition** — khi nào phải dừng thay vì đoán.
9. **Owner/authority** — guide, meta, app hay decision quyết định.
10. **Handoff** — workflow nào chạy tiếp.

Workflow chỉ liệt kê “nên làm gì” nhưng không có output, evidence và stop condition vẫn là hướng dẫn tốt, chưa phải operating procedure.

## 4. Luồng hiện tại — ĐÃ TRIỂN KHAI (§4 fix + sync-product-change)

```text
read-for-task
-> sync-product-change khi task từ code/incident/product behavior
-> write-docs khi có thay đổi
-> trace-impact khi có entity/relation/impact
-> validate-after-change
-> handoff/review

side branch:
  slim-layer-readme khi README phình

optional:
  use-workbench khi project đã kích hoạt
```

Trạng thái sau remediation:

- [validate-after-change.md](../../guide/workflows/validate-after-change.md) là terminal gate;
- [sync-product-change.md](../../guide/workflows/sync-product-change.md) là intake/conflict gate trước write;
- [workflows/README.md](../../guide/workflows/README.md) có decision matrix; slim là side branch;
- guide README, `quick-start`, `first-doc-change` đồng bộ Luồng tổng;
- `write-docs` / `trace-impact` / `slim-layer-readme` handoff về validation.

Còn ngoài phạm vi đã làm: generic instance/relation verifier, product activation profile, PR manifest.

## 5. Review từng workflow

### 5.1 `read-for-task`

Điểm mạnh:

- chiến lược `read narrow first`;
- có thứ tự layer → concern/type/instance → theory/decision → relation/meta;
- có stop condition khi chưa xác định được canonical home;
- nêu rõ output cần kết luận.

Khoảng trống:

- không có mẫu output để human và agent báo cùng một shape;
- `doc-navigate` có output chuẩn nhưng workflow human-facing không có.

Verdict: **hợp lý và dùng được**; entry point đã liệt kê `read-for-task` trong nhánh sửa docs.

### 5.2 `write-docs`

Điểm mạnh:

- phân loại đúng `app` / `meta` / `theories` / guide packs;
- schema và unit template được route rõ;
- Type Contract Gate ngăn tạo instance trên type legacy;
- boundary business/product/technical rõ;
- relation gate và doctrine một fact một direction đúng.

Khoảng trống còn lại:

- `--instance` vẫn chỉ check type contract hẹp (đã ghi rõ trong validate-after-change).

Đã materialize (Plan 04-B): Output `write-docs result` short/full + ceremony matrix trong chat/PR; không phải SoT; không thay validate.

Verdict: **mạnh về governance**; nhận handoff từ `sync-product-change`, emit write result, đóng vòng qua `validate-after-change`.

### 5.3 `trace-impact`

Điểm mạnh:

- tách impact, coverage và consistency;
- có Relation Validation Gate mười bước;
- canonical direction và reverse lookup đúng;
- chấp nhận `accepted gap` thay vì ép tạo edge;
- dừng đúng khi thiếu slot, relation type hoặc valid triple.

Khoảng trống còn lại:

- toàn bộ validation ngoài architecture graph vẫn chủ yếu thủ công / validate-after-change checklist;
- không có output record path chi tiết (ngoài kết luận 4 loại);
- nội dung overlap với `validation-model.md` — validate-after-change link meta thay vì nhân bản.

Verdict: **đúng doctrine**; đã link ví dụ `relation-trace` và handoff validate.

### 5.4 `slim-layer-readme`

Điểm mạnh:

- phân biệt app truth với giải thích generic;
- có precondition, thứ tự slim và checklist pass/fail;
- fail condition cụ thể;
- handoff `validate-after-change`.

Sau §4: đã là maintenance side branch trong Luồng tổng.

Còn lại: bước “thêm generic vào guide trước” có thể mở rộng scope; chưa có output diff checklist chuẩn.

Verdict: **checklist mạnh**; placement đúng side branch.

### 5.5 `use-workbench`

Điểm mạnh:

- giữ workbench ngoài source of truth;
- bắt buộc kiểm tra activation/policy local;
- có conceptual model + generic workflow trong guide;
- handoff về canonical workflow.

Sau Plan 03: `task_transportor` đã kích hoạt CIS Workbench bằng DEC-003; `use-workbench` là conditional core branch cho undetermined-placement.

Verdict: **đúng boundary**; là nhánh vận hành có điều kiện, không phải canonical SoT.

### 5.6 `workflows/README`

Đã có decision matrix, `sync-product-change` cho nhánh behavior, terminal `validate-after-change`, slim side branch và Workbench conditional branch.

Verdict: **đủ làm dispatcher core** cho Luồng tổng hiện tại.

### 5.7 Entry point ngoài folder workflows

`quick-start.md` và `first-doc-change.md` đã tách nhánh prose vs code/product behavior (read → sync → write → trace → validate).

`docs/AGENT_SKILLS`:

- `doc-navigate`, `meta-validate`, `graph-materialize` vẫn có checklist agent;
- `doc-navigate` và reading-strategy đã route `sync-product-change`;
- không thay `validate-after-change` làm human terminal gate.

## 6. Finding còn mở / một phần

| ID | Mức | Finding | Trạng thái |
| --- | --- | --- | --- |
| WFP-06 | Trung | Human workflow thiếu output chuẩn | Một phần — sync/validate/write có output; read/trace human output còn mở |
| WFP-07 | Trung | Tên gate dễ gây hiểu quá phạm vi thật | Một phần — write-docs/validate ghi rõ coverage; generic verifiers cũng gắn nhãn structural-only |
| WFP-08 | Trung | `verify:docs` không quét `docs/app` và `docs/meta` | Còn mở |
| WFP-09 | Trung | Product local profile chưa có | **Một phần** — DEC-003 + workflow-profile Workbench đã materialize; profile tổng quát rộng hơn vẫn có thể mở rộng |

Option paper cho các finding trên: [plans/README.md](plans/README.md).

Đã đóng và gỡ khỏi bảng: WFP-01, WFP-02, WFP-03, WFP-04, WFP-05, WFP-10, WFP-11 (xem §4, `sync-product-change`, generic docs-contract verifiers, và lịch sử remediation).

## 7. Tooling thực tế của `task_transportor`

### 7.1 Lệnh hiện có

| Lệnh | Bao phủ thật |
| --- | --- |
| `npm run verify:docs` | Link/anchor trong `docs/guide`, `docs/AGENT_SKILLS`, `docs/workbench`, `docs/review`; không quét `docs/app`, `docs/meta` |
| `npm run verify:workbench` | Structural activation/policy/registry/item contract cho CIS Workbench |
| `npm run verify:entity-type-contract` | Entity type có field `schema` và section `## structure extends` |
| `... -- --instance <path>` | Resolve type từ path instance rồi kiểm tra contract của type; không validate nội dung instance |
| `npm run verify:entity-instance` | Structural instance: frontmatter, ID/slug/folder, base + type-required sections |
| `npm run verify:relations` | Structural relations: slot, triple, target exists/type |
| `npm run verify:references` | Frontmatter `theory_basis` / `decision_basis` resolve |
| `npm run verify:docs-contract` | Unit tests cho shared parser + 3 verifier |
| `npm run verify:architecture-baseline` | Baseline/edge/contract riêng `docs/app/05-architecture` (frozen inventory) |
| `npm run architecture:trace` | Query graph architecture |
| `npm run verify:phase00` … `phase07` | Evidence behavior code/product theo phase |
| `npm test` | Gom phase + docs + pr-manifest + docs-contract + scoped `05-architecture` generic verifiers + architecture baseline/trace |

### 7.2 Navigation verifier

`npm run verify:docs` pass trên baseline hiện tại sau khi nhận HTML `id`/`name` và sửa link universal pack. Coverage vẫn chỉ guide / AGENT_SKILLS / workbench / review — không quét `docs/app` / `docs/meta` (WFP-08).

### 7.3 Điều không được claim

Không được ghi:

```text
verify:entity-type-contract --instance đã validate entity instance.
verify:entity-instance đã validate semantic meaning / evidence / Lite scope.
```

Kết luận đúng:

```text
--instance (entity-type-contract): path resolve tới type có contract tối thiểu.
verify:entity-instance / relations / references: structural/reference contract only.
Semantic meaning, evidence, trace need và boundary vẫn cần human/meta-validate.
```

## 8. Bộ workflow đích

### 8.1 Core bắt buộc

1. `read-for-task`
2. `sync-product-change` — mới, khi task bắt đầu từ code/behavior
3. `write-docs`
4. `trace-impact` — khi có entity/relation/cross-layer impact
5. `validate-after-change` — mới, terminal gate

### 8.2 Maintenance/optional

- `slim-layer-readme`: maintenance branch.
- `use-workbench`: chỉ khi local activation tồn tại.
- graph materialization: dùng policy local; guide chỉ handoff, không áp DEC-002 như universal rule.

## 9. Workflow mới tối thiểu

### 9.1 `sync-product-change`

Đã materialize tại [../../guide/workflows/sync-product-change.md](../../guide/workflows/sync-product-change.md).

Phân vai đã chốt:

- sync = intake + behavior delta + evidence + conflict gate;
- write-docs = governance + edit;
- trace-impact = relation/impact path;
- validate-after-change = terminal gate.

Không gộp write/trace/validate vào trong sync. Output `product-change sync result` handoff `ready_for_write | blocked | skip`.

Xem example: [../../guide/examples/central-sync-hub-change.md](../../guide/examples/central-sync-hub-change.md).

### 9.2 `validate-after-change`

Đã materialize tại [../../guide/workflows/validate-after-change.md](../../guide/workflows/validate-after-change.md).

Mục tiêu: tạo terminal condition chung cho human và agent.

Nhận sync result như evidence input optional; không thay checklist schema/relation.

## 10. Decision matrix sử dụng

| Loại task | Luồng |
| --- | --- |
| Chỉ cần hiểu | `read-for-task` |
| Sửa prose không đổi behavior | `read-for-task → write-docs → validate-after-change` |
| Code đổi behavior | `read-for-task → sync-product-change → write-docs → validate-after-change` |
| Thêm/sửa entity hoặc relation | `read-for-task → write-docs → trace-impact → validate-after-change` |
| Materialize app graph | Luồng entity/relation + policy local + trace query |
| Slim README | `read-for-task → slim-layer-readme → validate-after-change` |
| Workbench | `use-workbench → canonical handoff → luồng phù hợp ở trên` |

## 11. Product activation profile

Guide nên portable; mỗi product phải bind workflow vào local reality bằng một profile ngắn. Canonical home của profile do project quyết định, không đặt mặc định trong guide.

Profile tối thiểu:

```yaml
workflow_profile:
  app_truth_root: docs/app
  meta_contract_root: docs/meta
  source_roots:
    - src
  test_commands:
    product: npm test
    docs_navigation: npm run verify:docs
    entity_type: npm run verify:entity-type-contract
  relation_policy:
    local_decision: <path-or-none>
  temporary_knowledge_policy: docs/app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md
  workbench:
    active: true
  required_reviewers:
    app_truth: <role>
    meta_contract: <role>
```

Với `task_transportor`, profile Workbench đã materialize tại [workflow-profile.md](../../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/workflow-profile.md):

- scope/behavior Lite lấy từ `docs/app/02-product/README.md`;
- decision còn hiệu lực lấy từ `docs/app/10-decisions/`;
- architecture graph theo DEC-002;
- temporary knowledge / Workbench theo DEC-003;
- phase verify theo `docs/app/08-quality/README.md`;
- `verify:docs`, `verify:workbench` và `verify:entity-type-contract` có coverage giới hạn như mục 7.

## 12. Lộ trình mở rộng

### Giai đoạn 0 — dùng ngay, chưa cần code tooling

- dùng output record trong mục 9;
- coi `meta-validate` là checklist thủ công;
- ghi command + coverage, không chỉ ghi “pass”;
- mọi code behavior change phải có product-change sync result.

### Giai đoạn 1 — chỉnh guide

1. Thêm `validate-after-change.md`. — đã làm
2. Thêm `sync-product-change.md`. — đã làm
3. Sửa `workflows/README.md` thành decision matrix. — đã làm
4. Chuyển `slim-layer-readme` thành side branch. — đã làm
5. Đồng bộ `quick-start` và `first-doc-change`. — đã làm
6. Link `relation-trace.md` từ `trace-impact`. — đã làm
7. Link workflow từ `unit-structure/README.md`.

### Giai đoạn 2 — productize tooling

Ưu tiên:

1. `verify:entity-instance` — required frontmatter/body section/type/path. — đã làm
2. `verify:relations` — slot/type/triple/direction/target. — đã làm
3. `verify:references` — theory/decision ID. — đã làm
4. Mở rộng link validation cho `docs/app` và `docs/meta`. — còn mở (WFP-08)
5. Structured report cho validation để CI và agent dùng cùng output. — một phần (`--json`)

Không nên copy nguyên frozen architecture baseline để kiểm tra Business; cần generic validator dựa trên meta contract.

## 13. Acceptance criteria cho bộ workflow product-ready

- [ ] Mọi workflow có trigger, input, output, validation và stop condition.
- [ ] Mọi thay đổi docs có `validate-after-change result`.
- [x] Mọi code behavior change có workflow `sync-product-change` và `product-change sync result`.
- [ ] Command result luôn ghi coverage thực, không claim quá verifier.
- [ ] Relation mới có slot, relation type, valid triple, direction và target hợp lệ.
- [x] App truth không được suy ra chỉ từ code khi docs/decision đang mâu thuẫn (sync `blocked`).
- [x] `quick-start`, `first-doc-change` và workflows index dùng cùng một Luồng tổng.
- [x] `slim-layer-readme` là maintenance branch.
- [x] Product có local activation profile.
- [x] CI/local gate có generic instance/relation validation scoped (`05-architecture` trong `npm test`).
- [x] Workbench CIS active theo DEC-003 với `verify:workbench` structural gate.

## 14. Những gì không nên đưa vào guide generic

- scope Lite/MVP của CIS;
- command bắt buộc của riêng một package manager;
- DEC-002 như policy universal cho mọi project;
- workbench lifecycle/status local;
- business entity instance của CIS;
- frozen baseline theo số lượng instance/edge của một app.

Các phần trên phải ở product local; guide chỉ định nghĩa cách bind và cách handoff.
