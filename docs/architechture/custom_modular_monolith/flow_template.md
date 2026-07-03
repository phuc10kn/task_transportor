# Flow template

Khi thiết kế một luồng mới, viết theo template này để đảm bảo vẫn đi qua CIS và giữ boundary đúng.

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

Webhook, manual pull và scheduled pull cùng source phải dùng chung normalizer.

Ví dụ:

```text
Backlog issue payload -> internal issue fields
Jira comment webhook -> internal comment fields
```

## 6. Owner write

Ghi vào bảng nào và owner module là ai?

| Data | Owner |
| --- | --- |
| `issues`, `issue_revisions`, `issue_comments`, `issue_attachments` | `Cis` |
| `translation_queue` lifecycle | `Translation` |
| `mapping_rules` | `Mapping` |
| `anomaly_log` | `Anomaly` |
| `sync_jobs`, `sync_journal` | `Sync` |
| `projects` | `Projects` |

Nếu flow nằm ở module khác nhưng cần ghi state owner, phải gọi owner API.

## 7. Pre-check

Trước outbound thật cần check gì?

- Project enabled/sync enabled.
- Required mapping approved.
- No critical blocking anomaly.
- Credential exists.
- Dry-run validation passes.
- Dry-run hash còn fresh.
- Sync state cho phép.

## 8. Side effect

Có gọi external API không?

- Adapter module nào gọi?
- Retry policy là gì?
- Lỗi nào fail ngay?
- Lỗi nào retry?
- State update sau external call qua owner nào?

## 9. Audit

Ghi journal/audit gì?

- action.
- status.
- `direction_from`.
- `direction_to`.
- old/new value nếu có.
- `executed_by` nếu manual.
- reason nếu có.
- correlation id.

## 10. Extension

Luồng này mở rộng sang version sau thế nào?

Ví dụ:

```text
Lite: manual pull
Medium: webhook uses same normalizer
Full: replay raw event
```

