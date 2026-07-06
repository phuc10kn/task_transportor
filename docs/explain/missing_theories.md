# Báo cáo missing theories và chiến lược fill theory cho toàn bộ app

## Mục tiêu

File này là bản canonical để:

- gộp phần gap-analysis của `missing_theories.md` cũ;
- gộp phần source-analysis của `custom_modular_monolith.md`;
- mở rộng mục tiêu từ `05-architecture` sang `fill theory cho toàn bộ app`.

Nó trả lời 5 câu hỏi:

1. Hiện đang thiếu theory gì?
2. Từ docs sẵn có có thể khôi phục được theory nào?
3. Nội dung nào là `Pure Theory`, nội dung nào là `app-specific application`?
4. Từng cụm tài liệu nguồn nên rơi vào `theories/` hay `app/*`?
5. Nếu muốn fill theory cho toàn bộ app, nên materialize những theory nào trước?

## Kết luận ngắn

Hiện trạng thiếu không chỉ nằm ở `app/05-architecture`, mà nằm ở cả hệ `docs_native_theory_app/theories/`.

Thiếu theo 3 lớp:

1. Thiếu `theory folder` thật trong `docs_native_theory_app/theories/`.
2. Thiếu `routing` từ `app/*` sang theory nền.
3. Thiếu một `theory map` bao quát toàn app, nên nhiều nội dung reasoning đang nằm phân tán trong:
   - `docs/architecture/*`
   - `docs/architecture/custom_modular_monolith_theory/*`
   - `docs/work/*`
   - `docs/business/*`
   - `docs_native_theory_app/all.md`

Nếu mục tiêu là `fill theory cho toàn bộ app`, thì không đủ chỉ materialize một theory modular monolith.

Tối thiểu cần một `theory set` gồm 6 theory hoạt động:

1. `TH-MODULAR` - Modular Architecture
2. `TH-HUBFLOW` - Hub-mediated Integration
3. `TH-CANON` - Canonical State Governance
4. `TH-AI-GOV` - Human-governed AI Assistance
5. `TH-SYNC-SAFE` - Safe External Synchronization
6. `TH-OPS-TRACE` - Recoverable Operations and Traceability

Trong đó:

- `TH-MODULAR` là theory kiến trúc nền đã khôi phục được chắc nhất.
- 5 theory còn lại là theory cấp app, cũng khôi phục được từ docs hiện có, nhưng hiện chưa được materialize thành theory folder.

## Vai trò của hai tài liệu gốc

### `custom_modular_monolith.md` đóng góp gì

File đó mạnh ở:

- phân tích theo từng file trong `docs/architecture/custom_modular_monolith_theory`;
- chỉ ra file nào thuộc theory, file nào không;
- chỉ ra phần nào phải rơi xuống `app/05`, `app/06`, `app/07`, `app/10`.

Nó là tài liệu tốt để trả lời:

```text
Nguồn cũ nên migrate theo meaning-to-layer như thế nào?
```

### `missing_theories.md` cũ đóng góp gì

File cũ mạnh ở:

- chỉ ra `TH-MODULAR` đang bị thiếu materialization;
- chỉ ra `05-architecture` đang có `theory_basis` nhưng chưa có theory home;
- khôi phục được `TH-MOD-01..06`;
- phân biệt rõ `Pure Theory` với `app-specific architecture`.

Nó là tài liệu tốt để trả lời:

```text
Hiện hệ docs đang thiếu theory gì và khôi phục được gì ngay?
```

### File hiện tại làm gì

File hiện tại giữ cả hai giá trị:

- dùng góc nhìn `source migration` của `custom_modular_monolith.md`;
- dùng góc nhìn `theory gap + reconstruction` của `missing_theories.md` cũ;
- nâng scope lên `toàn bộ app`.

## Nguồn đã dùng để tổng hợp

### Theory system

- `docs_native_theory_app/theories/README.md`
- `docs_native_theory_app/theories/governance.md`
- `docs_native_theory_app/AGENT_SKILLS/reference/theory-file-structure.md`
- `docs_native_theory_app/all.md`

