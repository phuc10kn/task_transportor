# Phase 01 - Sự thật sản phẩm

## Mục tiêu

Phase này hấp thụ product truth còn sống từ `docs_legacy/work/` vào hệ `docs/app`.

Product truth là những nội dung trả lời:

- hệ thống đang giải quyết vấn đề gì;
- MVP/Lite gồm gì và không gồm gì;
- actor và operator làm gì;
- luồng nào là ưu tiên hiện tại;
- tiêu chí nào quyết định một phase hoặc feature là đạt;
- quyết định sản phẩm nào vẫn ảnh hưởng tới code và docs hôm nay.

Không phải mọi file trong `docs_legacy/work/` đều là product truth. Nhiều checklist triển khai cũ có thể đã trở thành history.

## Inputs bắt buộc

- `docs_legacy/work/README.md`
- `docs_legacy/work/00-overview.md`
- `docs_legacy/work/00-reading-order.md`
- `docs_legacy/work/00-document-map.md`
- `docs_legacy/work/00-design-status.md`
- `docs_legacy/work/01-architecture.md`
- `docs_legacy/work/02-central-issue-store.md`
- `docs_legacy/work/03-backlog-ingestion.md`
- `docs_legacy/work/04-jira-ingestion.md`
- `docs_legacy/work/05-translation-pipeline.md`
- `docs_legacy/work/06-sync-engine.md`
- `docs_legacy/work/07-mapping-learning.md`
- `docs_legacy/work/08-anomaly-detection.md`
- `docs_legacy/work/10-state-machine.md`
- `docs_legacy/work/plans/lite/**`
- `docs_legacy/work/plans/medium/**`
- `docs_legacy/work/plans/full/**`
- `docs_legacy/work/plans/lite/implement_context.md`
- `docs_legacy/work/plans/lite/implement_plans/**`
- `docs_legacy/work/plans/lite/implement_issue_editor/**`
- `docs_legacy/work/plans/lite/workflow/**`
- `docs_legacy/work/implement-interview.md`
- `docs/plans/migrate_new_docs/migration_matrix.md`
- `docs/app/00-context/README.md`
- `docs/app/01-business/README.md`
- `docs/app/02-product/README.md`
- `docs/app/08-quality/README.md`
- `docs/app/10-decisions/README.md`

## Phân loại nội dung

| Nội dung trong legacy work | Destination |
| --- | --- |
| Product model, Central Sync Hub direction | `app/00-context`, `app/01-business` |
| Lite scope, MVP boundaries | `app/02-product` |
| Manual pull, project pull, translation review, dry-run | `app/01-business`, `app/02-product` |
| CIS, ingestion, translation, sync, mapping, anomaly capability | `app/02-product`, sau đó route chi tiết sang phase 03/04 nếu cần |
| State machine ở mức product behavior | `app/02-product`, `app/04-domain` |
| Acceptance/manual check | `app/08-quality` |
| Implementation phase checklist | `app/10-decisions` nếu còn quyết định; discard nếu chỉ là task history |
| Issue editor scope và canonical edit behavior | `app/02-product`, `app/01-business`, `app/10-decisions` |
| Medium/Full plan | `app/10-decisions` nếu còn định hướng tương lai; `superseded`/`discard` nếu không còn scope hiện tại |
| Runtime config ở mức user-visible | `app/02-product` hoặc `app/06-technical` |
| Quyết định đã chốt trong interview | `app/10-decisions` |

## Việc cần làm

