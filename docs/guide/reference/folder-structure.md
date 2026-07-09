# Folder Structure Chuẩn

File này là home canonical cho folder structure chuẩn của docs.

Không duy trì thêm `docs/folder_structure.md` ở root. Folder structure chuẩn và phần giải thích cách dùng đều nằm trong file này để tránh hai nguồn truth song song.

## Nguyên Tắc Chung

App docs dùng mô hình:

```text
Layer
  -> Concern folder
     -> Entity Type folder
        -> Entity Instance folder/file
```

Ví dụ:

```text
docs/app/01-business/04-behavior/01-processes/PROC-001-backlog-ingest/README.md
```

Trong đó:

| Cấp | Ý nghĩa |
| --- | --- |
| `01-business` | Layer: vùng câu hỏi lớn của app docs. |
| `04-behavior` | Concern: nhóm câu hỏi ổn định trong layer. |
| `01-processes` | Entity type folder: loại knowledge cụ thể. |
| `PROC-001-backlog-ingest` | Entity instance: một knowledge item của app. |

## Vì Sao Folder Có Prefix Số

Prefix số giữ thứ tự đọc ổn định, không biến folder thành pipeline bắt buộc.

Ví dụ `01-business/04-behavior` không có nghĩa behavior chỉ xuất hiện sau organization trong thực tế. Nó chỉ nói rằng khi đọc business layer, behavior thường dễ hiểu hơn sau discovery, direction và organization.

Luật:

- README layer và guide phải dùng đúng path có prefix, ví dụ `01-overview/`, không viết rút gọn `overview/`.
- Khi nói meaning chung, dùng tên concern không prefix được; khi nói path, dùng path có prefix.
- Không tự thêm concern mới nếu chưa cập nhật file này và guide/workflow liên quan.

## Top-Level Docs

| Folder | Vì sao tồn tại | Chứa | Không chứa |
| --- | --- | --- | --- |
| `docs/app/` | Giữ truth cụ thể của Central Sync Hub. | Context, business, product, interface, domain, architecture, technical, implementation, quality, operation, decisions. | Generic explanation của docs system. |
| `docs/guide/` | Giúp người và agent dùng docs system đúng. | Hướng dẫn đọc, viết, trace, folder structure, unit template, ví dụ. | Canonical rule mới. |
| `docs/meta/` | Định nghĩa rule/schema/convention canonical của docs system. | Schema contract, entity type, relation type, valid triple, validation convention. | App-specific truth và handbook hướng dẫn đọc. |
| `docs/theories/` | Giữ reusable reasoning foundation. | Principle, theory, governance, challenge. | Jira/Backlog/module cụ thể. |
| `docs/app_variants/` | Giữ universal app origin và pattern extension reusable. | `raw_app_original` và pattern template như `custom_modular_monolith`. | Source of truth cụ thể nếu `docs/app` đã có. |
| `docs/workbench/` | Giữ chỗ cho candidate entity/relation workbench. | Status và harness nháp. | Source of truth, app truth, meta rule; hiện chưa được đi vào hoạt động. |
| `docs/AGENT_SKILLS/` | Giữ checklist/skill cho agent. | Reading strategy, operating checklist. | Human-facing full manual. |

## 00-context

Layer này trả lời: app tồn tại trong bối cảnh nào, phạm vi nền là gì, giả định nào đang được dùng.

| Path | Concern | Vì sao có folder này | Entity type chuẩn | Không đặt ở đây |
| --- | --- | --- | --- | --- |
| `00-context/01-overview/` | Overview | Cho người đọc biết app là gì trước khi đi vào chi tiết. | `applications/` | Business process, feature, architecture overview chi tiết. |
| `00-context/02-scope/` | Scope | Giữ ranh giới in/out scope để tránh mở rộng âm thầm. | `scopes/` | Product requirement chi tiết, release implementation plan. |
| `00-context/03-premises/` | Premises | Giữ điều project đang giả định và giới hạn phải tuân thủ. | `01-assumptions/`, `02-constraints/` | Business rule, technical config. |
| `00-context/04-language/` | Language | Giữ meaning chung và thuật ngữ canonical. | `glossary-terms/` | Domain invariant hoặc UI label cụ thể. |
| `00-context/05-ecosystem/` | Ecosystem | Ghi hệ thống/tổ chức bên ngoài có quan hệ với app. | `external-systems/` | Integration protocol, adapter implementation. |
| `00-context/06-environment/` | Environment | Ghi environment có ý nghĩa ở mức context. | `environments/` | Runtime instance, deployment runbook. |