### Nguồn generic của pattern modular monolith

- `docs/architecture/custom_modular_monolith_theory/overview.md`
- `docs/architecture/custom_modular_monolith_theory/theory.md`
- `docs/architecture/custom_modular_monolith_theory/knowledge_boundary.md`
- `docs/architecture/custom_modular_monolith_theory/design_axioms.md`
- `docs/architecture/custom_modular_monolith_theory/concepts.md`
- `docs/architecture/custom_modular_monolith_theory/boundary_model.md`
- `docs/architecture/custom_modular_monolith_theory/data_ownership.md`
- `docs/architecture/custom_modular_monolith_theory/evolution.md`
- `docs/architecture/custom_modular_monolith_theory/tradeoffs_and_antipatterns.md`
- `docs/architecture/custom_modular_monolith_theory/implement_rules.md`

### Nguồn áp dụng riêng của repo

- `docs/architecture/README.md`
- `docs/architecture/01-direction.md`
- `docs/architecture/02-module-structure.md`
- `docs/architecture/04-boundaries.md`
- `docs/architecture/05-flow-template.md`
- `docs/architecture/workflows/*`
- `docs/work/README.md`
- `docs/work/01-architecture.md`
- `docs/work/02-central-issue-store.md`
- `docs/work/06-sync-engine.md`
- `docs/work/plans/README.md`
- `docs/work/implement-interview.md`
- `docs/business/*`

### Đối chiếu với code hiện tại

- `src/app.js`
- `src/server.js`
- `src/modules/*`
- `src/infrastructure/ai/*`

## Thiếu gì ở mức toàn app

| Hạng mục thiếu | Mức độ | Thiếu như thế nào | Đích đúng |
| --- | --- | --- | --- |
| Root theory catalog thật | Nặng | `docs_native_theory_app/theories/` đã có root `README.md` và root `governance.md`, nhưng chưa có các theory folder active | `docs_native_theory_app/theories/` |
| `TH-MODULAR` materialized | Nặng | Chưa có theory folder thật cho modular architecture | `docs_native_theory_app/theories/modular-architecture/` |
| Theory cho `System -> CIS -> System` | Nặng | Product model lõi đang sống trong `docs/work` và `docs/architecture`, chưa có theory hóa | `docs_native_theory_app/theories/hub-mediated-integration/` |
| Theory cho canonical state | Nặng | Tư duy canonical/core/source-of-truth đang phân tán | `docs_native_theory_app/theories/canonical-state-governance/` |
| Theory cho AI/human governance | Nặng | Có nhiều rule mạnh nhưng chưa được gom thành theory | `docs_native_theory_app/theories/human-governed-ai-assistance/` |
| Theory cho safe outbound | Vừa-nặng | Dry-run, gate, pre-check có mặt khắp docs nhưng chưa có theory home | `docs_native_theory_app/theories/safe-external-synchronization/` |
| Theory cho recoverable operation | Vừa-nặng | Retry, journal, audit, traceability có mặt rõ nhưng chưa có theory home | `docs_native_theory_app/theories/recoverable-operations/` |
| Theory routing từ app docs | Nặng | `app/*` có `theory_basis` rải rác nhưng chưa có routing nhất quán | README từng layer và entity instance |
| Whole-app theory map | Vừa | Đã có bản v1 trong root theory index và root governance, nhưng còn cần materialize theory folders và backfill routing vào app docs | `docs_native_theory_app/theories/README.md`, `docs_native_theory_app/theories/governance.md` và file này |

## Luật tách lớp

### Cái gì mới đủ điều kiện thành theory

Chỉ tạo theory khi có đủ:

- một `stable problem space`;
- một `project-owned position`;
- một `reusable reasoning foundation`;
- và nó có thể ảnh hưởng nhiều entity hoặc nhiều layer.

### Cái gì không nên thành theory riêng

Không tạo theory riêng chỉ vì:

- có một module cụ thể;
- có một endpoint cụ thể;
- có một bảng SQLite cụ thể;
- có một flow implementation cụ thể;
- có một lệnh audit `rg`;
- có một UI screen;
- có một checklist coding rule.

