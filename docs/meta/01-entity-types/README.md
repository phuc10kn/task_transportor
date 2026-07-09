# Entity Types

Canonical definitions cho Entity Types trong `docs/app/`; hiện registry này cover các layer `00-context` đến `05-architecture` đã được promote vào meta.

Schema canonical cho mỗi file entity type definition nằm ở:

```text
docs/meta/00-schemas/entity-type-definition.md
docs/meta/00-schemas/structure-extends.md
```

## Cấu trúc

Folder mirror `docs/app/` — mỗi Entity Type = một file `.md`:

```text
docs/meta/01-entity-types/
└── <NN-layer>/
    └── <concern>/
        └── [<entity-type-folder>/]
            └── <entity-type>.md
```

Instance path trong app:

```text
docs/app/<cùng-path>/[<entity-type-folder>/]<ID-slug>/README.md
```

---

## Index

### 00-context

| Entity Type | ID | Definition |
|-------------|-----|------------|
| Application | `APP-` | [application.md](00-context/01-overview/applications/application.md) |
| Scope | `SCOPE-` | [scope.md](00-context/02-scope/scopes/scope.md) |
| Assumption | `ASM-` | [assumption.md](00-context/03-premises/01-assumptions/assumptions/assumption.md) |
| ContextConstraint | `CON-` | [context-constraint.md](00-context/03-premises/02-constraints/constraints/context-constraint.md) |
| GlossaryTerm | `GLO-` | [glossary-term.md](00-context/04-language/glossary-terms/glossary-term.md) |
| ExternalSystem | `EXT-` | [external-system.md](00-context/05-ecosystem/external-systems/external-system.md) |
| Environment | `ENV-` | [environment.md](00-context/06-environment/environments/environment.md) |

### 01-business

| Entity Type | ID | Definition |
|-------------|-----|------------|
| Problem | `PROB-` | [problem.md](01-business/01-discovery/problems/problem.md) |
| Goal | `GOAL-` | [goal.md](01-business/02-direction/goals/goal.md) |
| Stakeholder | `STK-` | [stakeholder.md](01-business/03-organization/stakeholders/stakeholder.md) |
| Process | `PROC-` | [process.md](01-business/04-behavior/01-processes/processes/process.md) |
| Scenario | `SCN-` | [scenario.md](01-business/04-behavior/02-scenarios/scenarios/scenario.md) |
| BusinessRule | `BRULE-` | [business-rule.md](01-business/05-governance/01-business-rules/business-rules/business-rule.md) |
| Policy | `POL-` | [policy.md](01-business/05-governance/02-policies/policies/policy.md) |
| BusinessConstraint | `BCON-` | [business-constraint.md](01-business/05-governance/03-business-constraints/business-constraints/business-constraint.md) |
| Metric | `METRIC-` | [metric.md](01-business/06-measurement/01-metrics/metrics/metric.md) |
| SuccessCriterion | `SC-` | [success-criterion.md](01-business/06-measurement/02-success-criteria/success-criteria/success-criterion.md) |

### 02-product

| Entity Type | ID | Definition |
|-------------|-----|------------|
| BusinessRequirement | `BR-` | [business-requirement.md](02-product/01-needs/business-requirements/business-requirement.md) |
| Capability | `CAP-` | [capability.md](02-product/02-capabilities/capabilities/capability.md) |
| UseCase | `UC-` | [use-case.md](02-product/03-behavior/use-cases/use-case.md) |
| Feature | `FE-` | [feature.md](02-product/04-delivery/01-features/features/feature.md) |
| Release | `REL-` | [release.md](02-product/04-delivery/02-releases/releases/release.md) |
| FunctionalRequirement | `FR-` | [functional-requirement.md](02-product/05-specification/01-functional-requirements/functional-requirements/functional-requirement.md) |
| NonFunctionalRequirement | `NFR-` | [non-functional-requirement.md](02-product/05-specification/02-non-functional-requirements/non-functional-requirements/non-functional-requirement.md) |
| AcceptanceCriterion | `AC-` | [acceptance-criterion.md](02-product/06-acceptance/acceptance-criteria/acceptance-criterion.md) |

### 03-interface

