# Lite - Overview

## Mục tiêu

Lite là bản nhỏ nhất nhưng phải chạy được luồng thật bằng cách **chủ động kéo dữ liệu**:

```text
Backlog manual pull / scheduled pull -> CIS -> Review -> Dry-run -> Jira
```

Lite dùng để chứng minh kiến trúc CIS, kiểm tra manual pull/scheduled pull, dịch Nhật -> Việt bằng `codex_exec`, review bản dịch, mapping bắt buộc và push issue/comment sang Jira.

## Nguyên tắc cắt scope

Lite được phép cắt độ rộng, không được cắt nền móng.

- Được cắt webhook khỏi scope bắt buộc, nhưng normalizer/job/audit vẫn phải đủ để Medium thêm webhook sau.
- Được cắt Jira inbound đầy đủ, nhưng vẫn phải lưu được `jira_issue_key` sau khi sync Jira.
- Được cắt AI mapping nâng cao, nhưng thiếu mapping vẫn phải block sync thật.
- Được cắt anomaly nâng cao, nhưng `routing_mismatch`, `mapping_gap`, `translation_low_conf` và sync failure phải có.
- Được cắt upload attachment nâng cao, nhưng metadata/trạng thái attachment phải được lưu để Medium không phải đổi schema.
- Được cắt role phức tạp, nhưng admin login bằng JWT phải có.
- Được cắt dashboard đẹp, nhưng dashboard health tối thiểu phải có.

## Luồng chính

```text
Backlog manual pull / scheduled pull
  -> pull snapshot
  -> sync_jobs(backlog -> cis)
  -> normalize/upsert issue
  -> translation_queue
  -> admin review
  -> mapping/anomaly pre-check
  -> dry-run Jira
  -> sync_jobs(cis -> jira)
  -> Jira issue/comment
  -> sync_journal
```

## Không làm trong Lite

- Backlog/Jira webhook; webhook là scope Medium.
- Jira -> CIS webhook/manual pull đầy đủ.
- Sync ngược CIS -> Backlog.
- Việt -> Nhật cho dev reply về Backlog.
- Upload attachment thật sang Jira nếu Lite chỉ chọn metadata/download mức cơ bản.
- AI mapping learning nâng cao.
- Bulk mapping approval nếu UI chưa cần.
- Batch operation approval đầy đủ.
- Role/permission phức tạp ngoài admin.
- Notification email/Slack/Teams.
- Backup tự động.
- Tách worker thành process riêng.
- PostgreSQL hoặc DB ngoài SQLite.