### Cái gì là `Pure Theory`

`Pure Theory` nên nói về:

- project tin điều gì;
- tại sao tin điều đó;
- principle nào ổn định;
- tension nào được chấp nhận;
- khi nào phải đổi principle.

### Cái gì là `App-specific application`

`App-specific application` nên nói về:

- repo này áp dụng principle đó ra sao;
- module nào đang tồn tại;
- state nào do ai sở hữu;
- workflow nào chạy thật;
- job/journal/table/API nào đang dùng.

## Theory set nên có cho toàn bộ app

### 1. `TH-MODULAR` - Modular Architecture

**Trạng thái:** khôi phục được chắc chắn ngay.

**Mục tiêu:** định nghĩa cách project hiểu về module, boundary, ownership và pragmatic hybrid modular monolith.

**Nguồn mạnh nhất:**

- `docs_native_theory_app/all.md`
- `docs/architecture/custom_modular_monolith_theory/*`
- `docs/architecture/01-direction.md`
- `docs/architecture/02-module-structure.md`
- `docs/architecture/04-boundaries.md`

**Core positions khôi phục được:**

- `TH-MOD-01`: Behavioral ownership is primary
- `TH-MOD-02`: Module boundary matters more than uniform structure
- `TH-MOD-03`: Prefer deep modules
- `TH-MOD-04`: Internal implementation must remain hidden
- `TH-MOD-05`: Infrastructure sharing is contextual
- `TH-MOD-06`: Data ownership is contextual

**Cái gì nên nằm trong theory này:**

- module là boundary nghiệp vụ;
- owner API là gì;
- shared database không đồng nghĩa shared ownership;
- cross-module write nghiêm hơn cross-module read;
- read exception chỉ hợp lệ khi explicit và reviewable;
- vì sao chưa cần microservices ngay;
- evolution trigger của modular monolith.

**Cái gì không nên nằm trong theory này:**

- tree source code cụ thể;
- import path cụ thể;
- audit command `rg`;
- module map thật của repo;
- workflow Jira/Backlog thật;
- bảng `issues`, `translation_queue`, `sync_jobs`.

### 2. `TH-HUBFLOW` - Hub-mediated Integration

**Trạng thái:** nên materialize ngay sau `TH-MODULAR`.

**Mục tiêu:** chốt lý do vì sao project chọn mô hình:

```text
System -> Core Hub -> System
```

thay vì sync trực tiếp system-to-system.

**Nguồn mạnh nhất:**

- `docs/work/README.md`
- `docs/work/01-architecture.md`
- `docs/architecture/01-direction.md`
- `docs/architecture/05-flow-template.md`
- `docs/work/plans/README.md`

**Project-owned positions có thể khôi phục:**

- không sync trực tiếp `System -> System` bỏ qua core;
- inbound phải vào core trước;
- processing phải bám vào core state;
- outbound chỉ xảy ra sau khi core đủ điều kiện;
- external adapter không phải nơi sở hữu quyết định nghiệp vụ cuối.

**Cái gì nên nằm trong theory này:**

- hub-mediated integration là gì;
- khi nào core hub tốt hơn point-to-point sync;
- vì sao core không chỉ là pass-through cache;
- trade-off giữa tốc độ đơn giản ban đầu và độ kiểm soát vận hành.

**Cái gì không nên nằm trong theory này:**

- tên `CIS` cụ thể;
- endpoint webhook cụ thể;
- `Backlog`, `Jira` như integration thật;
- bảng job/journal cụ thể.

### 3. `TH-CANON` - Canonical State Governance

**Trạng thái:** nên materialize trong wave đầu.

**Mục tiêu:** chốt tư duy về canonical state, source snapshot, reviewed state, workflow state và owner của từng loại state.

**Nguồn mạnh nhất:**

- `docs/work/02-central-issue-store.md`
- `docs/architecture/workflows/issue-editor-canonical-edit.md`
- `docs/architecture/workflows/jira-dry-run.md`
- `docs/business/entities/issue.md`
- `docs/business/entities/mapping.md`

