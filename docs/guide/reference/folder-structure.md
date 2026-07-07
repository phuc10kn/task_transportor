# Folder Structure Chuẩn

File này là bản hướng dẫn đọc và dùng tree chuẩn trong `docs/folder_structure.md`.

`docs/folder_structure.md` giữ raw structure. File này giải thích vì sao từng folder tồn tại, folder đó là concern gì, chứa entity type nào, và khi nào không đặt nội dung vào đó.

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
- Không tự thêm concern mới nếu chưa cập nhật `docs/folder_structure.md` và guide tương ứng.

## Top-Level Docs

| Folder | Vì sao tồn tại | Chứa | Không chứa |
| --- | --- | --- | --- |
| `docs/app/` | Giữ truth cụ thể của Central Sync Hub. | Context, business, product, UI, domain, architecture, technical, implementation, quality, operation, decisions. | Generic explanation của docs system. |
| `docs/guide/` | Giúp người và agent dùng docs system đúng. | Hướng dẫn đọc, viết, trace, folder structure, ví dụ. | Canonical rule mới. |
| `docs/meta/` | Định nghĩa rule/schema/convention canonical của docs system. | Entity type, relation type, valid triple, validation convention. | App-specific truth và handbook hướng dẫn đọc. |
| `docs/theories/` | Giữ reusable reasoning foundation. | Principle, theory, governance, challenge. | Jira/Backlog/module cụ thể. |
| `docs/app_technical/` | Giữ reusable technical taxonomy/template. | Custom modular monolith template. | Source of truth cụ thể nếu `docs/app` đã có. |
| `docs/backlog-theories/` | Giữ candidate chưa đủ chín. | Review note, unpromoted idea, provenance tạm. | Rule đang có hiệu lực. |
| `docs/AGENT_SKILLS/` | Giữ checklist/skill cho agent. | Reading strategy, operating checklist. | Human-facing full manual. |
| `docs/plans/` | Giữ migration plan và provenance. | Migration matrix, phase notes. | Canonical product truth hiện tại. |

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

## 03-ui

Layer này trả lời: người dùng nhìn thấy, hiểu và thao tác với product như thế nào.

| Path | Concern | Vì sao có folder này | Entity type chuẩn | Không đặt ở đây |
| --- | --- | --- | --- | --- |
| `03-ui/01-audience/` | Audience | Ghi kiểu người dùng và nhu cầu UI. | `personas/` | Business stakeholder đầy đủ. |
| `03-ui/02-experience/` | Experience | Ghi journey và user flow. | `01-journeys/`, `02-user-flows/` | Business process, architecture interaction. |
| `03-ui/03-structure/` | Structure | Ghi navigation và screen. | `01-navigation/`, `02-screens/` | Product requirement. |
| `03-ui/04-composition/` | Composition | Ghi component/form có knowledge value. | `01-components/`, `02-forms/` | Source component tree chi tiết. |
| `03-ui/05-interaction/` | Interaction | Ghi interaction và UI state người dùng thấy. | `01-interactions/`, `02-ui-states/` | Domain lifecycle nội bộ. |
| `03-ui/06-quality/` | UI Quality | Ghi quality riêng của UI experience. | `accessibility/` | Product-wide quality gate. |
| `03-ui/07-system/` | UI System | Giữ design system và consistency rule. | `design-systems/` | Global docs convention. |

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
| `06-technical/03-persistence/` | Persistence | Ghi database, migration, storage mechanism. | Domain model meaning. |
| `06-technical/04-communication/` | Communication | Ghi HTTP, webhook, queue, external protocol. | Business interaction. |
| `06-technical/05-security/` | Security | Ghi auth, credential, secret, security control. | Real secret value. |
| `06-technical/06-execution/` | Execution | Ghi worker/job/scheduler execution mechanism. | Operation incident response. |
| `06-technical/07-configuration/` | Configuration | Ghi env var, config key, feature flag. | Deployment-specific secret. |
| `06-technical/08-performance/` | Performance | Ghi timeout, limit, resource budget. | Business KPI. |

## 07-implementation

Layer này trả lời: technical/architecture được hiện thực trong source code như thế nào.

| Path | Concern | Vì sao có folder này | Không đặt ở đây |
| --- | --- | --- | --- |
| `07-implementation/01-organization/` | Organization | Ghi source layout, module folder, entrypoint. | Architecture rationale dài. |
| `07-implementation/02-contracts/` | Contracts | Ghi public API/interface ở code level. | Product API contract cho user. |
| `07-implementation/03-behavior/` | Behavior | Ghi use case implementation và handler/service. | Business process nguyên thủy. |
| `07-implementation/04-data-access/` | Data Access | Ghi repository/query/transaction/mapping. | Domain meaning. |
| `07-implementation/05-integration/` | Integration | Ghi client/adapter/webhook handler. | External ecosystem overview. |
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
| `09-operation/01-runtime/` | Runtime | Ghi runtime env, dependency, topology thực tế. | Context environment meaning. |
| `09-operation/02-deployment/` | Deployment | Ghi deploy/release/migration runbook. | Architecture deployment unit abstract. |
| `09-operation/03-observability/` | Observability | Ghi dashboard, log, metric, alert. | Product dashboard requirement. |
| `09-operation/04-reliability/` | Reliability | Ghi availability, retry, failover. | Quality objective abstract nếu chưa vận hành. |
| `09-operation/05-incidents/` | Incidents | Ghi incident response/history. | Defect list thuần quality. |
| `09-operation/06-recovery/` | Recovery | Ghi backup/restore/disaster recovery. | Technical persistence design. |
| `09-operation/07-capacity/` | Capacity | Ghi resource, load, scale note. | Product traffic assumption nếu chưa observed. |
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
