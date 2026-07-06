# Boundary Cleanup Plan

File này mô tả backlog cleanup boundary còn lại của `task_transportor`.

Mục tiêu:

- Không refactor toàn bộ sang strict "mọi read qua API".
- Sửa mọi cross-module write còn lại.
- Tách presentation leakage khỏi owner sai.
- Giữ read allowlist có document rõ.

## Baseline đã xong

| Hạng mục | Trạng thái |
| --- | --- |
| Import chéo `application/infrastructure/support` | 0 vi phạm |
| `CisApi` proxy `TranslationApi` kiểu mới | Đã gỡ pattern mới |
| Route canonical Translation | `/api/v1/translations/issues/...` |
| Compat CIS routes | Gọi `TranslationApi` + TODO |
| AI Translation boundary | AI transport ở `src/infrastructure/ai` |

## Việc còn lại

| ID | Vấn đề | Tier | Hướng xử lý |
| --- | --- | --- | --- |
| P2-T0-JIRA | Jira infra còn write CIS state | T0 | Ghi qua `CisApi`, không write thẳng bảng owner |
| P2-T0-TRANS-SYNC | Translation còn đụng sync state sai owner | T0/T1 | Delete hoặc cancel qua `SyncApi`, read context qua owner API |
| P2-T4-EDITOR | Issue Editor còn chứa decoration sai owner | T4 | Dời view logic về module sở hữu thật |
| P2-T1-CTX | Translation context còn đọc chéo quá rộng | T1 | Thu gọn qua `CisApi` và `ProjectsApi` |
| P2-T3-JIRA-READ | Jira dry-run hoặc sync read bundle SQL | T3 | Giữ read-only + comment allowlist |
| P2-T2-DASH | Dashboard cross-table counts | T2 | Giữ read-only + comment allowlist |
| P2-E-QUEUE | Storage primitive `translation_queue` còn mơ | Governance | Giữ tạm, không mở rộng lifecycle trên CIS |

## Thứ tự đề xuất

```text
HH-0 Tier 0 write fix
  -> HH-1 Tier 4 Issue Editor composition
  -> HH-2 Tier 1 Translation context
  -> HH-3 Tier 2/3 document + harden
  -> HH-4 governance/tooling
```

## Definition of Done

- Không còn cross-module write sai owner.
- Read exception Tier 2 hoặc Tier 3 có allowlist và comment rõ.
- Translation context và presentation không nằm sai owner.
- Verify liên quan pass thật.
