# Modular Monolith - 07-implementation Candidate Pack

Status: `candidate-only`

Pack này chứa reusable implementation taxonomy cho custom modular monolith. Đây là source evidence/template, không phải entity-map active, không phải canonical graph và không tạo runtime variant trong `docs/app/`.

## Candidate type index

Tám type đều có status `candidate`. Chúng chưa có local target cho tới khi từng type có meaning ổn định, owner rõ, relation slots được review và valid triples được chốt riêng.

| Concern | Candidate type | Source template | Dependency evidence |
| --- | --- | --- | --- |
| Organization | `SourceStructure` | [source-structure.md](01-organization/source-structures/source-structure.md) | `CodingRule`, `PublicContract` đều candidate dependency. |
| Contracts | `PublicContract` | [public-contract.md](02-contracts/public-contracts/public-contract.md) | `Interface`, `VerificationCheck` chưa có canonical target. |
| Behavior | `ImplementationWorkflow` | [implementation-workflow.md](03-behavior/implementation-workflows/implementation-workflow.md) | `DataAccessComponent`, `IntegrationAdapter` là candidate dependency. |
| Data handling | `DataAccessComponent` | [data-access-component.md](04-data-handling/data-access-components/data-access-component.md) | `DataStore`, `VerificationCheck` chưa có canonical target; `StateOwner` active nhưng edge 07 chưa canonical. |
| External boundaries | `IntegrationAdapter` | [integration-adapter.md](05-external-boundaries/integration-adapters/integration-adapter.md) | `ExecutionMechanism`, `SecurityMechanism` chưa có canonical target. |
| Evolution | `EvolutionPlan` | [evolution-plan.md](06-evolution/evolution-plans/evolution-plan.md) | `DataAccessComponent`, `DeploymentRunbook`, `ReleaseGate` là candidate dependency. |
| Automation | `AutomationMechanism` | [automation-mechanism.md](07-automation/automation-mechanisms/automation-mechanism.md) | `CodingRule`, `VerificationCheck` là candidate dependency. |
| Coding rules | `CodingRule` | [coding-rule.md](08-coding-rules/code-rules/coding-rule.md) | `AutomationMechanism`, `VerificationCheck` là candidate dependency. |

## Concern directories

- [01-organization](01-organization/)
- [02-contracts](02-contracts/)
- [03-behavior](03-behavior/)
- [04-data-handling](04-data-handling/)
- [05-external-boundaries](05-external-boundaries/)
- [06-evolution](06-evolution/)
- [07-automation](07-automation/)
- [08-coding-rules](08-coding-rules/)

## Candidate relation evidence

Các edge dưới đây chỉ là evidence trong candidate template. Chúng chưa được thêm vào `docs/meta/02-relation-types/`, `docs/meta/03-rules/` hoặc relation slots active.

| Source type | Candidate edge | Target status |
| --- | --- | --- |
| `SourceStructure` | `SourceStructure -> CodingRule (governed_by)` | Candidate target |
| `SourceStructure` | `SourceStructure -> PublicContract (exposed_via)` | Candidate target |
| `PublicContract` | `PublicContract -> Interface (exposes)` | Chưa có canonical target |
| `PublicContract` | `PublicContract -> VerificationCheck (verified_by)` | Chưa có canonical target |
| `ImplementationWorkflow` | `ImplementationWorkflow -> DataAccessComponent (uses)` | Candidate target |
| `ImplementationWorkflow` | `ImplementationWorkflow -> IntegrationAdapter (uses)` | Candidate target |
| `DataAccessComponent` | `DataAccessComponent -> DataStore (uses)` | Chưa có canonical target |
| `DataAccessComponent` | `DataAccessComponent -> StateOwner (reads_or_writes)` | Target active; edge chưa canonical |
| `DataAccessComponent` | `DataAccessComponent -> VerificationCheck (verified_by)` | Chưa có canonical target |
| `IntegrationAdapter` | `IntegrationAdapter -> ExecutionMechanism (used_by)` | Chưa có canonical target |
| `IntegrationAdapter` | `IntegrationAdapter -> SecurityMechanism (uses)` | Chưa có canonical target |
| `EvolutionPlan` | `EvolutionPlan -> DataAccessComponent (changes)` | Candidate target |
| `EvolutionPlan` | `EvolutionPlan -> DeploymentRunbook (rolled_out_by)` | Chưa có canonical target |
| `EvolutionPlan` | `EvolutionPlan -> ReleaseGate (gated_by)` | Chưa có canonical target |
| `AutomationMechanism` | `AutomationMechanism -> CodingRule (enforces)` | Candidate target |
| `AutomationMechanism` | `AutomationMechanism -> VerificationCheck (runs)` | Chưa có canonical target |
| `CodingRule` | `CodingRule -> AutomationMechanism (checked_by)` | Candidate target |
| `CodingRule` | `CodingRule -> VerificationCheck (verified_by)` | Chưa có canonical target |

## Promotion gate

Một candidate chỉ được materialize khi có đủ evidence cho type meaning, instance criteria, owner, lifecycle, relation slots, target type và valid triple. Promotion phải:

1. Có decision/review ghi rõ lý do type cần active.
2. Chọn canonical home trong `docs/meta/` và app-specific truth trong `docs/app/` nếu thực sự có instance.
3. Review relation vocabulary/direction/cardinality; không tự suy ra từ candidate edge.
4. Cập nhật valid triples và test/link liên quan trước khi gọi là active.

Pack này không tự thực hiện promotion và không tạo `07-implementation` entity-map variant. Project ghi adoption status/provenance trong manifest local khi một type được promote.