1. Đọc các overview và Lite plan để xác định direction hiện tại.
2. Tách phần "scope còn sống" khỏi phần "task tracking đã qua".
3. Tạo hoặc cập nhật app entities cho scope, capability, requirement, acceptance.
4. Chuyển quyết định từ `implement-interview.md` vào decision layer.
5. Gắn `theory_basis` khi product behavior phụ thuộc `TH-HUBFLOW`, `TH-CANON`, `TH-AI-GOV`, `TH-SYNC-SAFE`, `TH-OPS-TRACE`.
6. Đánh dấu phần Lite plan nào `superseded` bởi docs mới.
7. Phân loại các file `work/01-08` và `work/10` theo phần product truth, business/domain truth, technical truth.
8. Chuyển phần không thuộc product sang phase owner phù hợp trong `migration_matrix.md`.
9. Phân loại `implement_issue_editor`, `workflow`, `plans/medium`, `plans/full` thay vì bỏ mặc định.
10. Ghi các câu hỏi chưa rõ thành open item thay vì đoán.

## Mapping ưu tiên

| Legacy file/cụm | Xử lý ưu tiên |
| --- | --- |
| `work/README.md` | Extract reading order và product overview còn sống |
| `work/00-overview.md` | Merge vào context/business overview |
| `work/01-architecture.md` | Route architecture truth sang phase 02, giữ product decision nếu có |
| `work/02-central-issue-store.md` | Extract CIS capability và route schema/technical detail sang phase 04 |
| `work/03-backlog-ingestion.md` | Extract product behavior, route workflow/technical detail sang phase 03/04 |
| `work/04-jira-ingestion.md` | Extract product behavior, route workflow/technical detail sang phase 03/04 |
| `work/05-translation-pipeline.md` | Extract review capability, route AI/technical detail sang phase 03/04 |
| `work/06-sync-engine.md` | Extract sync capability, route retry/audit detail sang phase 03/04 |
| `work/07-mapping-learning.md` | Extract mapping/anomaly product behavior, route domain/rule detail sang phase 03 |
| `work/08-anomaly-detection.md` | Extract anomaly product behavior, route domain/rule detail sang phase 03 |
| `work/10-state-machine.md` | Split product state behavior from domain/runtime state |
| `work/plans/lite/README.md` | Extract Lite scope và constraints |
| `work/plans/lite/implement_context.md` | Extract implementation assumptions còn đúng |
| `work/plans/lite/implement_plans/*` | Convert thành decisions/quality gates nếu còn sống |
| `work/plans/lite/implement_issue_editor/*` | Extract issue editor scope, canonical edit behavior, sample contract evidence |
| `work/plans/lite/workflow/*` | Route workflow descriptions sang business/architecture/technical layer |
| `work/plans/medium/*`, `work/plans/full/*` | Classify future scope, not current Lite truth unless explicitly accepted |
| `work/implement-interview.md` | Convert quyết định đã chốt vào `10-decisions` |

## Deliverables

- Product direction đọc được từ `docs/app` mà không mở legacy.
- Lite/MVP scope có home rõ trong product layer.
- Acceptance quan trọng có home trong quality layer.
- Decision quan trọng từ interview/plan được đưa vào `app/10-decisions`.
- Danh sách `docs_legacy/work` file theo status cuối phase.
- Matrix rows for `docs_legacy/work/**` have owner, status and destination/reason.

## Câu hỏi review

- Lite plan hiện còn là plan triển khai hay chỉ còn là lịch sử?
- Có decision nào trong interview đang trái với docs mới không?
- Manual pull/project pull có phải scope chính hiện tại không?
- Webhook là scope chính, optional, hay historical?
- Medium/Full plan là roadmap còn sống hay historical?
- Issue editor plan còn là scope hiện tại hay chỉ là implementation history?
- Có acceptance nào bắt buộc giữ để review phase code sau này không?

## Chốt chặn

Phase đạt khi:

- người đọc hiểu MVP/Lite direction từ `docs/app`;
- không cần mở `docs_legacy/work` để biết scope hiện tại;
- các quyết định quan trọng về Backlog, Jira, CIS, Translation, Sync không bị mất;
- các file `work/01-08`, `work/10`, `implement_issue_editor`, `plans/medium`, `plans/full` đều có status trong matrix;
- mỗi reference từ docs mới sang `docs_legacy/work` còn lại có lý do và deadline.

## Không coi là xong nếu

