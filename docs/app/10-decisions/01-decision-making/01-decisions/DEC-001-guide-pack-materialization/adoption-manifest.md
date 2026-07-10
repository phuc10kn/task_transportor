# DEC-001 - `task_transportor` Local Adoption Record

## Phạm Vi

Đây là record local tùy chọn của `task_transportor`. Nó không phải reusable guide pack và guide không yêu cầu project khác tạo file tương tự.

## Source Comparison

| Local source | Stable base | Local destination | Local owner | Local status |
| --- | --- | --- | --- | --- |
| Universal layer baseline | `packs/universal/` | `docs/app/<layer>/` và `docs/meta/` khi cần | Project app/meta | local |
| Domain contract | `packs/variants/ddd/04-domain/` | `docs/meta/01-entity-types/04-domain/` | Project meta | local |
| Modular architecture stable subset | `packs/variants/modular-monolith/05-architecture/` | `docs/meta/01-entity-types/05-architecture/` | Project meta | local |
| Modular architecture non-base subset | None | [local-proposals/modular-monolith/05-architecture/](local-proposals/modular-monolith/05-architecture/README.md) | Project decision | local-proposal |
| Implementation source proposal | None | [local-proposals/modular-monolith/07-implementation/](local-proposals/modular-monolith/07-implementation/README.md) | Project decision | local-proposal |

## Local Rule

- Stable base không tự nâng thành local contract active.
- `task_transportor` tự quyết định record nào cần để trace local adaptation hoặc migration.
- Local proposal không được tạo entity instance, relation slot hoặc valid triple active chỉ vì tồn tại trong archive.

## Relation Disposition - Modular Monolith `05-architecture`

Đây là disposition local của `task_transportor` khi đối chiếu source template với valid triples active. Nó không phải rule của reusable base.

| Source type | Source edge | Local status | Local disposition |
| --- | --- | --- | --- |
| `Module` | `Module -> StateOwner (owns)` | source-match | Có trong valid triples active. |
| `ModuleBoundary` | `ModuleBoundary -> Module (constrains)` | source-match | Có trong valid triples active. |
| `ModuleBoundary` | `ModuleBoundary -> StateOwner (constrains)` | source-match | Có trong valid triples active. |
| `InteractionFlow` | `InteractionFlow -> Module (involves)` | source-match | Có trong valid triples active; reverse trace không tạo `participates_in`. |
| `InteractionFlow` | `InteractionFlow -> Interface (uses)` | not-active | Target triple chưa active trong project. |
| `StateOwner` | `StateOwner -> DataFlow (shared_via)` | source-match | Có trong valid triples active. |
| `DataFlow` | `DataFlow -> StateOwner (moves)` | source-match | Có trong valid triples active. |
| `DataFlow` | `DataFlow -> Interface (crosses)` | not-active | Target triple chưa active trong project. |
| `DataFlow` | `DataFlow -> DataStore (stored_on)` | not-active | Target triple chưa active trong project. |
| `DeploymentUnit` | `DeploymentUnit -> Module (hosts)` | source-match | Có trong valid triples active. |
| `DeploymentUnit` | `DeploymentUnit -> Platform (runs_on)` | not-active | Target triple chưa active trong project. |
| `DeploymentUnit` | `DeploymentUnit -> RuntimeEnvironment (operated_by)` | not-active | Target triple chưa active trong project. |
| `CrossCuttingRule` | `CrossCuttingRule -> Module (affects)` | source-match | Có trong valid triples active. |
