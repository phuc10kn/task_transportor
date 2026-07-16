---
schema: decision/v1
id: DEC-005
slug: project-scoped-workspace-api
title: Project-scoped Workspace API
status: accepted
summary: Mọi API thuộc workspace mang projectId trong URL và enforce object isolation tại owner repository; Backend và Admin Web cutover cùng capability, không giữ route legacy.
affected_layers:
  - 02-product
  - 03-interface
  - 05-architecture
  - 06-technical
  - 07-implementation
  - 08-quality
  - 09-operation
  - 10-decisions
theory_basis:
  - TH-MODULAR
  - TH-CANON
  - TH-OPS-TRACE
review_triggers:
  - Product mở multi-tenant hoặc RBAC theo Project.
  - Cần zero-downtime giữa hai API contract.
  - Một resource workspace không còn ownership path tới Project.
  - Internal worker bị tách thành deployment unit độc lập.
---

# DEC-005 - Project-scoped Workspace API

## Status

accepted

Ngày chốt: 2026-07-16. User đã phê duyệt trực tiếp contract, error semantics và coordinated cutover.

## Decision

Mọi API thuộc workspace data plane dùng prefix:

```text
/api/v1/projects/:projectId
```

Chỉ health, auth và Project CRUD/config thuộc global control plane. Active Project tiếp tục nằm trong `sessionStorage` của Admin Web; mỗi request truyền `projectId` rõ trong URL. Không đưa active Project vào JWT, cookie, custom header hoặc global Backend state.

Backend áp dụng hai lớp kiểm tra:

1. Project workspace middleware parse `projectId`, resolve Project qua `ProjectsApi`, chặn Project missing/disabled và gắn `req.project`.
2. Owner repository scope resource bằng resource id + `project_id`, hoặc JOIN qua aggregate owner khi child table không có `project_id` trực tiếp.

Không dùng `project_id` trong body/query làm scope. Giá trị xung đột với path bị từ chối. Cross-project resource lookup không tiết lộ sự tồn tại của resource.

Error contract:

| Tình huống | HTTP | Code |
| --- | ---: | --- |
| Project không tồn tại hoặc id không hợp lệ | 404 | `PROJECT_NOT_FOUND` |
| Project bị disabled | 409 | `PROJECT_DISABLED` |
| Body/query `project_id` xung đột path | 422 | `PROJECT_SCOPE_MISMATCH` |
| Resource không thuộc Project trong path | 404 | `RESOURCE_NOT_FOUND` |

Backend và Admin Web cutover cùng capability trong một release. Route legacy bị xóa khi capability chuyển sang contract mới; không dual route, compatibility proxy hoặc API `v2`.

## Context

Admin Web đã yêu cầu operator chọn đúng một Project, nhưng nhiều API detail/mutation vẫn global hoặc nhận `project_id` tùy chọn qua query/body. Điều này không tạo server-side object isolation và khiến Dashboard phải disabled. Các caller FE cũng có thể refetch/render lại toàn màn sau mutation, làm mất draft chưa lưu ở item khác.

Quyết định này đóng `BE-PROJECT-SCOPE-01/02`, mở lại Dashboard sau khi read model được scope và khóa interaction rule: action chỉ loading/cập nhật đúng item hoặc control phát sinh request; reload toàn màn là hành động explicit qua nút Refresh.

## Implementation Contract

### Endpoint inventory

