# Folder Structure — Universal Baseline

File này là canonical **chỉ** cho universal baseline `Layer -> Concern` của guide. Nó không sở hữu entity-type taxonomy, relation contract, app truth hoặc cấu trúc local cụ thể của project.

Universal pack là source reusable; file này là route/reference chuẩn để người và agent dùng cùng path layer/concern có prefix số.

## Phạm Vi

File này giữ:

- layer `00` đến `10`;
- concern universal và path có prefix số;
- câu hỏi mà từng concern trả lời.

File này không giữ:

- entity type folder hoặc entity instance của project;
- vocabulary phụ thuộc methodology, như DDD tactical hoặc modular-monolith type;
- concern hoặc local structure chỉ có nghĩa trong một project;
- decision, evidence, migration hoặc lifecycle của project.

## Mô Hình Chung

```text
Layer
  -> Concern universal
     -> entity type / entity instance do project quản lý local
```

Ví dụ baseline:

```text
docs/app/01-business/04-behavior/
```

Entity type folder và path instance bên dưới concern lấy từ contract active trong `docs/meta/` hoặc cấu trúc local đã được project chốt, không suy ra từ file này.

## Luật Prefix Số

Prefix số giữ thứ tự đọc ổn định, không biến folder thành pipeline bắt buộc.

- Khi nói path universal, dùng prefix đầy đủ, ví dụ `01-business/04-behavior/`.
- Khi nói meaning chung, có thể dùng tên concern không prefix.
- Không tự thêm concern local vào file này.

## Top-Level Docs

| Folder | Vai trò | Không chứa |
| --- | --- | --- |
| `docs/app/` | App truth và entity instance của từng project. | Generic explanation của docs system. |
| `docs/guide/` | Manual, universal baseline, reusable pack và example. | Contract active hoặc app truth của project. |
| `docs/meta/` | Schema, entity type, relation type, valid triple và convention active của project. | App-specific truth và handbook dài. |
| `docs/theories/` | Reasoning foundation mà project đã áp dụng. | App/implementation detail cụ thể. |
| `docs/guide/reference/entity-maps/packs/` | Stable reusable universal/methodology source. | Local lifecycle, project evidence hoặc active contract. |
| `docs/workbench/` | Optional local workspace; chỉ dùng theo policy local của project. | Source of truth active. |
| `docs/AGENT_SKILLS/` | Procedure/checklist active của agent trong project. | Human-facing full manual. |

## Universal Layer Và Concern Baseline

### 00-context

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `00-context/01-overview/` | Overview | Project là gì trước khi đi vào chi tiết? |
| `00-context/02-scope/` | Scope | Ranh giới nền nào đang được giả định? |
| `00-context/03-premises/` | Premises | Assumption và constraint nền là gì? |
| `00-context/04-language/` | Language | Thuật ngữ chung nào cần nhất quán? |
| `00-context/05-ecosystem/` | Ecosystem | Hệ thống/tổ chức bên ngoài nào có quan hệ với project? |
| `00-context/06-environment/` | Environment | Environment nào có nghĩa ở mức context? |

### 01-business

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `01-business/01-discovery/` | Discovery | Problem/opportunity nào cần được hiểu trước solution? |
| `01-business/02-direction/` | Direction | Goal/outcome nào định hướng product? |
| `01-business/03-organization/` | Organization | Stakeholder và trách nhiệm business là gì? |
| `01-business/04-behavior/` | Behavior | Business vận hành qua process/scenario nào? |
| `01-business/05-governance/` | Governance | Rule/policy/constraint nào chi phối business? |
| `01-business/06-measurement/` | Measurement | Metric/success criteria nào đánh giá kết quả? |

### 02-product

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `02-product/01-needs/` | Needs | Business need nào cần product đáp ứng? |
| `02-product/02-capabilities/` | Capabilities | Product cần có khả năng bền vững nào? |
| `02-product/03-behavior/` | Behavior | Product use case/response nào cần tồn tại? |
| `02-product/04-delivery/` | Delivery | Giá trị nào được giao qua feature/release? |
| `02-product/05-specification/` | Specification | Requirement kiểm chứng được là gì? |
| `02-product/06-acceptance/` | Acceptance | Điều kiện nào cho thấy product được chấp nhận? |

### 03-interface

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `03-interface/01-audience/` | Audience | Ai chạm vào interface? |
| `03-interface/02-experience/` | Experience | Journey/flow tại touchpoint là gì? |
| `03-interface/03-structure/` | Structure | Navigation/screen/entry structure là gì? |
| `03-interface/04-composition/` | Composition | Component/form có knowledge value nào tồn tại? |
| `03-interface/05-interaction/` | Interaction | Interaction và visible state nào cần được hiểu? |
| `03-interface/06-quality/` | Interface Quality | Quality riêng của experience là gì? |
| `03-interface/07-system/` | Interface System | Consistency/design-system concern nào cần giữ? |

### 04-domain

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `04-domain/01-language/` | Domain Language | Vocabulary canonical trong domain là gì? |
| `04-domain/02-model/` | Model | Conceptual model nào giải thích problem space? |
| `04-domain/03-rules/` | Rules | Invariant/policy domain nào chi phối meaning? |
| `04-domain/04-behavior/` | Behavior | Behavior có meaning domain nào xảy ra? |
| `04-domain/05-lifecycle/` | Lifecycle | State/lifecycle domain nào cần được hiểu? |

Type vocabulary của DDD tactical thuộc [DDD pack](entity-maps/packs/variants/ddd/README.md), không thuộc universal baseline này.

