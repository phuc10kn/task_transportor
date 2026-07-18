# 05 - Architecture

`05-architecture/` là source of truth cho cách `task_transportor` áp dụng custom modular monolith và mô hình Central Sync Hub. File này giữ app-specific architecture truth; taxonomy reusable nằm ở `docs/guide/reference/entity-maps/packs/variants/modular-monolith/`, theory nền nằm ở `docs/theories/`.

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
- Architecture template reusable: `docs/guide/reference/entity-maps/packs/variants/modular-monolith/05-architecture/README.md`
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
- Manual filtered multi-pull được Admin Web điều phối bằng một Count request rồi các Page request tuần tự; mỗi Page chỉ enqueue/reuse `manual_pull` hiện có. Không có batch/coordinator job, job type hoặc persistent batch state mới.
- Page handler tạo internal Issue List snapshot cho child `manual_pull`; child bỏ `getProject`/`getIssue` nhưng vẫn đọc comments/attachments theo issue trước khi đi qua normalizer, mapping và CIS owner-write.
- Jira outbound phải đi qua dry-run/readiness/pre-check trước khi ghi thật.
- Translation sở hữu review lifecycle; AI transport/protocol nằm ở `src/infrastructure/external/transports` và OpenAI/DeepSeek provider gateway nằm ở `src/infrastructure/external/providers`.
- HTTP egress Backlog/Jira chỉ tồn tại dưới `src/infrastructure/external/providers/<provider>`, qua `src/infrastructure/external/transports/http`. Module adapter gọi named operation đã đăng ký; scope authoritative được mint từ `projectId`, snapshot Project qua `ProjectsApi`, và deny mặc định khi capability/operation/endpoint không hợp lệ.
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

Manual filtered multi-pull là orchestration additive quanh execution `manual_pull` của `AF-001`, không kích hoạt lại `AF-002` hoặc `AF-003`; Count/offset pagination chỉ có best-effort source coverage và enqueue progress thuộc phiên Admin Web.

## Architecture Clean Baseline Và Canonical Relation Slice

Policy local: [DEC-002 App Graph Materialization Policy](../10-decisions/01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/README.md).

Toàn bộ 43 architecture instance active đã được chuẩn hóa về `entity-instance/v1`, đủ base/type section contract và được kiểm tra bởi `npm run verify:architecture-baseline`.

Core graph cho Flow, Module, ModuleBoundary, StateOwner, DataFlow, DeploymentUnit và CrossCuttingRule đã materialize 128 canonical edge:

- Mỗi InteractionFlow ghi module participant bằng `involves` và StateOwner mà một execution path có thể thay đổi bằng `changes`.
- ModuleBoundary ghi module/state owner bị ràng buộc bằng `constrains`; reverse trace được derive.
- Mọi StateOwner canonical hiện có đều được Module owner ghi bằng `owns`.
- DataFlow dùng `shared_via` cho input state được expose và `moves` cho state đích; feedback path không bị trộn vào outbound/context flow.
- DU-001 dùng `hosts` tới toàn bộ module active; worker nội bộ và local persistence vẫn là role/dependency trong cùng deployable.
- CrossCuttingRule dùng `constrains` cho Scope đã được Statement xác nhận; chỉ CCR-005 ràng buộc StateOwner trực tiếp.

Baseline này làm sạch canonical instance mà không suy diễn graph từ prose. Không tạo dual/inverse edge hoặc Boundary-to-Flow relation chỉ vì có link trong `Related Entities`. Mỗi Markdown link trong section này được gắn `Canonical relation` khi có direct edge incident trong `relations:` hoặc `Context/evidence` khi chỉ giữ ý nghĩa giải thích; direction canonical vẫn nằm ở YAML của source instance. Verifier chặn link chưa phân loại và nhãn canonical không có edge thật.

## Canonical Graph Query

Query graph đọc `relations:` canonical qua:

```powershell
npm run architecture:trace -- --from MOD-007
npm run architecture:trace -- --from SO-001 --relation changes --reverse
```

Mặc định query trả cả canonical outbound edge và reverse edge derived. `--reverse` chỉ trả reverse trace derived; tool không ghi inverse relation vào document.

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

- Lite ưu tiên pull-first: Backlog Pull one/candidate sync vào CIS, Translation review, Jira dry-run và CIS -> Jira sync có kiểm soát; project/scheduled pull hiện bị disable.
- Medium mở rộng webhook/Jira inbound sau khi Lite ổn định; webhook chỉ verify, lưu raw event, enqueue job và return nhanh.
- Full mở CIS -> Backlog, replay/rollback, learning sâu hơn, notification, tách worker/process và nâng database khi tải/vận hành yêu cầu.
- Mọi evolution phải giữ invariant `System -> CIS -> System`, owner-write discipline, dry-run trước outbound write và audit/journal đủ truy vết.

## Rule Riêng Hiện Tại

- App-specific module map, flow thật, state owner thật và deployment unit thật ở lại `docs/app/05-architecture/`.
- `docs/meta/01-entity-types/05-architecture/**` là schema/canonical relation contract cho 7 entity type đã promote.
- Principle reusable lặp lại cho nhiều repo thuộc `docs/theories/` và template reusable thuộc `docs/guide/reference/entity-maps/packs/`.
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
