# Layer Routing

Bảng tra nhanh: task → layer → concern → entity type folder.

Path gốc: `docs/app/`

---

## 00-context/

| Concern | Câu hỏi | Entity type folders |
|---------|---------|---------------------|
| `01-overview/` | Ứng dụng là gì? | `applications/` |
| `02-scope/` | Phạm vi? | `scopes/` |
| `03-premises/` | Premise, constraint? | `01-assumptions/`, `02-constraints/` |
| `04-language/` | Thuật ngữ? | `glossary-terms/` |
| `05-ecosystem/` | Hệ sinh thái? | `external-systems/` |
| `06-environment/` | Environment? | `environments/` |

---

## 01-business/

| Concern | Câu hỏi | Entity type folders |
|---------|---------|---------------------|
| `01-discovery/` | Vấn đề business? | `problems/` |
| `02-direction/` | Mục tiêu? | `goals/` |
| `03-organization/` | Stakeholder? | `stakeholders/` |
| `04-behavior/` | Process, scenario? | `01-processes/`, `02-scenarios/` |
| `05-governance/` | Rule, policy? | `01-business-rules/`, `02-policies/`, `03-business-constraints/` |
| `06-measurement/` | Metric, success? | `01-metrics/`, `02-success-criteria/` |

---

## 02-product/

| Concern | Entity type folders |
|---------|---------------------|
| `01-needs/` | `business-requirements/` |
| `02-capabilities/` | `capabilities/` |
| `03-behavior/` | `use-cases/` |
| `04-delivery/` | `01-features/`, `02-releases/` |
| `05-specification/` | `01-functional-requirements/`, `02-non-functional-requirements/` |
| `06-acceptance/` | `acceptance-criteria/` |

---

## 03-ui/

| Concern | Entity type folders |
|---------|---------------------|
| `01-audience/` | `personas/` |
| `02-experience/` | `01-journeys/`, `02-user-flows/` |
| `03-structure/` | `01-navigation/`, `02-screens/` |
| `04-composition/` | `01-components/`, `02-forms/` |
| `05-interaction/` | `01-interactions/`, `02-ui-states/` |
| `06-quality/` | `accessibility/` |
| `07-system/` | `design-systems/` |

---

## 04-domain/

| Concern | Entity type folders |
|---------|---------------------|
| `01-language/` | `domain-concepts/` |
| `02-model/` | `01-entities/`, `02-value-objects/`, `03-aggregates/` |
| `03-rules/` | `01-invariants/`, `02-domain-policies/` |
| `04-behavior/` | `01-domain-services/`, `02-domain-events/` |
| `05-lifecycle/` | `lifecycles/` |

---

## 05-architecture/

| Concern | Typical entity types |
|---------|---------------------|
| `01-structure/` | modules |
| `02-boundaries/` | boundaries, contexts |
| `03-interactions/` | interactions, contracts |
| `04-state/` | state ownership |
| `05-data/` | data flows |
| `06-deployment/` | deployment units |
| `07-cross-cutting/` | cross-cutting concerns |

---

## 06-technical/

| Concern | Topics |
|---------|--------|
| `01-platforms/` | runtime, cloud |
| `02-interfaces/` | API, events |
| `03-persistence/` | DB, storage |
| `04-communication/` | messaging |
| `05-security/` | auth, encryption |
| `06-execution/` | jobs, workers |
| `07-configuration/` | config management |
| `08-performance/` | SLAs, limits |

---

## 07-implementation/

| Concern | Topics |
|---------|--------|
| `01-organization/` | packages, modules |
| `02-contracts/` | public APIs |
| `03-behavior/` | implementation patterns |
| `04-data-access/` | repositories |
| `05-integration/` | adapters |
| `06-evolution/` | migrations |
| `07-automation/` | CI, scripts |
| `08-coding-rules/` | style, conventions |

---

## 08-quality/

| Concern | Entity types |
|---------|--------------|
| `05-risks/` | risks |
| `06-defects/` | defects |
| `02-verification/` | test strategy |
| `08-release-readiness/` | release gates |

---

## 09-operation/

| Concern | Entity types |
|---------|--------------|
| `05-incidents/` | incidents |
| `03-observability/` | metrics, logs |
| `06-recovery/` | runbooks |

---

## 10-decisions/

| Concern | Entity type folders |
|---------|---------------------|
| `01-decision-making/01-decisions/` | `decisions/` |
| `01-decision-making/02-alternatives/` | `alternatives/` |
| `02-lifecycle/superseded/` | `superseded/` |

---

## Task → layer quick map

| Task keywords | Layer |
|---------------|-------|
| problem, stakeholder, process | `01-business/` |
| feature, requirement, release | `02-product/` |
| screen, UX, flow, persona | `03-ui/` |
| aggregate, invariant, domain event | `04-domain/` |
| module, boundary, deployment | `05-architecture/` |
| API, database, security | `06-technical/` |
| code structure, repository | `07-implementation/` |
| test, risk, defect | `08-quality/` |
| incident, observability, capacity | `09-operation/` |
| ADR, why we chose | `10-decisions/` |
| scope, glossary, environment | `00-context/` |

---

## Placement ambiguity

Khi không chắc layer:

1. Đọc câu hỏi concern trong layer README
2. Nếu vẫn ambiguous → NOTE-OPEN trong draft
3. Không đoán — dùng meta-validate sau khi chọn candidate
