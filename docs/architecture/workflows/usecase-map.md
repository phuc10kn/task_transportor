# Use Case Map

## Mục tiêu

Cho góc nhìn actor -> use case của `task_transportor` ở trạng thái hiện tại. File này không mô tả chi tiết các bước kỹ thuật; phần đó nằm ở từng workflow riêng.

## Actor chính

- `Admin`
- `Scheduler`
- `Backlog`
- `Jira`

## Biểu đồ use case

```mermaid
flowchart LR
  Admin[Admin]
  Scheduler[Scheduler]
  Backlog[Backlog]
  Jira[Jira]

  subgraph System["task_transportor"]
    UC1([Pull một issue từ Backlog vào CIS])
    UC2([Pull một project Backlog vào CIS])
    UC3([Scheduled pull từ Backlog])
    UC4([Tạo draft dịch])
    UC5([Review hoặc sửa bản dịch])
    UC6([Chỉnh canonical issue trong CIS])
    UC7([Dry-run payload Jira])
    UC8([Sync issue từ CIS sang Jira])
  end

  Admin --- UC1
  Admin --- UC2
  Admin --- UC4
  Admin --- UC5
  Admin --- UC6
  Admin --- UC7
  Admin --- UC8

  Scheduler --- UC3
  Backlog --- UC1
  Backlog --- UC2
  Backlog --- UC3
  Jira --- UC7
  Jira --- UC8
```

## Ghi chú

- `UC4` và `UC5` là hai use case khác nhau: tạo draft dịch và review bản dịch.
- `UC7` và `UC8` cũng tách riêng: dry-run không đồng nghĩa sync thật.
- Worker nội bộ tham gia ở lớp workflow kỹ thuật, không phải actor nghiệp vụ chính của use case map này.

## Mapping sang workflow files

- `Pull một issue từ Backlog vào CIS` -> [backlog-manual-pull.md](backlog-manual-pull.md)
- `Pull một project Backlog vào CIS` -> [backlog-project-pull.md](backlog-project-pull.md)
- `Scheduled pull từ Backlog` -> [backlog-scheduled-pull.md](backlog-scheduled-pull.md)
- `Tạo draft dịch` và `Review hoặc sửa bản dịch` -> [translation-review.md](translation-review.md)
- `Chỉnh canonical issue trong CIS` -> [issue-editor-canonical-edit.md](issue-editor-canonical-edit.md)
- `Dry-run payload Jira` -> [jira-dry-run.md](jira-dry-run.md)
- `Sync issue từ CIS sang Jira` -> [cis-to-jira-sync.md](cis-to-jira-sync.md)
