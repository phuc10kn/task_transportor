# Modular Monolith - 05-architecture Base

Base này giữ stable architecture taxonomy cho custom modular monolith. Nó không phải canonical registry của một project và không chứa entity instance.

## Concern Index

- [01-structure](01-structure/README.md)
- [02-boundaries](02-boundaries/README.md)
- [03-interactions](03-interactions/README.md)
- [04-state](04-state/README.md)
- [05-data](05-data/README.md)
- [06-deployment](06-deployment/README.md)
- [07-cross-cutting](07-cross-cutting/README.md)

## Stable Type Templates

| Concern | Type | Source template |
| --- | --- | --- |
| Structure | `Module` | [module.md](01-structure/modules/module.md) |
| Boundaries | `ModuleBoundary` | [module-boundary.md](02-boundaries/module-boundaries/module-boundary.md) |
| Interactions | `InteractionFlow` | [interaction-flow.md](03-interactions/interaction-flows/interaction-flow.md) |
| State | `StateOwner` | [state-owner.md](04-state/state-owners/state-owner.md) |
| Data | `DataFlow` | [data-flow.md](05-data/data-flows/data-flow.md) |
| Deployment | `DeploymentUnit` | [deployment-unit.md](06-deployment/deployment-units/deployment-unit.md) |
| Cross-cutting | `CrossCuttingRule` | [cross-cutting-rule.md](07-cross-cutting/cross-cutting-rules/cross-cutting-rule.md) |

## Boundary

Base chỉ giữ stable source template. Relation type, valid triple, app truth, migration và lifecycle của từng project thuộc local `docs/meta/`, `docs/app/` và `docs/theories/`.