**Project-owned positions có thể khôi phục:**

- canonical state là state vận hành mà hệ thống tin dùng;
- source snapshot phải được giữ tách khỏi canonical branch;
- workflow/job state không được thay thế canonical state;
- canonical state phải có owner rõ;
- reviewed translation hoặc approved mapping chỉ có giá trị khi đi vào đúng owner state.

**Cái gì nên nằm trong theory này:**

- canonical state là gì;
- source snapshot khác canonical state như thế nào;
- vì sao canonical state không được nhầm với workflow engine state;
- tension giữa source fidelity và operational editability.

**Cái gì không nên nằm trong theory này:**

- field `fields_json.*.cis` cụ thể;
- schema `issues`, `issue_revisions`, `mapping_rules` cụ thể;
- cách render editor UI.

### 4. `TH-AI-GOV` - Human-governed AI Assistance

**Trạng thái:** nên materialize trong wave đầu.

**Mục tiêu:** chốt vai trò của AI trong app: AI được phép draft, propose, analyze nhưng không phải người quyết định cuối cùng cho operation quan trọng.

**Nguồn mạnh nhất:**

- `docs/work/01-architecture.md`
- `docs/work/plans/README.md`
- `docs/architecture/04-boundaries.md`
- `docs/architecture/workflows/translation-review.md`
- `docs/work/plans/lite/workflow/translationContextAgent.md`
- `docs/work/plans/lite/workflow/translationStandardInput.md`

**Project-owned positions có thể khôi phục:**

- AI propose, human decide;
- AI transport và business review phải tách lớp;
- provider/transport không được trở thành domain contract;
- reviewed result mới được apply vào operational state;
- low confidence dẫn đến review ưu tiên cao hơn, không đồng nghĩa AI tự chốt.

**Cái gì nên nằm trong theory này:**

- vai trò đúng của AI trong business operation;
- boundary giữa AI capability và technical transport;
- khi nào AI chỉ draft, khi nào AI được analyze;
- tại sao human review vẫn là guardrail cần thiết.

**Cái gì không nên nằm trong theory này:**

- tên model cụ thể;
- `translation_ai_provider`, `translation_ai_transport`, `translation_ai_model`;
- class cụ thể như `OpenAiCompatibleChatClient`.

### 5. `TH-SYNC-SAFE` - Safe External Synchronization

**Trạng thái:** nên materialize trong wave hai, nhưng có thể tạo sớm nếu muốn route rõ cho business/product/quality.

**Mục tiêu:** chốt tư duy rằng outbound external write là hành vi rủi ro cao và cần gate.

**Nguồn mạnh nhất:**

- `docs/architecture/workflows/jira-dry-run.md`
- `docs/architecture/workflows/cis-to-jira-sync.md`
- `docs/work/06-sync-engine.md`
- `docs/work/plans/README.md`
- `docs/business/workflows/jira-sync-preview.md`
- `docs/business/workflows/jira-sync-publish.md`

**Project-owned positions có thể khôi phục:**

- dry-run là cổng an toàn trước sync thật;
- outbound write phải đi sau readiness/pre-check;
- mapping gap, blocking anomaly, stale preview có quyền chặn sync thật;
- irreversible external write cần guardrail mạnh hơn internal update.

**Cái gì nên nằm trong theory này:**

- vì sao dry-run cần tồn tại như safety gate;
- khi nào preview phải stale;
- tại sao validation trước outbound quan trọng hơn “sync cho nhanh”.

**Cái gì không nên nằm trong theory này:**

- payload Jira cụ thể;
- endpoint `/dry-run/jira`;
- implementation repository của dry-run.

### 6. `TH-OPS-TRACE` - Recoverable Operations and Traceability

**Trạng thái:** nên materialize trong wave hai.

**Mục tiêu:** chốt tư duy rằng operation có side effect phải trace, retry, recover và giải thích được.

**Nguồn mạnh nhất:**

- `docs/work/06-sync-engine.md`
- `docs/business/workflows/failed-job-retry.md`
- `docs/business/workflows/audit-and-journal-review.md`
- `docs/business/usecases/monitor-and-recover.md`
- `docs/architecture/workflows/cis-to-jira-sync.md`