- chỉ copy plan Lite vào docs mới;
- `AGENTS.md` vẫn cần đọc `docs_legacy/work` để biết scope hiện tại;
- acceptance vẫn chỉ nằm trong legacy plan;
- implementation checklist cũ bị nhầm thành product requirement sống.
- `plans/medium`, `plans/full` bị lẫn vào Lite scope hiện tại mà không có decision.

## Kết quả phase 01

Đã hấp thụ product truth sống từ legacy work vào các home mới:

- `docs/app/00-context/README.md`: bối cảnh Central Sync Hub và mô hình `System -> CIS -> System`.
- `docs/app/01-business/README.md`: business flow Lite, actor/operator và business rule còn sống.
- `docs/app/02-product/README.md`: Lite in-scope, out-of-scope, product behavior ưu tiên và Medium/Full boundary.
- `docs/app/08-quality/README.md`: acceptance Lite ở mức product.
- `docs/app/10-decisions/README.md`: quyết định sản phẩm còn hiệu lực từ legacy work/interview.
- `AGENTS.md`: reading path thường ngày đã chuyển khỏi `docs_legacy/work` sang `docs/app`.

Kết quả matrix:

| Nhóm | Số lượng | Trạng thái |
| --- | ---: | --- |
| Row owner/deadline Phase 01 | 25 | Đã đóng |
| `merged` | 23 | Product truth đã nhập vào `docs/app` |
| `superseded` | 2 | Medium/Full plan không thuộc Lite hiện tại |
| Row Phase 01 còn `migrate`/`merge`/`defer`/`keep-temporary` | 0 | Không còn blocker Phase 01 |

Các row `docs_legacy/work` còn mở thuộc owner Phase 02-04, chủ yếu là architecture/domain/technical/quality detail. Chúng không còn là product-scope blocker của Phase 01.

## Checklist nghiệm thu

- [x] Đã phân loại các file chính trong `docs_legacy/work`.
- [x] Đã phân loại `work/01-08`, `work/10`, `implement_issue_editor`, `workflow`, `plans/medium`, `plans/full`.
- [x] Product direction còn sống đã có home trong `docs/app`.
- [x] Lite/MVP scope đã được đặt vào layer phù hợp.
- [x] Manual pull, project pull, translation review, dry-run đã được route đúng.
- [x] Acceptance quan trọng đã có home trong `docs/app/08-quality`.
- [x] Decision quan trọng từ `implement-interview.md` đã có home trong `docs/app/10-decisions` hoặc open item.
- [x] Checklist triển khai cũ đã được phân biệt với product truth sống.
- [x] Reference còn lại tới `docs_legacy/work` đều có lý do và deadline.
- [x] Matrix rows thuộc owner/deadline Phase 01 đã được cập nhật bằng status cuối phase.
- [x] Đã chạy lệnh verification của phase và ghi lại kết quả.
- [x] Người review đã xác nhận phase 01 đạt chốt chặn.

## Verification

```powershell
rg -n "docs_legacy/work" docs AGENTS.md
rg -n "Lite|MVP|manual pull|project pull|acceptance" docs/app
$rows = Get-Content docs/plans/migrate_new_docs/migration_matrix.md | Where-Object { $_ -match '^\| `docs_legacy/' }
$parsed = $rows | ForEach-Object {
  $cols = $_ -split '\|'
  [pscustomobject]@{
    path = $cols[1].Trim().Trim('`')
    owner = $cols[3].Trim()
    status = $cols[4].Trim()
    deadline = $cols[8].Trim()
  }
}
$parsed | Where-Object {
  ($_.owner -eq '01' -or $_.deadline -eq '01') -and
  $_.status -in @('migrate','merge','defer','keep-temporary')
}
```

Kết quả kỳ vọng: query cuối không trả row nào. Các reference `docs_legacy/work` còn lại chỉ được phép là provenance có lý do/deadline trong migration, AGENTS, theory hoặc phase sau.
