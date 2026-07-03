# Module design template

Khi thêm module hoặc capability mới, mô tả theo template này trước khi implement.

## 1. Mục tiêu

Module giải quyết vấn đề gì?

Ví dụ:

- Pull dữ liệu từ Backlog vào CIS.
- Review bản dịch.
- Push issue đã approved sang Jira.
- Phát hiện mapping gap.

## 2. Ownership và boundary

Ghi rõ:

- Data/table nào module sở hữu write.
- Data/table nào module chỉ read.
- Read nào là owner API, read nào là tier allowlist.
- Use case nào module expose qua `<Domain>Api`.
- Adapter nào module dùng.
- Module nào không được gọi trực tiếp.

Ví dụ:

```text
Module: Translation
Owns write: translation_queue lifecycle/review
Reads: issue context qua CisApi hoặc Tier 1 allowlist tạm
Writes audit: sync_journal qua owner path nếu cần
Uses: TranslationAdapter, AI transport trong src/infrastructure/ai
Does not own: canonical issue fields, Jira payload, sync_jobs lifecycle
```

## 3. Public use cases

Liệt kê public use case theo domain, không theo file nội bộ:

```text
TranslationApi.requestIssueTranslations(input)
TranslationApi.translateIssueQueueItemNow(input)
TranslationApi.approveQueueItem(input)
TranslationApi.manualEditQueueItem(input)
```

Controller, worker hoặc module khác chỉ gọi public use case/API.

## 4. Input/output

Mô tả input/output ở mức domain.

```text
Input:
  project_id
  issue_id
  target_type
  source_text

Output:
  queue_id
  review_status
  ai_confidence
```

## 5. State change

Module làm đổi state nào?

Ví dụ:

```text
translation_queue.review_status: pending -> ai_draft
issues.sync_status: synced -> update_pending  -- nếu đi qua CisApi owner
sync_journal: action = translate_ai
```

Nếu state thuộc module khác, ghi rõ owner API nào được gọi.

## 6. Error và retry

Ghi rõ:

- Lỗi nào retry được.
- Lỗi nào fail ngay.
- Lỗi có tạo anomaly không.
- Job có dùng `sync_jobs` không.
- Journal/audit ghi gì cho từng nhánh lỗi.

## 7. Audit

Ghi rõ action nào phải ghi journal/audit:

- AI draft created.
- Admin approved/rejected/edited.
- Mapping approved/rejected.
- Jira sync success/failure.
- Dry-run failed validation.

## 8. Extension point

Ghi rõ Lite/Medium/Full mở rộng module như thế nào.

Ví dụ:

```text
Lite: manual pull Backlog
Medium: add Backlog webhook, reuse normalizer
Full: add replay/raw event tooling
```

## Checklist

- [ ] Module owner rõ.
- [ ] Public API không proxy domain khác.
- [ ] Cross-module write đi qua owner API.
- [ ] Read exception nếu có đã có tier/allowlist.
- [ ] Error/retry/audit rõ.
- [ ] Không cần tách service để module vẫn có boundary rõ.