**Project-owned positions có thể khôi phục:**

- operation quan trọng phải có trace;
- retry là hành vi có ngữ nghĩa vận hành, không chỉ là loop kỹ thuật;
- journal/audit là công cụ ra quyết định chứ không chỉ log;
- failure phải recoverable hoặc ít nhất diagnosable;
- worker/job state không thay cho business state, nhưng là lớp vận hành cần quản trị riêng.

**Cái gì nên nằm trong theory này:**

- traceability là gì;
- recoverability là gì;
- khi nào cần job, journal, audit;
- vì sao hệ thống có side effect cần explainability vận hành.

**Cái gì không nên nằm trong theory này:**

- schema `sync_jobs`, `sync_journal` cụ thể;
- retry count `1m -> 5m -> 15m` cụ thể;
- route admin retry cụ thể.

## Theory nào chưa cần materialize thành theory riêng

Không nên tạo theory riêng ngay cho:

- UI layout hay admin screen;
- SQLite choice;
- webhook verification detail;
- Express route ownership;
- coding rules và `rg` audit command;
- từng workflow đơn lẻ;
- từng module riêng như `Backlog`, `Jira`, `Dashboard`.

Những thứ này nên sống ở:

- `app/05-architecture/*`
- `app/06-technical/*`
- `app/07-implementation/*`
- `app/08-quality/*`
- `app/09-operation/*`
- `app/10-decisions/*`

## App-layer theory map

