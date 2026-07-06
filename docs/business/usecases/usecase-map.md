# Business Use Case Map

## Mục tiêu

Cho góc nhìn quản lý tổng thể về các nhóm use case chính của hệ thống.

## Biểu đồ use case

```mermaid
flowchart LR
  Admin[Admin vận hành]
  Scheduler[Scheduler nội bộ]
  Backlog[Backlog]
  Jira[Jira]

  subgraph System["task_transportor / CIS"]
    U1([Access và project administration])
    U2([Ingest dữ liệu từ Backlog vào CIS])
    U3([Chuẩn bị issue trước khi sync])
    U4([Preview và publish sang Jira])
    U5([Monitoring, retry và audit review])
  end

  Admin --- U1
  Admin --- U2
  Admin --- U3
  Admin --- U4
  Admin --- U5
  Scheduler --- U2
  Backlog --- U2
  Jira --- U4
```

## Mapping sang usecase docs

- `Access và project administration` -> [access-and-project-admin.md](access-and-project-admin.md)
- `Ingest dữ liệu từ Backlog vào CIS` -> [ingest-from-backlog.md](ingest-from-backlog.md)
- `Chuẩn bị issue trước khi sync` -> [issue-preparation.md](issue-preparation.md)
- `Preview và publish sang Jira` -> [publish-to-jira.md](publish-to-jira.md)
- `Monitoring, retry và audit review` -> [monitor-and-recover.md](monitor-and-recover.md)