## 01-business

Layer này trả lời: business đang gặp vấn đề gì, muốn đạt kết quả gì, ai tham gia, vận hành thế nào.

| Path | Concern | Vì sao có folder này | Entity type chuẩn | Không đặt ở đây |
| --- | --- | --- | --- | --- |
| `01-business/01-discovery/` | Discovery | Tách problem/opportunity khỏi solution. | `problems/` | Feature request viết trá hình. |
| `01-business/02-direction/` | Direction | Giữ goal/outcome để product trace về why. | `goals/` | UI screen, technical target. |
| `01-business/03-organization/` | Organization | Ghi stakeholder và trách nhiệm business. | `stakeholders/` | Auth role implementation. |
| `01-business/04-behavior/` | Behavior | Mô tả business vận hành bằng process/scenario. | `01-processes/`, `02-scenarios/` | API flow, worker flow, UI flow. |
| `01-business/05-governance/` | Governance | Giữ rule/policy/constraint chi phối business. | `01-business-rules/`, `02-policies/`, `03-business-constraints/` | Validation code, database constraint. |
| `01-business/06-measurement/` | Measurement | Ghi metric và success criteria. | `01-metrics/`, `02-success-criteria/` | Test case chi tiết. |

## 02-product

Layer này trả lời: product phải cung cấp gì để phục vụ business.

| Path | Concern | Vì sao có folder này | Entity type chuẩn | Không đặt ở đây |
| --- | --- | --- | --- | --- |
| `02-product/01-needs/` | Needs | Chuyển business problem/goal thành nhu cầu product. | `business-requirements/` | Business process gốc. |
| `02-product/02-capabilities/` | Capabilities | Giữ khả năng bền vững của product. | `capabilities/` | Một task implementation nhỏ. |
| `02-product/03-behavior/` | Behavior | Mô tả product use case và phản hồi ở mức product. | `use-cases/` | UI click path, controller logic. |
| `02-product/04-delivery/` | Delivery | Gom giá trị được giao theo feature/release. | `01-features/`, `02-releases/` | Source code plan chi tiết. |
| `02-product/05-specification/` | Specification | Giữ requirement có thể kiểm chứng. | `01-functional-requirements/`, `02-non-functional-requirements/` | Architecture mechanism. |
| `02-product/06-acceptance/` | Acceptance | Ghi điều kiện product được chấp nhận. | `acceptance-criteria/` | Automated test implementation. |

## 03-interface

Layer này trả lời: người dùng hoặc operator chạm vào product qua touchpoint nào.

| Path | Concern | Vì sao có folder này | Entity type chuẩn | Không đặt ở đây |
| --- | --- | --- | --- | --- |
| `03-interface/01-audience/` | Audience | Ghi kiểu người hoặc actor chạm vào interface. | `personas/` | Business stakeholder đầy đủ. |
| `03-interface/02-experience/` | Experience | Ghi journey và flow tại touchpoint. | `01-journeys/`, `02-user-flows/` | Business process, architecture interaction. |
| `03-interface/03-structure/` | Structure | Ghi navigation, screen hoặc entry structure của touchpoint. | `01-navigation/`, `02-screens/` | Product requirement. |
| `03-interface/04-composition/` | Composition | Ghi component/form có knowledge value. | `01-components/`, `02-forms/` | Source component tree chi tiết. |
| `03-interface/05-interaction/` | Interaction | Ghi interaction và visible state tại interface. | `01-interactions/`, `02-ui-states/` | Domain lifecycle nội bộ. |
| `03-interface/06-quality/` | Interface Quality | Ghi quality riêng của experience tại touchpoint. | `accessibility/` | Product-wide quality gate. |
| `03-interface/07-system/` | Interface System | Giữ design system và consistency rule của touchpoint. | `design-systems/` | Global docs convention. |

## 04-domain

Layer này trả lời: meaning, rule và lifecycle nội bộ của domain là gì.

