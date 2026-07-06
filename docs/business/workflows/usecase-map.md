# Business Use Case Map

## Mục tiêu

Cho góc nhìn business-level về các use case chính của hệ thống hiện tại.

## Actor chính

- `Admin vận hành`
- `Scheduler nội bộ`
- `Backlog`
- `Jira`

## Biểu đồ use case

```mermaid
flowchart LR
  Admin[Admin vận hành]
  Scheduler[Scheduler nội bộ]
  Backlog[Backlog]
  Jira[Jira]

  subgraph System["task_transportor / CIS"]
    UC0([Đăng nhập quản trị])
    UC01([Tạo hoặc chỉnh project config])
    UC02([Bật hoặc tắt sync cho project])
    UC1([Đưa issue từ Backlog vào CIS])
    UC2([Đưa project Backlog vào CIS])
    UC3([Tự động quét Backlog theo lịch])
    UC35([Mở và tra cứu issue trong CIS])
    UC4([Tạo và review bản dịch])
    UC45([Approve mapping])
    UC46([Resolve hoặc ignore anomaly])
    UC5([Chuẩn hóa issue trong CIS])
    UC6([Xem trước sync Jira])
    UC7([Sync issue sang Jira])
    UC8([Theo dõi dashboard vận hành])
    UC9([Retry job lỗi])
    UC10([Retry tải attachment])
    UC11([Xem audit và sync journal])
  end

  Admin --- UC0
  Admin --- UC01
  Admin --- UC02
  Admin --- UC1
  Admin --- UC2
  Admin --- UC35
  Admin --- UC4
  Admin --- UC45
  Admin --- UC46
  Admin --- UC5
  Admin --- UC6
  Admin --- UC7
  Admin --- UC8
  Admin --- UC9
  Admin --- UC10
  Admin --- UC11
  Scheduler --- UC3
  Backlog --- UC1
  Backlog --- UC2
  Backlog --- UC3
  Jira --- UC6
  Jira --- UC7
```

## Mapping sang business workflows

- `Đăng nhập quản trị` -> [admin-login.md](admin-login.md)
- `Tạo hoặc chỉnh project config` -> [project-configuration.md](project-configuration.md)
- `Bật hoặc tắt sync cho project` -> [project-sync-control.md](project-sync-control.md)
- `Đưa issue từ Backlog vào CIS` -> [backlog-one-issue-ingest.md](backlog-one-issue-ingest.md)
- `Đưa project Backlog vào CIS` -> [backlog-project-ingest.md](backlog-project-ingest.md)
- `Tự động quét Backlog theo lịch` -> [scheduled-backlog-monitoring.md](scheduled-backlog-monitoring.md)
- `Mở và tra cứu issue trong CIS` -> [issue-review-entry.md](issue-review-entry.md)
- `Tạo và review bản dịch` -> [translation-review.md](translation-review.md)
- `Approve mapping` -> [mapping-approval.md](mapping-approval.md)
- `Resolve hoặc ignore anomaly` -> [anomaly-handling.md](anomaly-handling.md)
- `Chuẩn hóa issue trong CIS` -> [issue-preparation-for-jira.md](issue-preparation-for-jira.md)
- `Xem trước sync Jira` -> [jira-sync-preview.md](jira-sync-preview.md)
- `Sync issue sang Jira` -> [jira-sync-publish.md](jira-sync-publish.md)
- `Theo dõi dashboard vận hành` -> [dashboard-monitoring.md](dashboard-monitoring.md)
- `Retry job lỗi` -> [failed-job-retry.md](failed-job-retry.md)
- `Retry tải attachment` -> [attachment-download-retry.md](attachment-download-retry.md)
- `Xem audit và sync journal` -> [audit-and-journal-review.md](audit-and-journal-review.md)
