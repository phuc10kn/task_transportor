# Interaction Map — Modular Monolith / 05-architecture

Reading view cho relation template của biến thể modular monolith ở layer `05-architecture`. Không phải source pack hoặc canonical graph của một project.

Source template: [modular-monolith 05-architecture base](../../../packs/variants/modular-monolith/05-architecture/README.md). Active canonical graph thuộc `docs/meta/` của từng project.

## Graph

```mermaid
flowchart LR
  MB[ModuleBoundary]
  M[Module]
  AF[InteractionFlow]
  SO[StateOwner]
  DF[DataFlow]
  DU[DeploymentUnit]
  CCR[CrossCuttingRule]

  M -->|governed_by| MB
  MB -->|constrains| M
  MB -->|constrains| SO
  M -->|participates_in| AF
  AF -->|involves| M
  M -->|owns| SO
  SO -->|shared_via| DF
  DF -->|moves| SO
  DU -->|hosts| M
  CCR -->|affects| M
```

## Ghi Chú

- Diagram chỉ mô tả stable relation template của base.
- Variant khác = pack + interaction-map khác dưới layer tương ứng.
- Triple list canonical của project thuộc `docs/meta/03-rules/05-architecture/valid-triples.md`.