| Capability | Route cũ cần xóa | Route target | Backend owner | Admin Web caller | Verify caller chính |
| --- | --- | --- | --- | --- | --- |
| Dashboard | `/api/v1/dashboard/*` | `/api/v1/projects/:projectId/dashboard/*` | `Dashboard` | `public/pages/operations.js` | `admin-ui-acceptance.js`, `admin-ui-e2e.js` |
| CIS Issues | `/api/v1/issues[/:issueId]/*` | `/api/v1/projects/:projectId/issues[/:issueId]/*` | `Cis` | `public/pages/issues.js` | `system-issues.js`, `issue-editor-api.js`, `issue-editor-dryrun-sync.js`, `admin-ui-acceptance.js` |
| Jira dry-run/sync | `/api/v1/issues/:issueId/{dry-run,sync}/jira` | `/api/v1/projects/:projectId/issues/:issueId/{dry-run,sync}/jira` | `Jira`, đọc owner issue qua `CisApi` | `public/pages/issues.js` | `jira-outbound.js`, `mapping-anomaly-dryrun.js`, `issue-editor-dryrun-sync.js` |
| Translation Queue/issue | `/api/v1/translation-queue/*`, `/api/v1/translations/issues/*` | `/api/v1/projects/:projectId/translation-queue/*`, `/api/v1/projects/:projectId/issues/:issueId/translations/*` | `Translation`, issue owner qua `CisApi` | `public/pages/translation.js`, `public/pages/issues.js` | `translation-review.js`, `translation-issue-routes.js`, `issue-editor-api.js` |
| Mapping | `/api/v1/mapping-settings`, `/api/v1/mapping-rules/*` | `/api/v1/projects/:projectId/mapping-settings`, `/api/v1/projects/:projectId/mapping-rules/*` | `Mapping` | `public/pages/mappings.js` | `mapping-anomaly-dryrun.js`, `admin-ui-acceptance.js` |
| Anomaly | `/api/v1/anomalies/*` | `/api/v1/projects/:projectId/anomalies/*` | `Anomaly` | `public/pages/operations.js` | `mapping-anomaly-dryrun.js`, `admin-ui-acceptance.js` |
| Sync Jobs/Journal | `/api/v1/sync-jobs/*`, `/api/v1/sync-journal`, `/api/v1/issues/:issueId/sync-journal` | `/api/v1/projects/:projectId/sync-jobs/*`, `/api/v1/projects/:projectId/sync-journal`, `/api/v1/projects/:projectId/issues/:issueId/sync-journal` | `Sync` | `public/shared.js`, `public/pages/operations.js`, `public/pages/backlog.js`, `public/pages/issues.js` | `sync-jobs.js`, `jira-outbound.js`, `admin-ui-acceptance.js`, `admin-ui-e2e.js` |
| Attachment retry | `/api/v1/attachments/:attachmentId/retry-download` | `/api/v1/projects/:projectId/attachments/:attachmentId/retry-download` | `Backlog`, attachment owner qua `CisApi` | `public/pages/issues.js` | `backlog-ingestion.js`, `admin-ui-acceptance.js` |
| Backlog | Không có route global | Giữ `/api/v1/projects/:projectId/backlog/*` | `Backlog` | `public/pages/backlog.js`, `public/pages/mappings.js`, `public/pages/issues.js` | `backlog-ingestion.js`, `system-issues.js`, `admin-ui-e2e.js` |
| Jira mapping values | Không có route global | Giữ `/api/v1/projects/:projectId/jira/mapping-values/pull` | `Jira` | `public/pages/mappings.js` | `admin-ui-acceptance.js` |
| Translation Glossary | Không có route global | Giữ `/api/v1/projects/:projectId/translation-glossary/*` | `Translation` | `public/pages/translation.js` | `translation-glossary-api.js`, `translation-glossary-admin-ui.js` |

`src/modules/*/http/routes.js`, `apps/admin-web/public/**/*.js` và `scripts/verify/**/*.js` là ba inventory surface bắt buộc của static cutover gate.

### Ownership path

| Resource | Project ownership evidence | Enforcement target |
| --- | --- | --- |
| Issue, revision, comment, worklog, attachment, source snapshot | `issues.project_id`; child rows liên kết `issue_id` | `CisRepository`, child lookup JOIN `issues` |
| Jira dry-run/sync | Issue bundle trả `issue.project_id` và Project | `CisApi` lookup scoped trước `Jira` use case |
| Translation Queue | `translation_queue.project_id` và `issue_id` | `TranslationRepository` lookup `(id, project_id)` |
| Translation Glossary | `translation_glossary_concepts.project_id`; terms liên kết concept | `TranslationGlossaryRepository` đã dùng `(concept id, project_id)` |
| Mapping rule/catalog snapshot | `mapping_rules.project_id`, system field values theo Project | `MappingRepository` lookup `(id, project_id)` |
| Anomaly | `anomalies.project_id`, optional `issue_id` | `AnomalyRepository` lookup `(id, project_id)` |
| Sync job | `sync_jobs.project_id` | `SyncJobRepository` lookup `(id, project_id)` |
| Sync journal | `sync_journal.project_id`, optional `issue_id` | `SyncJournalRepository` filter Project + issue |
| Dashboard | Read allowlist trên issue, translation, mapping, anomaly, job | Mọi subquery trong `DashboardRepository` nhận cùng `project_id` |

