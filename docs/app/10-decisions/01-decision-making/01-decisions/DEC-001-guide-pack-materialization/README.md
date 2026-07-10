---
schema: decision/v1
id: DEC-001
slug: guide-pack-materialization
title: Guide Stable Base Boundary
status: accepted
summary: Guide giữ stable base xuyên dự án; task_transportor tự vận hành contract, migration và lifecycle local.
affected_layers:
  - 04-domain
  - 05-architecture
  - 07-implementation
  - 10-decisions
affected_entities:
  - EntityType
  - RelationType
  - ValidTriple
theory_basis:
  - TH-CANON
  - TH-MODULAR
review_triggers:
  - Guide cần methodology base hoặc layer base mới.
  - Project muốn tự động copy hoặc sync source base.
  - Contract local diverge khỏi source base mà chưa có local record rõ.
---

# DEC-001 - Guide Stable Base Boundary

## Status

accepted

Ngày chốt: 2026-07-10.

## Decision

- `docs/guide/` là manual xuyên dự án và giữ stable base pack: taxonomy, type/relation template và hướng dẫn tạo knowledge unit.
- Guide không giữ migration, adoption, lifecycle, divergence, provenance, evidence hoặc canonical graph của `task_transportor`.
- `docs/meta/` giữ contract active của project. `docs/app/` giữ app truth, entity instance, decision và migration record local. `docs/theories/` và `docs/AGENT_SKILLS/` do project tự vận hành.
- Application không khai báo runtime `variant` hoặc `taxonomy_variant` để dùng pack.
- Không tự động đồng bộ ngược local docs vào guide. Chỉ khi một pattern đã có reusable meaning được review độc lập thì biên soạn stable pack mới hoặc cập nhật stable pack hiện có.

## Context

Các pack cũ đã lẫn source reusable với candidate source và migration history của `task_transportor`. Quyết định này tách hai việc:

1. Guide chỉ giữ stable base.
2. `task_transportor` tự quản lý source proposal, path migration và local contract dưới decision này.

## Local Migration Records

- [Path migration map](migration-path-map.md) giữ old/new path và alias provenance.
- [Local proposal archive](local-proposals/README.md) giữ source proposal đã rút khỏi guide.
- [Local adoption record](adoption-manifest.md) giữ đối chiếu source base với local contract khi project cần trace.

## Migration Inventory

| Source baseline | Stable guide destination | Local destination | Owner | Local status |
| --- | --- | --- | --- | --- |
| `raw_app_original/README.md` | `packs/universal/README.md` | None; guide metadata | Guide | stable-base |
| `raw_app_original/00` đến `10` | `packs/universal/<layer>/` | `docs/app/<layer>/` khi project dùng layer | Project app/meta | local |
| `raw_app_original/06`, `08`, `09` generic taxonomy | `packs/universal/<layer>/` | `docs/meta/` khi project tạo contract local | Project meta | local |
| `custom_modular_monolith/README.md` | `packs/variants/modular-monolith/README.md` | None; guide metadata | Guide | stable-base |
| Stable subset của `custom_modular_monolith/05-architecture/` | `packs/variants/modular-monolith/05-architecture/` | `docs/meta/01-entity-types/05-architecture/` | Project meta | local |
| Non-base subset của `custom_modular_monolith/05-architecture/` | None | [local-proposals/modular-monolith/05-architecture/](local-proposals/modular-monolith/05-architecture/README.md) | Project decision | local-proposal |
| `custom_modular_monolith/07-implementation/` | None | [local-proposals/modular-monolith/07-implementation/](local-proposals/modular-monolith/07-implementation/README.md) | Project decision | local-proposal |

## Theory Basis

- `TH-CANON`: source base, active contract và app truth phải có owner rõ.
- `TH-MODULAR`: methodology source và project architecture phải được phân biệt theo meaning và boundary.

## Consequences

- Mỗi project có thể có contract local khác nhau dù dùng cùng stable base.
- Guide không yêu cầu adoption manifest; record local chỉ tồn tại khi project thấy cần.
- Local proposal archive không tạo entity type, relation type, valid triple hoặc entity instance active.
- Path migration và provenance của `task_transportor` không nằm trong guide.

## Review Triggers

- Thêm stable methodology base hoặc layer base vào guide.
- Project cần automated source copy/sync.
- Local contract mất trace với source base.