| Entity Type | ID | Definition |
|-------------|-----|------------|
| Persona | `PER-` | [persona.md](03-interface/01-audience/personas/persona.md) |
| Journey | `JNY-` | [journey.md](03-interface/02-experience/01-journeys/journey.md) |
| UserFlow | `FLOW-` | [user-flow.md](03-interface/02-experience/02-user-flows/user-flow.md) |
| Navigation | `NAV-` | [navigation.md](03-interface/03-structure/01-navigation/navigation.md) |
| Screen | `SCR-` | [screen.md](03-interface/03-structure/02-screens/screen.md) |
| UIComponent | `CMP-` | [ui-component.md](03-interface/04-composition/01-components/ui-component.md) |
| Form | `FORM-` | [form.md](03-interface/04-composition/02-forms/form.md) |
| Interaction | `INT-` | [interaction.md](03-interface/05-interaction/01-interactions/interaction.md) |
| UIState | `UIST-` | [ui-state.md](03-interface/05-interaction/02-ui-states/ui-state.md) |
| AccessibilityRequirement | `A11Y-` | [accessibility-requirement.md](03-interface/06-quality/accessibility/accessibility-requirement.md) |
| DesignSystem | `DS-` | [design-system.md](03-interface/07-system/design-systems/design-system.md) |

### 04-domain

| Entity Type | ID | Definition |
|-------------|-----|------------|
| DomainConcept | `DC-` | [domain-concept.md](04-domain/01-language/domain-concepts/domain-concept.md) |
| DomainEntity | `ENT-` | [domain-entity.md](04-domain/02-model/01-entities/domain-entity.md) |
| ValueObject | `VO-` | [value-object.md](04-domain/02-model/02-value-objects/value-object.md) |
| Aggregate | `AGG-` | [aggregate.md](04-domain/02-model/03-aggregates/aggregate.md) |
| Invariant | `INV-` | [invariant.md](04-domain/03-rules/01-invariants/invariant.md) |
| DomainPolicy | `DPOL-` | [domain-policy.md](04-domain/03-rules/02-domain-policies/domain-policy.md) |
| DomainService | `DSVC-` | [domain-service.md](04-domain/04-behavior/01-domain-services/domain-service.md) |
| DomainEvent | `DEVT-` | [domain-event.md](04-domain/04-behavior/02-domain-events/domain-event.md) |
| Lifecycle | `LC-` | [lifecycle.md](04-domain/05-lifecycle/lifecycles/lifecycle.md) |

### 05-architecture

| Entity Type | ID | Definition |
|-------------|-----|------------|
| Module | `MOD-` | [module.md](05-architecture/01-structure/modules/module.md) |
| ModuleBoundary | `MB-` | [module-boundary.md](05-architecture/02-boundaries/module-boundaries/module-boundary.md) |
| InteractionFlow | `AF-` | [interaction-flow.md](05-architecture/03-interactions/interaction-flows/interaction-flow.md) |
| StateOwner | `SO-` | [state-owner.md](05-architecture/04-state/state-owners/state-owner.md) |
| DataFlow | `DF-` | [data-flow.md](05-architecture/05-data/data-flows/data-flow.md) |
| DeploymentUnit | `DU-` | [deployment-unit.md](05-architecture/06-deployment/deployment-units/deployment-unit.md) |
| CrossCuttingRule | `CCR-` | [cross-cutting-rule.md](05-architecture/07-cross-cutting/cross-cutting-rules/cross-cutting-rule.md) |

---

## Schema chung mỗi file

Mỗi file Entity Type định nghĩa:

```text
name, layer, concern, folder, ID pattern
meaning, instance criteria
required fields, optional fields
lifecycle
relations_template
validation
```

Không tạo field/section ngoài schema nếu chưa cập nhật `docs/meta/00-schemas/`.

## Schema chung và schema extend

`entity-instance/v1` giữ phần chung cho mọi entity instance.

Phần khác biệt theo từng `entity_type` phải nằm trong file definition của type đó, tại section:

```md
## structure extends
```

Ví dụ:

```text
docs/meta/01-entity-types/01-business/04-behavior/01-processes/processes/process.md
```

Nếu một type không khai báo `structure extends`, instance của type đó dùng base schema và core sections mặc định.

## Relation Types

`relations_template` trong từng file định nghĩa slot relation mà instance của entity type đó được phép điền.

Một slot chỉ hợp lệ khi:

1. relation type tồn tại trong `docs/meta/02-relation-types/`;
2. valid triple tương ứng tồn tại trong `docs/meta/03-rules/`;
3. target entity type khớp slot.

Entity instance không được ghi relation ngoài slot.
