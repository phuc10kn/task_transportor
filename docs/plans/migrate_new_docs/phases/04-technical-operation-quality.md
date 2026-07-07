# Phase 04 - Kỹ thuật, vận hành và chất lượng

## Mục tiêu

Phase này hấp thụ các tài liệu kỹ thuật, vận hành và chất lượng còn sống từ legacy.

Ba loại nội dung cần tách rõ:

- technical mechanism: hệ thống dùng cơ chế gì;
- quality gate: làm sao biết cơ chế đó đúng hoặc đủ an toàn;
- operation reality: chạy, quan sát, backup, recover như thế nào.

Không đưa deployment guide vào product plan, và không đưa acceptance checklist vào architecture theory.

## Inputs bắt buộc

- `docs_legacy/work/02-central-issue-store.md`
- `docs_legacy/work/03-backlog-ingestion.md`
- `docs_legacy/work/04-jira-ingestion.md`
- `docs_legacy/work/05-translation-pipeline.md`
- `docs_legacy/work/06-sync-engine.md`
- `docs_legacy/work/07-mapping-learning.md`
- `docs_legacy/work/08-anomaly-detection.md`
- `docs_legacy/work/09-runtime-config.md`
- `docs_legacy/work/10-state-machine.md`
- `docs_legacy/work/11-api-contract.md`
- `docs_legacy/work/12-webhook-verification.md`
- `docs_legacy/work/guides/**`
- `docs_legacy/work/plans/lite/09-acceptance.md`
- `docs_legacy/work/plans/lite/implement_issue_editor/**`
- `docs_legacy/work/plans/lite/implement_plans/08-verification-matrix.md`
- `docs_legacy/work/plans/lite/workflow/**`
- `docs_legacy/server/**`
- `docs/plans/migrate_new_docs/migration_matrix.md`
- `docs/app/06-technical/**`
- `docs/app/08-quality/**`
- `docs/app/09-operation/**`
- `docs/theories/safe-external-synchronization/**`
- `docs/theories/recoverable-operations/**`
- `src/**`
- `package.json`

## Phân loại nội dung

| Nội dung legacy | Destination |
| --- | --- |
| API contract | `app/06-technical` |
| CIS schema, persistence, data contract | `app/06-technical`, `app/04-domain` nếu là domain meaning |
| Backlog/Jira ingestion mechanics | `app/06-technical`, `app/05-architecture` nếu là flow |
| Translation/mapping/anomaly technical mechanism | `app/06-technical`, route business rule sang phase 03 |
| Sync engine retry/audit mechanics | `app/06-technical`, `app/09-operation`, `app/08-quality` |
| State machine runtime behavior | `app/06-technical`, `app/09-operation`, hoặc `app/04-domain` tùy lớp |
| Runtime config mechanism | `app/06-technical` |
| Environment setup | `app/09-operation` |
| Deployment guide | `app/09-operation` |
| Backup/restore | `app/09-operation` |
| Manual acceptance | `app/08-quality` |
| Verification matrix | `app/08-quality` |
| Webhook verification | `app/06-technical`, `app/08-quality` |
| Issue editor sample/contract evidence | `app/06-technical`, `app/08-quality`, hoặc discard nếu chỉ là fixture cũ |
| Demo guide | `app/08-quality` nếu còn dùng làm acceptance evidence, nếu không discard |

## Việc cần làm

1. Tách API contract còn sống khỏi endpoint notes lỗi thời.
2. Đối chiếu API/config/schema/state/runtime notes với code hiện tại.
3. Tách CIS schema, ingestion, translation, sync, mapping, anomaly technical detail khỏi product/business prose.
4. Tách runtime config thành mechanism và operational setup.
5. Chuyển deployment/backup/recovery vào operation layer.
6. Chuyển manual acceptance và verification matrix vào quality layer.
7. Phân loại issue editor sample JSON và workflow docs là contract evidence, fixture cũ, hoặc discard.
8. Gắn theory_basis cho dry-run, external write, retry, audit, recovery.
9. Đánh dấu guide chỉ dùng demo cũ là `superseded` hoặc `discard`.
10. Kiểm tra không còn quality gate quan trọng chỉ nằm trong legacy.
11. Cập nhật matrix cho các dòng technical/quality/operation thuộc `docs_legacy/work/**` và `docs_legacy/server/**`.

## Mapping ưu tiên

