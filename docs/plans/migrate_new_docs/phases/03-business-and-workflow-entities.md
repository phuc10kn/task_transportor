# Phase 03 - Thực thể nghiệp vụ và luồng công việc

## Mục tiêu

Phase này hấp thụ `docs_legacy/business/` vào các layer app phù hợp.

Trọng tâm là biến business docs cũ thành entity docs có vị trí rõ, thay vì giữ dạng folder business tổng hợp.

Nội dung cần bảo toàn:

- actor và role;
- business workflow;
- business rule;
- approval rule;
- anomaly rule;
- state/lifecycle meaning;
- glossary và canonical language;
- example còn giúp hiểu hành vi thật.

## Inputs bắt buộc

- `docs_legacy/business/README.md`
- `docs_legacy/business/overview/**`
- `docs_legacy/business/usecases/**`
- `docs_legacy/business/workflows/**`
- `docs_legacy/business/rules/**`
- `docs_legacy/business/states/**`
- `docs_legacy/business/entities/**`
- `docs_legacy/business/integrations/**`
- `docs_legacy/business/decisions/**`
- `docs_legacy/business/governance/**`
- `docs_legacy/business/glossary/**`
- `docs_legacy/business/examples/**`
- `docs/plans/migrate_new_docs/migration_matrix.md`
- `docs/app/01-business/**`
- `docs/app/02-product/**`
- `docs/app/04-domain/**`
- `docs/app/05-architecture/03-interactions/**`
- `docs/app/08-quality/**`
- `docs/app/10-decisions/**`
- `docs/meta/**`

## Phân loại nội dung

| Nội dung legacy business | Destination |
| --- | --- |
| Actor, stakeholder, role | `app/01-business` |
| Use case | `app/01-business`, `app/02-product` |
| Business process/workflow | `app/01-business` |
| Integration-facing business meaning | `app/01-business`, `app/04-domain`, hoặc route technical detail sang phase 04 |
| Feature-facing scenario | `app/02-product` nếu cần |
| Domain vocabulary/entity meaning | `app/04-domain` |
| State/lifecycle nghiệp vụ | `app/04-domain` hoặc `app/05-architecture/04-state` |
| Sync gate hoặc approval rule | `app/01-business`, `app/10-decisions` |
| Business decision còn hiệu lực | `app/10-decisions` |
| Documentation ownership/update policy | `docs/meta` hoặc `docs/app/10-decisions` nếu là decision |
| Technical flow detail | `app/05-architecture` hoặc `app/06-technical` |
| Example/test-like scenario | `app/08-quality` nếu dùng để verify |

## Việc cần làm

1. Đọc overview để xác định actor và product model còn sống.
2. Đọc usecase map để đảm bảo không mất use case không nằm trong workflow.
3. Tách business workflow khỏi architecture interaction flow.
4. Tách domain meaning khỏi database/schema detail.
5. Tách business rule khỏi technical retry/recovery rule.
6. Chuyển glossary term quan trọng vào domain/context language.
7. Phân loại integrations theo business meaning và technical mechanism.
8. Chuyển decisions còn hiệu lực vào `app/10-decisions`.
9. Chuyển governance docs còn sống vào `meta` hoặc decisions.
10. Chuyển examples còn sống thành scenario hoặc validation evidence.
11. Discard examples liên quan riêng `backlog2jira` nếu không còn dùng.
12. Cập nhật matrix cho mọi file `docs_legacy/business/**`.
13. Gắn `theory_basis` phù hợp khi workflow dựa trên hub, AI review, sync safety hoặc operation trace.

## Mapping ưu tiên

| Legacy cụm | Xử lý ưu tiên |
| --- | --- |
| `overview/product-model.md` | Merge vào context/business |
| `usecases/*` | Merge vào business capability/use case, route technical detail nếu có |
| `workflows/backlog-*` | Merge vào business process và architecture interaction |
| `workflows/translation-review.md` | Merge vào business review flow và AI governance |
| `workflows/jira-sync-*` | Merge vào publish flow, dry-run, sync safety |
| `rules/approval-rules.md` | Merge vào business rules và decisions |
| `states/*` | Split giữa domain lifecycle và architecture state owner |
| `entities/*` | Merge domain meaning, not database schema |
| `integrations/*` | Split business integration role from API/client mechanics |
| `decisions/*` | Move accepted/current decisions into `app/10-decisions` |
| `governance/*` | Move documentation ownership/rule into `meta` if still valid |
| `glossary/*` | Merge vào context/domain language |