| Path | Concern | Vì sao có folder này | Entity type chuẩn | Không đặt ở đây |
| --- | --- | --- | --- | --- |
| `04-domain/01-language/` | Domain Language | Ghi khái niệm domain và ubiquitous language. | `domain-concepts/` | Glossary chung toàn app. |
| `04-domain/02-model/` | Model | Ghi model khái niệm của domain. | `01-entities/`, `02-value-objects/`, `03-aggregates/` | Database table, API schema. |
| `04-domain/03-rules/` | Rules | Ghi invariant và policy domain. | `01-invariants/`, `02-domain-policies/` | Business policy rộng, code validation. |
| `04-domain/04-behavior/` | Behavior | Ghi behavior/event có meaning domain. | `01-domain-services/`, `02-domain-events/` | Worker job flow. |
| `04-domain/05-lifecycle/` | Lifecycle | Ghi state và lifecycle của domain object. | `lifecycles/` | Operation incident lifecycle. |

## 05-architecture

Layer này trả lời: hệ thống được tổ chức bằng boundary, module, state owner và interaction nào.

> **NOTE:** Concern folder và cột *Entity type chuẩn* là canonical structure hiện tại. Map đọc: [entity-maps/05-architecture.md](entity-maps/05-architecture.md). Việc registry `04`/`05` có cần tách neutral pack và methodology pack hay không vẫn là quyết định chưa chốt.

| Path | Concern | Vì sao có folder này | Không đặt ở đây |
| --- | --- | --- | --- |
| `05-architecture/01-structure/` | Structure | Ghi module/component architecture và vai trò owner. | Source file layout chi tiết. |
| `05-architecture/02-boundaries/` | Boundaries | Ghi ownership, public API, read/write rule. | Business rule hoặc coding style thuần. |
| `05-architecture/03-interactions/` | Interactions | Ghi architecture flow giữa modules/systems. | UI flow, business process. |
| `05-architecture/04-state/` | State | Ghi state owner và state lifecycle ở mức architecture. | Database schema chi tiết. |
| `05-architecture/05-data/` | Data | Ghi data flow và ownership giữa parts. | Field-level implementation mapping dài. |
| `05-architecture/06-deployment/` | Deployment | Ghi deployment unit/topology ở mức architecture. | Runbook thao tác production. |
| `05-architecture/07-cross-cutting/` | Cross-cutting | Ghi architecture rule áp dụng nhiều module. | Generic theory không gắn app. |

## 06-technical

Layer này trả lời: mechanism kỹ thuật nào được dùng để hiện thực architecture.

| Path | Concern | Vì sao có folder này | Không đặt ở đây |
| --- | --- | --- | --- |
| `06-technical/01-platforms/` | Platforms | Ghi runtime, framework, database, tool nền. | Module ownership. |
| `06-technical/02-interfaces/` | Interfaces | Ghi API/protocol/schema contract. | Controller code. |
| `06-technical/03-state-and-storage/` | State And Storage | Ghi database, cache, queue state, file/storage mechanism. | Domain model meaning. |
| `06-technical/04-exchange/` | Exchange | Ghi HTTP, webhook, queue, file hoặc protocol exchange. | Business interaction. |
| `06-technical/05-security/` | Security | Ghi auth, credential, secret, security control. | Real secret value. |
| `06-technical/06-processing/` | Processing | Ghi worker/job/scheduler hoặc processing mechanism. | Operation incident response. |
| `06-technical/07-configuration/` | Configuration | Ghi env var, config key, feature flag. | Deployment-specific secret. |
| `06-technical/08-performance/` | Performance | Ghi timeout, limit, resource budget. | Business KPI. |

## 07-implementation

Layer này trả lời: technical/architecture được hiện thực trong source code như thế nào.

| Path | Concern | Vì sao có folder này | Không đặt ở đây |
| --- | --- | --- | --- |
| `07-implementation/01-organization/` | Organization | Ghi source layout, module folder, entrypoint. | Architecture rationale dài. |
| `07-implementation/02-contracts/` | Contracts | Ghi public API/interface ở code level. | Product API contract cho user. |
| `07-implementation/03-behavior/` | Behavior | Ghi use case implementation và handler/service. | Business process nguyên thủy. |
| `07-implementation/04-data-handling/` | Data Handling | Ghi repository/query/transaction/mapping hoặc reader/writer handling. | Domain meaning. |
| `07-implementation/05-external-boundaries/` | External Boundaries | Ghi client/adapter/webhook handler và external code boundary. | External ecosystem overview. |
| `07-implementation/06-evolution/` | Evolution | Ghi migration/refactor/compatibility. | Decision rationale cross-layer. |
| `07-implementation/07-automation/` | Automation | Ghi codegen và AI coding rule. | Generic agent skill. |
| `07-implementation/08-coding-rules/` | Coding Rules | Ghi import, style, review rule của code. | Documentation meta rule. |

