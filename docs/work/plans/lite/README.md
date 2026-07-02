# Phiên bản Lite

Lite là bản triển khai đầu tiên của Central Sync Hub/CIS. Lite phải nhỏ hơn Medium, nhưng vẫn giữ đúng mô hình **System -> CIS -> System** và không bỏ các nền tảng cần để Medium kế thừa.

Luồng chính của Lite:

```text
Backlog manual pull / scheduled pull
  -> CIS
  -> optional codex_exec translation
  -> optional Human review
  -> Dry-run
  -> CIS -> Jira
```

## Thứ tự đọc

1. [01-overview.md](01-overview.md) - mục tiêu, nguyên tắc cắt scope và ranh giới Lite.
2. [implement_context.md](implement_context.md) - context tổng hợp đủ để bắt đầu implement Lite.
3. [../architecture/README.md](../architecture/README.md) - ngôn ngữ kiến trúc chung dùng cho mọi phiên bản.
4. [implement_plans/README.md](implement_plans/README.md) - phase triển khai, chốt chặn và test được sau từng phase.
5. [02-runtime-config.md](02-runtime-config.md) - runtime, env, storage, credential và bootstrap.
6. [03-cis-schema.md](03-cis-schema.md) - schema subset và state cần có trong Lite.
7. [04-backlog-ingestion.md](04-backlog-ingestion.md) - manual pull/scheduled pull Backlog -> CIS.
8. [05-translation-review.md](05-translation-review.md) - `codex_exec` translation và human review.
9. [06-mapping-anomaly.md](06-mapping-anomaly.md) - mapping required và anomaly tối thiểu.
10. [07-sync-engine-jira.md](07-sync-engine-jira.md) - worker, retry, dry-run và CIS -> Jira.
11. [08-api-admin-ui.md](08-api-admin-ui.md) - API contract và Admin UI Lite.
12. [09-acceptance.md](09-acceptance.md) - checklist triển khai và Definition of Done.

## Scope ngắn gọn

Lite làm:

- Backlog manual pull theo issue/project vào CIS.
- Scheduled pull optional để chủ động quét thay đổi định kỳ.
- Lưu raw API response/pull snapshot, dedupe, job queue và sync journal.
- Dịch Nhật -> Việt bằng `codex_exec` cho summary, description, comment khi bật translation option.
- Human review bắt buộc cho comment cần dịch trước khi sync comment sang Jira. Issue canonical sync từ Issue Editor không bị chặn bằng gate riêng của translation queue/review, nhưng `issues.sync_status = 'pending_translate'` vẫn chưa syncable trong code Lite hiện tại.
- Mapping required qua CIS canonical, approve trước khi dùng.
- Dry-run Jira bắt buộc trước sync thật.
- Sync issue/comment đã duyệt sang Jira.
- Attachment metadata/status, có thể download file nếu API credential sẵn.
- Admin UI tối thiểu để vận hành queue/review/mapping/job/anomaly.

Lite chưa làm:

- Jira -> CIS đầy đủ.
- Backlog/Jira webhook; webhook để Medium.
- CIS -> Backlog.
- Việt -> Nhật cho dev reply về Backlog.
- AI learning nâng cao.
- Role phức tạp.
- Notification ngoài UI.
- Backup tự động.
- Tách worker thành process riêng.