Schema hiện tại đã có ownership path cần thiết. Không thêm migration trong cutover này. Index chỉ được thêm khi `EXPLAIN QUERY PLAN` hoặc test hiệu năng cho thấy regression.

### Admin Web interaction

- `CIS.projectApi(projectId, path, options)` chỉ ghép URL và gọi `CIS.api`; helper không đọc active Project ngầm.
- `CIS.pollJob(projectId, jobId, onUpdate, timeout)` poll job trong đúng Project.
- Mutation success patch đúng entity từ API response; không refetch list hoặc replace `#page-content`.
- Mutation error giữ input/draft và chỉ trả control phát action về trạng thái sẵn sàng.
- Nút Refresh hiện có là đường reload toàn route.

### Release và rollback

Coordinated release phải dừng API/worker, xác nhận không còn writer, backup `DATABASE_PATH` và ghi checksum trước khi swap artifact. Với path mặc định:

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Copy-Item -LiteralPath 'storage/db/cis.sqlite' -Destination "storage/backups/cis-$stamp.sqlite"
Get-FileHash -Algorithm SHA256 "storage/backups/cis-$stamp.sqlite"
```

Rollback là dừng API/worker, giữ lại DB lỗi để điều tra, copy backup về đúng `DATABASE_PATH`, rollback cả Backend + Admin Web về cùng artifact rồi kiểm tra `/api/v1/health`. Không rollback riêng một phía của contract.

## Theory Basis

- `TH-MODULAR`: Project resolution là shared HTTP mechanism; object ownership vẫn thuộc owner module/public API.
- `TH-CANON`: path Project và owner data tạo một scope truth rõ, không trộn body/query hint với authority.
- `TH-OPS-TRACE`: job, journal và recovery phải giữ cùng Project boundary và không mất evidence.

## Affected Layers

- `02-product`: đóng accepted gap của workspace và Dashboard.
- `03-interface`: active Project chi phối toàn bộ data plane; item-level action state là interaction rule.
- `05-architecture`: middleware không chiếm owner policy; repositories enforce resource ownership.
- `06-technical`: endpoint/error contract đổi theo Project path.
- `07-implementation`: route, controller, repository, FE caller và verify caller cutover cùng slice.
- `08-quality`: thêm cross-project negative/isolation gate.
- `09-operation`: coordinated release, backup và rollback toàn artifact.
- `10-decisions`: giữ rationale và review trigger của cutover.

## Affected Entities

Không materialize canonical relation mới. Decision/Theory dùng frontmatter reference theo meta contract; ownership evidence tiếp tục nằm ở các Module/StateOwner instance hiện có và code owner repository.

## Alternatives Considered

| Phương án | Kết luận |
| --- | --- |
| `project_id` query/body tùy chọn | Loại — caller có thể bỏ scope và không tạo REST boundary ổn định. |
| Custom `X-Project-Id` header | Loại — scope bị ẩn khỏi resource URL và làm cache/log/debug khó hơn. |
| Active Project global ở Backend | Loại — tạo shared mutable state và sai khi có request đồng thời. |
| Chỉ kiểm Project ở middleware | Loại — không chặn resource id thuộc Project khác. |
| Compatibility route hoặc API `v2` | Loại — Lite deploy một monolith + Admin Web, coordinated cutover nhỏ hơn dual contract. |
| Project path + owner repository isolation | Chọn — explicit, kiểm thử được và giữ module ownership. |

## Consequences

- Mọi Backend route, Admin Web caller và verify mock liên quan phải đổi đồng bộ.
- Deep link/resource id sai Project trả 404 thay vì tự chuyển Project.
- Project disabled chặn cả read và mutation workspace bằng 409.
- Internal worker không đi qua HTTP middleware; command/job payload tiếp tục mang `project_id`.
- Zero-downtime giữa hai contract không được hỗ trợ; deployment phải phối hợp.
- FE không tự tải lại toàn màn sau mutation; operator dùng Refresh khi muốn lấy snapshot mới.

## Review Triggers

- Product cần user/role khác nhau theo Project hoặc tenant isolation.
- Backend và Admin Web phải deploy độc lập với zero-downtime.
- Resource mới không có ownership path trực tiếp hoặc qua aggregate owner.
- SQLite query plan cho scoped lookup tạo regression đo được.
- Worker được tách khỏi deployment unit hiện tại và cần project-context contract riêng.