| Legacy file/cụm | Xử lý ưu tiên |
| --- | --- |
| `02-central-issue-store.md` | Split CIS schema/domain meaning/technical persistence |
| `03-backlog-ingestion.md` | Split ingestion flow, API/client mechanics, verification |
| `04-jira-ingestion.md` | Split Jira inbound/outbound mechanics and dry-run evidence |
| `05-translation-pipeline.md` | Split translation business review from adapter/config mechanics |
| `06-sync-engine.md` | Merge retry/audit/job mechanics into technical/operation/quality |
| `07-mapping-learning.md` | Split mapping business rule from persistence/technical mechanism |
| `08-anomaly-detection.md` | Split anomaly business rule from detection/runtime mechanism |
| `09-runtime-config.md` | Split giữa technical config và operation setup |
| `10-state-machine.md` | Split domain lifecycle, runtime state and verification |
| `11-api-contract.md` | Merge vào technical interfaces |
| `12-webhook-verification.md` | Merge vào technical/security/quality |
| `guides/lightsail-deploy.md` | Merge vào operation deployment nếu còn dùng |
| `guides/lite-sqlite-backup.md` | Merge vào operation recovery/backup |
| `guides/lite-manual-acceptance.md` | Merge vào quality validation |
| `implement_plans/08-verification-matrix.md` | Merge vào quality verification |
| `implement_issue_editor/*.json` | Keep only if useful as contract/sample evidence; otherwise discard with reason |
| `plans/lite/workflow/*` | Route executable/technical workflow detail to technical or architecture layer |

## Deliverables

- Technical docs đủ để hiểu interface/config chính.
- Quality docs giữ acceptance và verification gate còn sống.
- Operation docs giữ deployment, backup, recovery và monitoring notes.
- Legacy technical/operation guide không còn là source duy nhất.
- Những guide lỗi thời được đánh status rõ.
- Matrix rows for technical/quality/operation slices have owner, status and destination/reason.

## Câu hỏi review

- Runtime config này là product setting, technical mechanism hay deployment concern?
- Manual acceptance này còn cần cho release gate không?
- Deployment guide này còn đúng với môi trường hiện tại không?
- API contract này có còn khớp code không?
- Webhook verification là scope hiện tại hay optional/history?
- Sample JSON này là contract evidence hay chỉ là fixture cũ?
- State machine này là domain state, runtime state hay acceptance state?

## Chốt chặn

Phase đạt khi:

- không cần mở `docs_legacy/work/guides` để biết vận hành Lite cơ bản;
- acceptance quan trọng nằm trong `docs/app/08-quality`;
- runtime/deployment docs không lẫn vào product plan;
- operation docs có đủ backup/recovery note còn sống.
- technical docs đã được đối chiếu với code hiện tại trước khi chốt.

## Không coi là xong nếu

- API contract chỉ được giữ trong legacy;
- deployment guide không có owner layer;
- verification matrix bị mất;
- guide demo cũ được giữ như production runbook.
- sample JSON hoặc endpoint note cũ được giữ như contract hiện tại mà chưa đối chiếu code.

## Checklist nghiệm thu

- [x] API contract còn sống đã có home trong `docs/app/06-technical`.
- [x] CIS schema, ingestion, translation, sync, mapping, anomaly technical slices đã được phân loại.
- [x] API/config/schema/state/runtime notes đã được đối chiếu với code hiện tại.
- [x] Runtime config đã được tách giữa technical mechanism và operation setup.
- [x] Deployment guide còn sống đã có home trong `docs/app/09-operation`.
- [x] Backup/restore/recovery note còn sống đã được migrate.
- [x] Acceptance/manual check đã có home trong `docs/app/08-quality`.
- [x] Verification matrix còn sống đã được giữ hoặc chuyển thành quality gate.
- [x] Webhook verification đã được phân loại là current scope, optional hoặc historical.
- [x] Demo guide cũ đã được phân loại, không bị nhầm thành production runbook.
- [x] Issue editor sample JSON/workflow đã được phân loại là contract evidence, fixture cũ hoặc discard.
- [x] Matrix rows thuộc technical/quality/operation đã được cập nhật bằng status cuối phase.
- [x] Đã chạy lệnh verification của phase và ghi lại kết quả.
- [x] Người review đã xác nhận phase 04 đạt chốt chặn.

## Verification result

- `package.json`, `src/app.js`, `src/config/env.js`, `src/db/migrations`, `src/modules/**` đã được đối chiếu để chốt runtime, API, schema, module implementation và verify scripts.
- `docs/app/06-technical` hiện giữ API/config/schema/runtime truth.
- `docs/app/07-implementation` hiện giữ source layout, module API và Issue Editor implementation contract.
- `docs/app/08-quality` hiện giữ acceptance/manual gate và verification matrix còn sống.
- `docs/app/09-operation` hiện giữ local/demo runbook, worker operation, backup/recovery và deployment profile.
- `docs_legacy/work/guides/lite-demo.md` đã được phân loại là validation walkthrough, không phải production runbook.
- `docs_legacy/work/guides/lite-sqlite-backup.md` đã được merge vào operation backup/recovery.
- Webhook hiện được phân loại là reserved/optional cho Medium vì code Lite chưa mount webhook route.
- Issue Editor workflow/sample được giữ như contract evidence và đã được route vào technical/implementation/quality thay vì giữ sample JSON như contract hiện tại.
- Matrix Phase 04 đã chuyển các dòng đã xử lý từ `merge` sang `merged`.

## Verification

```powershell
rg -n "docs_legacy/work/guides|docs_legacy/server" docs -g "!docs/plans/migrate_new_docs/**"
rg -n "acceptance|verification|backup|deploy|runtime config" docs/app/06-technical docs/app/08-quality docs/app/09-operation
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]*\|[^|]+\|\s*04\s*\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
rg --files src
```
