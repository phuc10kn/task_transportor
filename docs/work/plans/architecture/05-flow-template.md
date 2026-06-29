# Flow Template

Khi thiết kế một luồng mới, viết theo template này để đảm bảo vẫn đi qua CIS.

## 1. Tên luồng

Ví dụ:

```text
Backlog manual pull -> CIS
CIS -> Jira issue push
Jira webhook -> CIS
CIS -> Backlog comment publish
```

## 2. Trigger

Trigger là gì?

- Admin action.
- Scheduled pull.
- Webhook.
- Worker retry.
- State transition.

## 3. Direction

Luôn ghi rõ:

```text
direction_from = backlog|jira|cis
direction_to = backlog|jira|cis
```

Không dùng một field `direction` chung chung.

## 4. Input

Input đến từ đâu?

- API request.
- External API response.
- Webhook raw payload.
- Existing CIS issue/comment/attachment.

## 5. Normalize

Normalizer nào chịu trách nhiệm?

Ví dụ:

```text
Backlog issue payload -> internal issue fields
Jira comment webhook -> internal comment fields
```

Webhook, manual pull và scheduled pull cùng source phải dùng chung normalizer.

## 6. CIS write

Ghi vào bảng nào?

- `issues`
- `issue_revisions`
- `issue_comments`
- `issue_attachments`
- `translation_queue`
- `mapping_rules`
- `anomaly_log`
- `sync_jobs`
- `sync_journal`

## 7. Pre-check

Trước outbound thật cần check gì?

- Project enabled.
- Translation reviewed.
- Required mapping approved.
- No blocking anomaly.
- Credential exists.
- Dry-run validation passes.

## 8. Side effect

Có gọi external API không?

- Nếu có, module adapter nào gọi?
- Retry policy là gì?
- Lỗi nào fail ngay?
- Lỗi nào retry?

## 9. Audit

Ghi journal/audit gì?

- action.
- status.
- `direction_from`.
- `direction_to`.
- old/new value nếu có.
- `executed_by` nếu manual.
- correlation id.

## 10. Extension

Luồng này mở rộng sang version sau thế nào?

Ví dụ:

```text
Lite: manual pull
Medium: webhook uses same normalizer
Full: replay raw event
```