## Deliverables

- Business layer có flow/rule/state quan trọng.
- Domain layer có vocabulary cần thiết.
- Workflow quan trọng có link sang architecture interaction flow.
- Examples còn sống có vai trò rõ.
- Legacy business files có status cuối phase.
- Matrix rows for `docs_legacy/business/**` have owner, status and destination/reason.

## Câu hỏi review

- Workflow này là business process hay architecture flow?
- State này là domain lifecycle hay operation state?
- Rule này là business rule, sync gate, hay technical retry policy?
- Example này còn verify hành vi hiện tại không?
- Thuật ngữ này thuộc glossary context hay domain concept?
- Integration doc này mô tả business role hay technical adapter/API detail?
- Governance doc này còn là rule hiện tại hay chỉ là history?

## Chốt chặn

Phase đạt khi:

- người đọc hiểu happy path và exception path chính từ `docs/app`;
- business rules không bị lẫn với technical retry;
- glossary không còn chỉ sống trong legacy;
- use case, integration, decision và governance quan trọng không bị bỏ sót;
- business workflow chính có route sang theory phù hợp.

## Không coi là xong nếu

- business workflow bị copy nguyên vào architecture;
- state business bị trộn với sync job runtime state;
- examples được giữ mà không có vai trò;
- `backlog2jira` legacy bị kéo vào docs mới không chủ đích.
- business decisions/governance bị discard mà không có reason trong matrix.

## Checklist nghiệm thu

- [x] Đã phân loại các cụm `README`, `overview`, `usecases`, `workflows`, `rules`, `states`, `entities`, `integrations`, `decisions`, `governance`, `glossary`, `examples`.
- [x] Business workflow chính đã có home trong `docs/app/01-business`.
- [x] Use case và integration business meaning còn sống đã có home hoặc phase owner phù hợp.
- [x] Domain vocabulary còn sống đã có home trong `docs/app/04-domain` hoặc context phù hợp.
- [x] State/lifecycle đã được tách giữa domain state và operation/runtime state.
- [x] Business rule đã được tách khỏi technical retry/recovery rule.
- [x] Examples còn giữ đã có vai trò rõ: scenario, validation evidence hoặc decision evidence.
- [x] Nội dung `backlog2jira` không bị migrate nếu chưa có quyết định rõ.
- [x] Reference còn lại tới `docs_legacy/business` đều có phase owner/deadline trong migration plan; không còn reference bắt buộc ngoài migration plan.
- [x] Matrix rows thuộc `docs_legacy/business` đã được cập nhật bằng status cuối phase hoặc phase owner sau phù hợp.
- [x] Đã chạy lệnh verification của phase và ghi lại kết quả.
- [x] Người review đã xác nhận phase 03 đạt chốt chặn.

## Verification

```powershell
rg -n "docs_legacy/business" docs
rg -n "Backlog|Jira|translation|approval|anomaly" docs/app/01-business docs/app/04-domain
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]*(docs_legacy/business/|docs_legacy/work/)[^|]*\|[^|]+\|\s*03\s*\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
```

Kết quả chạy Phase 03:

- `rg -n "docs_legacy/business" docs AGENTS.md -g "!docs/plans/migrate_new_docs/**"`: không còn reference bắt buộc ngoài migration plan.
- `rg -n "Backlog|Jira|translation|approval|anomaly|mapping|retry|dry-run|CIS" docs/app/01-business docs/app/04-domain`: business/domain truth đã có các thuật ngữ và rule chính.
- Matrix không còn row owner Phase 03 thuộc `docs_legacy/business/**` hoặc `docs_legacy/work/*` ở trạng thái `migrate`, `merge`, `defer` hoặc `keep-temporary`.
- Business governance không bị discard: các row `docs_legacy/business/governance/**` vẫn có owner Phase 05, deadline Phase 05 và review question trong matrix vì chúng thuộc docs/meta governance hơn là business workflow truth.
