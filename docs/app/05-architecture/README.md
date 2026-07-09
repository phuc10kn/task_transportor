# 05 - Architecture

`05-architecture/` là source of truth cho cách `task_transportor` áp dụng custom modular monolith và mô hình Central Sync Hub. File này giữ app-specific architecture truth; taxonomy reusable nằm ở `docs/app_variants/custom_modular_monolith/`, theory nền nằm ở `docs/theories/`.

Kể từ hôm nay, các `entity type definition` dùng chung của `05-architecture` đặt ở:

- `docs/meta/01-entity-types/05-architecture/**`

Trong `docs/app/05-architecture` vẫn giữ:

- instance thực tế của repo
- routing/chỉ mục đọc
- evidence liên quan behavior, flow, boundary theo implementation hiện tại.

## Nguồn hướng dẫn

- Documentation architecture: `docs/guide/concepts/documentation-architecture.md`
- Theory/decision model: `docs/guide/concepts/theory-and-decision-model.md`
- Cách trace impact: `docs/guide/workflows/trace-impact.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#05-architecture`
- Architecture template reusable: `docs/app_variants/custom_modular_monolith/05-architecture/README.md`
- Modular architecture theory: `docs/theories/modular-architecture/README.md`

## Architecture Truth Hiện Tại

Repo hiện tại vận hành theo invariant:

```text
System -> CIS -> System
```

Cách app áp dụng custom modular monolith hiện tại:

- Runtime Lite/Medium ban đầu là một Node.js CommonJS app dùng Express, SQLite và worker nội bộ.
- Product architecture giữ invariant `System -> CIS -> System`; Backlog/Jira là external adapter, không sở hữu business state của CIS.
- Module source đặt trong `src/modules/<ModuleName>`.
- Module code hiện có: `Auth`, `Projects`, `Cis`, `Backlog`, `Translation`, `Mapping`, `Anomaly`, `Sync`, `Jira`, `Dashboard`.
- Cross-module access phải đi qua public API/module boundary.
- Không import sâu vào `application/`, `infrastructure`, `support` của module khác.
- CIS sở hữu canonical issue state và source snapshot.
- Sync sở hữu job state và journal, nhưng không chiếm business ownership của module khác.
- Jira outbound phải đi qua dry-run/readiness/pre-check trước khi ghi thật.
- Translation sở hữu review lifecycle; AI transport/protocol nằm ở `src/infrastructure/ai`.
- Dashboard và Jira có read exception có kiểm soát.
- Cross-module write mặc định bị cấm.

Workflow architecture chính:

- `AF-001-backlog-manual-pull`
- `AF-002-backlog-project-pull`
- `AF-003-backlog-scheduled-pull`
- `AF-004-translation-review`
- `AF-005-canonical-issue-edit`
- `AF-006-jira-dry-run`
- `AF-007-cis-to-jira-sync`

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#05-architecture`.

README này không lặp lại lý do tồn tại của từng concern; chi tiết app-specific nằm trong các concern README ở phần `Chỉ Mục Nhanh`.

## Theory Routing

- `TH-MODULAR`: structure, module boundary, owner API, shared infrastructure vs ownership.
- `TH-HUBFLOW`: interaction shape `System -> Core Hub -> System`.
- `TH-CANON`: state ownership, canonical branch, source snapshot, owner truth.
- `TH-AI-GOV`: boundary giữa AI assistance, review và transport.
- `TH-SYNC-SAFE`: dry-run, outbound guardrail, stale preview, readiness gate.
- `TH-OPS-TRACE`: job, journal, retry, audit, recoverability.

## Evolution Lite -> Medium -> Full

- Lite ưu tiên pull-first: Backlog manual/project pull vào CIS, Translation review, Jira dry-run và CIS -> Jira sync có kiểm soát.
- Medium mở rộng webhook/Jira inbound sau khi Lite ổn định; webhook chỉ verify, lưu raw event, enqueue job và return nhanh.
- Full mở CIS -> Backlog, replay/rollback, learning sâu hơn, notification, tách worker/process và nâng database khi tải/vận hành yêu cầu.
- Mọi evolution phải giữ invariant `System -> CIS -> System`, owner-write discipline, dry-run trước outbound write và audit/journal đủ truy vết.

## Rule Riêng Hiện Tại

- App-specific module map, flow thật, state owner thật và deployment unit thật ở lại `docs/app/05-architecture/`.
- `docs/meta/01-entity-types/05-architecture/**` là schema/canoncial relation contract cho 7 entity type đã promote.
- Principle reusable lặp lại cho nhiều repo thuộc `docs/theories/` và template reusable thuộc `docs/app_variants/custom_modular_monolith/`.
- File boundary legacy chỉ còn provenance, không là nơi cập nhật luật.
- Khi sửa code trong `src/modules`, đọc lại `01-structure` và `02-boundaries` trước khi code.

## Chỉ Mục Nhanh

- `docs/app/05-architecture/01-structure/README.md`
- `docs/app/05-architecture/02-boundaries/README.md`
- `docs/app/05-architecture/03-interactions/README.md`
- `docs/app/05-architecture/04-state/README.md`
- `docs/app/05-architecture/05-data/README.md`
- `docs/app/05-architecture/06-deployment/README.md`
- `docs/app/05-architecture/07-cross-cutting/README.md`
