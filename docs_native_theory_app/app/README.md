# `docs/app` Standard Structure



# Quan hệ tổng thể

```text
                       Context
                           │
                           ▼
                      Business
                           │
                           ▼
                  Product Solution
                 ┌──────┼────────┐
                 ▼      ▼        ▼
               UI    Domain  Architecture
                        │          │
                        └────┬─────┘
                             ▼
                         Technical
                             ▼
                      Implementation
                             ▼
                          Quality
                             ▼
                         Operation

Decisions
────────────────────────────────────────►
Có thể tác động tới mọi layer trong toàn bộ vòng đời dự án.
```
