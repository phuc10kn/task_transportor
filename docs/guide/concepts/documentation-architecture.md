# Documentation Architecture

## Mô hình tổng thể

```text
docs/meta/
    ↓ defines structure and rules

docs/theories/
    ↓ provides reusable reasoning

docs/app/
    ↓ applies meta + theory to Central Sync Hub

source code / operation
    ↓ provides observed reality

docs/backlog-theories/
    ↓ holds candidate knowledge before promotion
```

## Ranh giới chính

| Folder | Chứa | Không chứa |
| --- | --- | --- |
| `docs/meta` | Entity types, relation types, valid triples, conventions. | App-specific business/product truth. |
| `docs/theories` | Project-owned principles and reasoning. | Jira/Backlog/module cụ thể. |
| `docs/app` | Central Sync Hub truth theo layer. | Generic explanation lặp lại của docs system. |
| `docs/app_technical` | Reusable technical taxonomy/template. | Source of truth cụ thể của repo nếu `docs/app` đã có. |
| `docs/backlog-theories` | Candidate, review, unpromoted notes. | Rule đang có hiệu lực. |
| `docs/guide` | Cách dùng hệ docs. | Canonical rule mới. |
| `docs/AGENT_SKILLS` | Agent workflows/checklists. | Human-facing full manual. |

## Hướng cleanup

Layer README nên ngày càng nhẹ:

```text
Layer README
    = layer-specific purpose
    + app truth hiện tại
    + concern list
    + rule riêng của layer
    + link về guide cho mô hình chung
```

Các đoạn giải thích generic như `Layer -> Concern -> Entity Type -> Entity Instance` nên sống ở `docs/guide`, không copy trong từng layer.

Chỉ canonical schema/rule/convention mới sống ở `docs/meta`.