| Layer | Theory chính | Ghi chú |
| --- | --- | --- |
| `00-context` | `TH-HUBFLOW`, `TH-CANON` | context sản phẩm, canonical vocabulary, system model |
| `01-business` | `TH-HUBFLOW`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE` | business workflows, review, sync safety, recoverability |
| `02-product` | `TH-HUBFLOW`, `TH-CANON`, `TH-AI-GOV`, `TH-SYNC-SAFE` | product behavior và guardrails |
| `03-ui` | thường là application of business/product theory | hiện chưa thấy cần pure theory UI riêng |
| `04-domain` | `TH-CANON`, một phần `TH-MODULAR` | owner state, consistency boundary, canonical/domain mapping |
| `05-architecture` | `TH-MODULAR`, `TH-HUBFLOW`, `TH-CANON`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE` | đây là layer chịu ảnh hưởng nhiều nhất |
| `06-technical` | application của `TH-CANON`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE` | runtime, persistence, queue, AI transport |
| `07-implementation` | application của `TH-MODULAR` và derived rules | code layout, contract, coding rules |
| `08-quality` | `TH-SYNC-SAFE`, `TH-OPS-TRACE`, `TH-MODULAR` | what to verify và why |
| `09-operation` | `TH-OPS-TRACE`, `TH-AI-GOV`, `TH-SYNC-SAFE` | monitoring, retry, audit, review workload |
| `10-decisions` | tất cả theory có thể đi qua đây | decisions là lớp app-specific adoption |

## `TH-MODULAR` vẫn là theory đầu tiên cần làm

Lý do:

- nó đã có draft mạnh nhất trong `docs_native_theory_app/all.md`;
- nó đã có generic source rõ nhất trong `docs/architecture/custom_modular_monolith_theory/*`;
- nó ảnh hưởng trực tiếp đến `05-architecture`, `06-technical`, `07-implementation`;
- nhiều entity trong `app/05-architecture` đã có `theory_basis` kiểu `TH-MOD-*`.

Nói ngắn gọn:

- nếu chưa có `TH-MODULAR`, toàn bộ architecture docs thiếu nền;
- nhưng nếu chỉ có `TH-MODULAR`, toàn app vẫn chưa đủ theory.

## Migrate `custom_modular_monolith_theory` theo meaning-to-layer

Phần này gộp lại tinh thần chính của `custom_modular_monolith.md`.

| File nguồn | Có vào theory không | Đích chính |
| --- | --- | --- |
| `overview.md` | Có một phần | `docs_native_theory_app/theories/modular-architecture/README.md` |
| `theory.md` | Có, phần lớn | `docs_native_theory_app/theories/modular-architecture/theory.md` |
| `knowledge_boundary.md` | Có một phần | `README.md`, `agent.md`, `governance.md` |
| `design_axioms.md` | Chỉ một phần | lõi modular vào theory, phần còn lại sang app docs hoặc theory khác |
| `concepts.md` | Có một phần lớn | `README.md`, `agent.md`, `theory.md` |
| `module_structure.md` | Chỉ phần khái niệm | phần source layout sang `app/07-implementation/*` |
| `boundary_model.md` | Có một phần | phần runtime/tier cụ thể sang `app/05` và `app/06` |
| `data_ownership.md` | Có phần principle | bảng ownership thật sang `app/05` |
| `flow_examples.md` | Không | `app/05-architecture/03-interactions/` hoặc reference |
| `module_design_template.md` | Không | `app/05-architecture/01-structure/` hoặc meta/reference |
| `flow_template.md` | Không | `app/05-architecture/03-interactions/` hoặc meta/reference |
| `evolution.md` | Có, phần lớn | `docs_native_theory_app/theories/modular-architecture/theory.md` |
| `tradeoffs_and_antipatterns.md` | Có, phần lớn | `theory.md` và `agent.md` |
| `implement_rules.md` | Không | `app/07-implementation/08-coding-rules/` |
| `p2_cleanup_plan.md` | Không | work/backlog hoặc `app/07-implementation/06-evolution/` |

## Tại sao `design_axioms.md` phải bị tách

Đây là chỗ dễ trộn nhất.

### Nên giữ trong `TH-MODULAR`

- shared DB không đồng nghĩa shared ownership;
- write ownership nghiêm hơn read ownership;
- module API là boundary, không phải service locator;
- có thể cắt scope giai đoạn đầu, nhưng không cắt nền móng boundary.

### Nên chuyển sang theory khác hoặc app docs

- `System -> Core -> System` nên về `TH-HUBFLOW`;
- `core model không chỉ là cache` nên về `TH-CANON`;
- `AI/business tách lớp` nên về `TH-AI-GOV`;
- `job + journal` nên về `TH-OPS-TRACE`;
- `dry-run trước outbound` nên về `TH-SYNC-SAFE`.

## Những nội dung phải ở app docs, không ở theory

### `app/05-architecture`

Đặt ở đây:

- module map thật;
- public capability và owner API thật;
- boundary instance thật;
- state owner thật;
- data flow thật;
- deployment topology thật;
- cross-cutting rule thật.

### `app/06-technical`

Đặt ở đây:

- persistence mechanism;
- queue/job runtime;
- webhook interface;
- AI transport;
- retry/backoff mechanics;
- config mechanism.

### `app/07-implementation`

Đặt ở đây:

- source layout;
- import rule;
- controller/use case orchestration rule;
- repository/data access rule;
- coding rules;
- self-audit command.

### `app/10-decisions`

Đặt ở đây:

- tại sao repo này chọn CIS;
- tại sao dùng dry-run gate;
- tại sao Translation không sở hữu canonical update;
- tại sao Sync sở hữu job/journal nhưng không sở hữu business state;
- tại sao dùng app duy nhất + worker nội bộ ở giai đoạn đầu.

## Cấu trúc `theories/` nên có sau khi fill

```text
docs_native_theory_app/theories/
├── README.md
├── governance.md
├── modular-architecture/
│   ├── README.md
│   ├── agent.md
│   ├── theory.md
│   └── governance.md
├── hub-mediated-integration/
│   ├── README.md
│   ├── agent.md
│   ├── theory.md
│   └── governance.md
├── canonical-state-governance/
│   ├── README.md
│   ├── agent.md
│   ├── theory.md
│   └── governance.md
├── human-governed-ai-assistance/
│   ├── README.md
│   ├── agent.md
│   ├── theory.md
│   └── governance.md
├── safe-external-synchronization/
│   ├── README.md
│   ├── agent.md
│   ├── theory.md
│   └── governance.md
└── recoverable-operations/
    ├── README.md
    ├── agent.md
    ├── theory.md
    └── governance.md
```

## Root theory index nên nói gì

`docs_native_theory_app/theories/README.md` sau khi fill nên trả lời nhanh:

- app hiện có những theory active nào;
- root governance của theory system nằm ở đâu;
- theory nào là `foundation theory`;
- theory nào là `app-specific operating theory`;
- khi nào cần đọc theory nào;
- layer nào đang bị theory nào chi phối.

Ngoài ra root index nên ref rõ sang `docs_native_theory_app/theories/governance.md` khi câu hỏi là:

- boundary giữa các theory group;
- rule tạo theory group mới;
- rule split theory group;
- rule phân luồng giữa root governance và governance của từng theory group.

## Thứ tự materialization đã chốt

### Wave 1 - dựng nền bắt buộc

1. `TH-MODULAR`
2. `TH-HUBFLOW`
3. `TH-CANON`

Lý do:

- đây là 3 theory định nghĩa app này là gì;
- ảnh hưởng trực tiếp đến `00-context`, `01-business`, `02-product`, `04-domain`, `05-architecture`.

### Wave 2 - dựng guardrail vận hành

4. `TH-AI-GOV`
5. `TH-SYNC-SAFE`
6. `TH-OPS-TRACE`

Lý do:

- đây là 3 theory giải thích app này vận hành an toàn như thế nào;
- ảnh hưởng mạnh đến `01-business`, `02-product`, `06-technical`, `08-quality`, `09-operation`.

### Wave 3 - backfill app docs

Sau khi có 6 theory trên:

1. cập nhật `theory_basis` cho `app/00` đến `app/10`;
2. thêm section `Quan hệ với Theory` vào README từng layer;
3. thêm `concern map` cho các layer quan trọng;
4. loại bỏ phần reasoning dài đang nằm sai chỗ trong app docs nếu cần.

## `05-architecture` trong bức tranh lớn

`05-architecture` không còn là toàn bộ problem.

Nó chỉ là layer nhận ảnh hưởng đậm nhất từ:

- `TH-MODULAR`
- `TH-HUBFLOW`
- `TH-CANON`
- `TH-AI-GOV`
- `TH-SYNC-SAFE`
- `TH-OPS-TRACE`

Do đó:

- `05-architecture` phải có routing sang theory;
- nhưng `fill theory cho toàn bộ app` không được dừng ở `05-architecture`.

## Bằng chứng repo hiện tại thật sự đang dùng những theory này

### Từ docs

- `docs/work/README.md` chốt mô hình `System -> CIS -> System`.
- `docs/architecture/01-direction.md` chốt pattern `custom modular monolith`.
- `docs/work/02-central-issue-store.md` chốt tư duy canonical issue state.
- `docs/architecture/workflows/translation-review.md` chốt AI draft + human review + owner separation.
- `docs/architecture/workflows/jira-dry-run.md` và `cis-to-jira-sync.md` chốt dry-run gate và sync safety.
- `docs/work/06-sync-engine.md` chốt job, journal, retry, traceability.

### Từ code

- `src/modules/*` đang theo domain module.
- có public API thật như `CisApi`, `SyncApi`, `TranslationApi`.
- `src/server.js` khởi động app + worker trong cùng runtime giai đoạn đầu.
- `src/infrastructure/ai/*` giữ transport AI ở technical layer.

## Kết luận cuối

Nếu mục tiêu là `fill theory cho toàn bộ app`, thì kết luận đúng không còn là:

```text
Thiếu mỗi theory cho 05-architecture
```

mà là:

```text
Toàn bộ app đang thiếu một theory system được materialize đúng lớp.
```

`TH-MODULAR` là điểm khởi đầu bắt buộc, nhưng không phải đích cuối.

Đích đúng là:

1. dựng `theory set` cho toàn app;
2. tách dứt khoát `Pure Theory` khỏi `app-specific application`;
3. route lại `app/00` đến `app/10` về đúng theory home;
4. chỉ để app docs giữ phần `application of theory`, không giữ vai trò làm theory thay.