### 05-architecture

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `05-architecture/01-structure/` | Structure | Architectural unit chính và responsibility là gì? |
| `05-architecture/02-boundaries/` | Boundaries | Ownership/dependency/trust boundary nằm ở đâu? |
| `05-architecture/03-interactions/` | Interactions | Unit tương tác theo flow nào? |
| `05-architecture/04-state/` | State | State nào tồn tại và ai sở hữu? |
| `05-architecture/05-data/` | Data | Data ownership/flow/canonical data được tổ chức ra sao? |
| `05-architecture/06-deployment/` | Deployment | Deployment topology ở mức architecture là gì? |
| `05-architecture/07-cross-cutting/` | Cross-cutting | Concern/rule nào tác động nhiều unit? |

Type vocabulary modular monolith thuộc [modular-monolith pack](entity-maps/packs/variants/modular-monolith/README.md), không thuộc universal baseline này.

### 06-technical

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `06-technical/01-platforms/` | Platforms | Runtime/framework/platform nào được chọn? |
| `06-technical/02-interfaces/` | Interfaces | API/protocol/schema contract nào được expose/consume? |
| `06-technical/03-state-and-storage/` | State And Storage | State/storage mechanism nào được dùng? |
| `06-technical/04-exchange/` | Exchange | Technical exchange diễn ra ra sao? |
| `06-technical/05-security/` | Security | Technical security control nào tồn tại? |
| `06-technical/06-processing/` | Processing | Worker/job/scheduler/pipeline mechanism nào được dùng? |
| `06-technical/07-configuration/` | Configuration | Runtime behavior được cấu hình thế nào? |
| `06-technical/08-performance/` | Performance | Limit/resource/performance mechanism nào được đặt? |

### 07-implementation

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `07-implementation/01-organization/` | Organization | Source/package/module được tổ chức thế nào? |
| `07-implementation/02-contracts/` | Contracts | Public/internal code-level contract là gì? |
| `07-implementation/03-behavior/` | Behavior | Behavior được hiện thực trong code ra sao? |
| `07-implementation/04-data-handling/` | Data Handling | Code đọc/ghi/map/transform data thế nào? |
| `07-implementation/05-external-boundaries/` | External Boundaries | Code đi qua external boundary ra sao? |
| `07-implementation/06-evolution/` | Evolution | Migration/compatibility/refactor được tổ chức thế nào? |
| `07-implementation/07-automation/` | Automation | Automation/codegen/AI-assisted coding concern nằm ở đâu? |
| `07-implementation/08-coding-rules/` | Coding Rules | Code rule/review rule nào áp dụng? |

### 08-quality

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `08-quality/01-objectives/` | Objectives | Quality attribute/target nào quan trọng? |
| `08-quality/02-verification/` | Verification | Check nào xác nhận hệ thống được xây đúng? |
| `08-quality/03-validation/` | Validation | Check nào xác nhận hệ thống giải quyết đúng nhu cầu? |
| `08-quality/04-assurance/` | Assurance | Review/audit/gate nào giữ chất lượng? |
| `08-quality/05-risks/` | Risks | Quality risk/mitigation nào tồn tại? |
| `08-quality/06-defects/` | Defects | Known issue/regression/defect được quản lý ra sao? |
| `08-quality/07-maintainability/` | Maintainability | Debt/health/upkeep concern là gì? |
| `08-quality/08-release-readiness/` | Release Readiness | Go/no-go/readiness evidence nào cần có? |

### 09-operation

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `09-operation/01-operating-context/` | Operating Context | Runtime context/thực tế vận hành là gì? |
| `09-operation/02-release-and-change/` | Release And Change | Deploy/release/change được thực hiện thế nào? |
| `09-operation/03-signals/` | Signals | Metric/log/trace/audit signal nào cần theo dõi? |
| `09-operation/04-reliability/` | Reliability | Retry/failover/SLO guardrail nào tồn tại? |
| `09-operation/05-operational-events/` | Operational Events | Incident/failed run/support event được xử lý ra sao? |
| `09-operation/06-continuity/` | Continuity | Backup/restore/rollback/replay được vận hành thế nào? |
| `09-operation/07-resources/` | Resources | Capacity/quota/cost/resource constraint nào được theo dõi? |
| `09-operation/08-maintenance/` | Maintenance | Patch/cleanup/maintenance được thực hiện thế nào? |

### 10-decisions

| Path | Concern | Câu hỏi |
| --- | --- | --- |
| `10-decisions/01-decision-making/` | Decision Making | Đã chọn gì, vì sao và alternative nào bị loại? |
| `10-decisions/02-lifecycle/` | Decision History | Decision history nào cần được giữ để đọc lại? |

## Khi Thêm Nội Dung Mới

1. Xác định nội dung là reusable source hay local project knowledge.
2. Nếu là universal layer/concern, dùng path trong file này.
3. Nếu vocabulary type/relation phụ thuộc methodology, route sang methodology pack; không thêm vào universal baseline.
4. Nếu concern chỉ có nghĩa trong một project, không thêm vào file này. Ghi/adapt trong decision và cấu trúc local đã được project chốt tại `docs/meta`/`docs/app` phù hợp.
5. Entity type, relation slot, relation type và valid triple active luôn lấy từ `docs/meta` local.
6. App truth nằm ở `docs/app`; theory active nằm ở `docs/theories`; procedure active nằm ở `docs/AGENT_SKILLS`.

## Anti-Patterns

- Đẩy type DDD/modular-monolith vào universal baseline.
- Dùng folder structure này làm registry entity type active của project.
- Thêm concern local vào guide chỉ vì chưa biết đặt note ở đâu.
- Đẩy app truth vào guide để làm README layer ngắn hơn.
- Tạo path rút gọn như `overview/` khi đang nói universal concern path `01-overview/`.
