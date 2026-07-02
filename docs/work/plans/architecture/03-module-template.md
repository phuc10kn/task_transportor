# Module Template

Khi thêm một module hoặc capability mới, mô tả theo template này trước khi implement.

Module mới nên theo cấu trúc chuẩn trong [02-module-structure.md](02-module-structure.md).

## 1. Mục tiêu

Module giải quyết vấn đề gì?

Ví dụ:

- Pull dữ liệu từ Backlog vào CIS.
- Review bản dịch.
- Push issue đã approved sang Jira.
- Phát hiện mapping gap.

## 2. Boundary

Module sở hữu phần nào?

Nên ghi rõ:

- Data/table nào module đọc/ghi chính.
- Use-case nào module expose.
- Adapter nào module dùng.
- Module nào không được gọi trực tiếp.

Ví dụ:

```text
Module: translation
Owns: translation_queue, translation review actions
Reads: issues, issue_comments, project config
Writes: translation_queue, sync_journal
Uses: ai provider adapter
Does not own: Jira payload, mapping rules
```

## 3. Public use-cases

Liệt kê public service/use-case thay vì file nội bộ:

```text
translation.createDraft(target)
translation.approve(queueId, reviewedText)
translation.reject(queueId, note)
translation.retranslate(queueId)
```

Controller, worker hoặc module khác chỉ nên gọi use-case public.

## 4. Input/output

Mô tả input/output ở mức domain, không cần chốt class chi tiết:

```text
Input:
  project_id
  issue_id
  target_type
  source_text

Output:
  translation_queue id
  review_status
  ai_confidence
```

## 5. State change

Module làm đổi state nào?

Ví dụ:

```text
issues.sync_status: pending_translate -> pending_review
translation_queue.review_status: pending -> ai_draft
sync_journal: action = translate_ai
```

## 6. Error và retry

Ghi rõ:

- Lỗi nào retry được.
- Lỗi nào fail ngay.
- Lỗi có ghi anomaly không.
- Job có được retry bằng `sync_jobs` không.

## 7. Audit

Ghi rõ action nào phải ghi journal/audit:

- ai draft created.
- admin approved.
- mapping approved.
- Jira sync success.
- dry-run failed validation.

## 8. Extension point

Ghi rõ Medium/Full mở rộng module bằng cách nào.

Ví dụ:

```text
Lite: manual pull Backlog
Medium: add Backlog webhook, reuse normalizer
Full: add replay/raw event tooling
```
