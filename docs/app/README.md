# docs/app - App Documentation

`docs/app/` giữ application-specific truth của `task_transportor`.

Phần giải thích generic về cách tổ chức docs nằm ở `docs/guide/`.

Phần rule/schema/convention canonical của documentation system nằm ở `docs/meta/`.

## Nguồn Hướng Dẫn

- Bắt đầu đọc docs: `docs/guide/getting-started/introduction.md`
- Mô hình layer: `docs/guide/concepts/layer-model.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md`
- Canonical map: `docs/guide/reference/canonical-map.md`
- Cách slim layer README: `docs/guide/workflows/slim-layer-readme.md`

## App Truth Hiện Tại

Product direction hiện tại là Central Sync Hub/CIS theo mô hình:

```text
System -> CIS -> System
```

Lite ưu tiên:

- Backlog -> CIS qua manual pull và project pull.
- Translation AI draft với human review.
- Mapping/anomaly gate trước outbound.
- Jira dry-run trước sync thật.
- CIS -> Jira khi pre-check pass.
- Audit qua `sync_jobs`, `sync_journal`, `webhook_events` đúng vai trò riêng.

## Layer Map

| Layer | Vai trò |
| --- | --- |
| `00-context` | Bối cảnh Central Sync Hub, scope nền, premise, language, ecosystem, environment |
| `01-business` | Business reality, actor, process, rule, metric |
| `02-product` | Scope Lite, capability, use case, requirement, acceptance |
| `03-interface` | Admin UI experience, operator touchpoint, flow, screen, interaction state |
| `04-domain` | Vocabulary, entity meaning, lifecycle, invariant |
| `05-architecture` | Module structure, boundary, interaction, state/data/deployment ownership |
| `06-technical` | Runtime, API, schema, config, integration mechanism |
| `07-implementation` | Source organization, module public API, code-level contract |
| `08-quality` | Acceptance Lite, verification command, quality gate |
| `09-operation` | Runtime operation, backup, retry, incident/recovery rule |
| `10-decisions` | Cross-layer decision, alternative, superseded history |

## Theory Routing

- `00-context`: `TH-HUBFLOW`, `TH-CANON`
- `01-business`: `TH-HUBFLOW`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE`
- `02-product`: `TH-HUBFLOW`, `TH-CANON`, `TH-AI-GOV`, `TH-SYNC-SAFE`
- `03-interface`: application của business/product truth qua UI/operator touchpoint
- `04-domain`: `TH-CANON`, `TH-MODULAR`
- `05-architecture`: toàn bộ 6 theory core
- `06-technical`: `TH-CANON`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE`
- `07-implementation`: `TH-MODULAR`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE`
- `08-quality`: `TH-SYNC-SAFE`, `TH-OPS-TRACE`, `TH-AI-GOV`
- `09-operation`: `TH-OPS-TRACE`, `TH-AI-GOV`, `TH-SYNC-SAFE`
- `10-decisions`: toàn bộ 6 theory core

## Luật Đọc Nhanh

1. Đọc `00-context`, `02-product`, `10-decisions` để nắm scope và quyết định còn hiệu lực.
2. Đọc layer liên quan trực tiếp tới task.
3. Khi đụng code module, đọc `05-architecture/01-structure` và `05-architecture/02-boundaries`.
4. Khi cần giải thích cách dùng docs, đọc `docs/guide/`.
5. Khi cần relation/rule canonical, đọc `docs/meta/02-relation-types/` và `docs/meta/03-rules/`.