## 08-quality

Layer này trả lời: chất lượng được định nghĩa, kiểm tra và giữ bằng gì.

| Path | Concern | Vì sao có folder này | Không đặt ở đây |
| --- | --- | --- | --- |
| `08-quality/01-objectives/` | Objectives | Ghi quality objective và attribute. | Product feature scope. |
| `08-quality/02-verification/` | Verification | Ghi automated check/test strategy. | Manual acceptance prose dài. |
| `08-quality/03-validation/` | Validation | Ghi acceptance/usability/scenario validation. | Unit test implementation. |
| `08-quality/04-assurance/` | Assurance | Ghi review, audit, quality gate. | Business policy. |
| `08-quality/05-risks/` | Risks | Ghi quality risk và mitigation. | Incident record cụ thể. |
| `08-quality/06-defects/` | Defects | Ghi known issue/regression. | Feature backlog thông thường. |
| `08-quality/07-maintainability/` | Maintainability | Ghi debt và health. | Code refactor diff. |
| `08-quality/08-release-readiness/` | Release Readiness | Ghi go/no-go và release gate. | Deployment runbook chi tiết. |

## 09-operation

Layer này trả lời: hệ thống được chạy, quan sát, duy trì và phục hồi thế nào.

| Path | Concern | Vì sao có folder này | Không đặt ở đây |
| --- | --- | --- | --- |
| `09-operation/01-operating-context/` | Operating Context | Ghi runtime env, dependency, topology hoặc operating context thực tế. | Context environment meaning. |
| `09-operation/02-release-and-change/` | Release And Change | Ghi deploy/release/migration/change runbook. | Architecture deployment unit abstract. |
| `09-operation/03-signals/` | Signals | Ghi dashboard, log, metric, alert hoặc signal evidence khác. | Product dashboard requirement. |
| `09-operation/04-reliability/` | Reliability | Ghi availability, retry, failover. | Quality objective abstract nếu chưa vận hành. |
| `09-operation/05-operational-events/` | Operational Events | Ghi incident, failed run hoặc operational event history. | Defect list thuần quality. |
| `09-operation/06-continuity/` | Continuity | Ghi backup/restore/disaster recovery hoặc replay/reprocess plan. | Technical persistence design. |
| `09-operation/07-resources/` | Resources | Ghi resource, load, scale, quota hoặc cost note. | Product traffic assumption nếu chưa observed. |
| `09-operation/08-maintenance/` | Maintenance | Ghi patch, data cleanup, scheduled maintenance. | Implementation refactor plan. |

## 10-decisions

Layer này trả lời: project đã chọn gì, tại sao, phương án nào bị loại, và quyết định nào đã bị thay thế.

| Path | Concern | Vì sao có folder này | Entity type chuẩn | Không đặt ở đây |
| --- | --- | --- | --- | --- |
| `10-decisions/01-decision-making/` | Decision Making | Giữ decision hiện hành và alternative đã cân nhắc. | `01-decisions/`, `02-alternatives/` | Meeting note, Git history. |
| `10-decisions/02-lifecycle/` | Decision Lifecycle | Giữ decision không còn hiệu lực nhưng cần lịch sử. | `superseded/` | Rule đang active. |

## Khi Thêm Nội Dung Mới

1. Xác định layer bằng câu hỏi chính.
2. Xác định concern bằng bảng trong file này.
3. Xác định entity type folder chuẩn.
4. Nếu entity type chưa tồn tại trong structure, không tự thêm vội; mở `NOTE-OPEN` hoặc đề xuất cập nhật structure.
5. Nếu nội dung là app truth, đặt trong `docs/app`.
6. Nếu nội dung là cách dùng docs, đặt trong `docs/guide`.
7. Nếu nội dung là rule/schema/convention canonical, đặt trong `docs/meta`.

## Anti-Patterns

- Viết `overview/` khi path chuẩn là `01-overview/`.
- Đẩy app truth vào `docs/guide` chỉ vì muốn layer README ngắn.
- Đẩy hướng dẫn sử dụng docs vào `docs/meta`.
- Tạo folder concern mới vì một note chưa biết đặt ở đâu.
- Dùng layer README để dạy lại toàn bộ folder structure chuẩn.
