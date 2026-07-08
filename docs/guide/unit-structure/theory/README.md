# Unit Structure - Theory

Template này dùng cho theory package trong `docs/theories/<theory>/`.

Theory là reasoning reusable, không chứa app-specific truth.

Schema canonical: [theory-package.md](../../../meta/00-schemas/theory-package.md).

## YAML Structure

```yaml
theory_package:
  schema: theory-package/v1
  id: TH-MODULAR
  slug: modular-architecture
  title: Modular Architecture
  status: active
  summary: Reasoning nền về module, boundary, ownership và public surface.
  files:
    readme: README.md
    theory: theory.md
    agent: agent.md
    governance: governance.md
  owns:
    - module boundary reasoning
    - ownership discipline
  excludes:
    - app-specific module map
    - endpoint, schema, source path cụ thể
  depends_on: []
```

## README Skeleton

```md
# TH-XXX - <Theory Name>

## Mục đích

## Core positions

## Boundary semantics

## Key tensions

## Theory này không chứa

## Ảnh hưởng app

## Đọc tiếp khi nào
```

## theory.md Skeleton

```md
# TH-XXX - Full Theory

## Question

## Position

## Principles

## Reasoning

## Boundaries

## Tensions

## Evolution

## Open questions
```
