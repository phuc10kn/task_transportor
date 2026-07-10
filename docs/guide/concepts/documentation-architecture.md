# Documentation Architecture

## Mô hình tổng thể

```text
docs/meta/
    ↓ defines structure and rules

docs/theories/
    ↓ provides reusable reasoning

docs/app/
    ↓ applies meta + theory to project truth

source code / operation
    ↓ provides observed reality
```

## Ranh giới chính

| Folder | Chứa | Không chứa |
| --- | --- | --- |
| `docs/meta` | Entity types, relation types, valid triples, conventions. | App-specific business/product truth. |
| `docs/theories` | Project-owned principles and reasoning. | External system, module hoặc source path cụ thể. |
| `docs/app` | Project truth theo layer. | Generic explanation lặp lại của docs system. |
| `docs/guide/reference/entity-maps/packs` | Universal app origin và methodology pack reusable xuyên dự án. | Source of truth active của project. |
| `docs/workbench` | Optional local workspace khi project kích hoạt. | Source of truth, app truth, meta rule đang có hiệu lực. |
| `docs/guide` | Cách dùng hệ docs và reusable pack source. | Contract active của project. |
| `docs/AGENT_SKILLS` | Agent workflows/checklists. | Human-facing full manual. |

## Hướng cleanup

Layer README nên ngày càng nhẹ:

```text
Layer README
    = layer-specific purpose
    + app truth hiện tại
    + routing ngắn tới folder structure/meta
    + rule riêng của layer
    + link về guide cho mô hình chung
```

Các đoạn giải thích generic như `Layer -> Concern -> Entity Type -> Entity Instance` nên sống ở `docs/guide`, không copy trong từng layer.

Chỉ canonical schema/rule/convention mới sống ở `docs/meta`.
