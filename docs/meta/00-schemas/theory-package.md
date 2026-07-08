# Theory Package Schema

Schema này áp dụng cho theory package trong `docs/theories/<theory>/`.

Theory là reusable reasoning foundation. App-specific truth vẫn nằm trong `docs/app/`.

Unit template: [theory](../../guide/unit-structure/theory/README.md).

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

## Required Fields

| Field | Rule |
| --- | --- |
| `schema` | Luôn là `theory-package/v1`. |
| `id` | Stable theory ID. |
| `slug` | Trùng folder theory. |
| `title` | Tên theory. |
| `status` | Một status trong vocabulary canonical. |
| `summary` | Một câu nêu problem space của theory. |
| `files` | Khai báo file chuẩn của package. |
| `owns` | Những reasoning area theory sở hữu. |
| `excludes` | Những nội dung theory không được chứa. |

## Required Files

```text
README.md
agent.md
theory.md
governance.md
```

## README Required Sections

```md
## Mục đích

## Core positions

## Boundary semantics

## Key tensions

## Theory này không chứa

## Ảnh hưởng app

## Đọc tiếp khi nào
```

## theory.md Required Sections

```md
## Question

## Position

## Principles

## Reasoning

## Boundaries

## Tensions

## Evolution

## Open questions
```

## Forbidden

- Không đặt app-specific route, module path, API, schema runtime hoặc source code path trong pure theory.
- Không tạo theory mới chỉ để lưu note chưa chín; dùng `NOTE-OPEN` hoặc giữ ngoài docs cho tới khi đủ promote.
- Không copy full theory vào `docs/app`; app docs chỉ reference theory ID và nêu cách áp dụng trong bối cảnh app.
