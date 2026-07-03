# Trade-offs và anti-patterns

## Trade-off đã chấp nhận

### Shared SQLite trong Lite

Chấp nhận:

- Một SQLite application database.
- Một Node.js service.
- Transaction nội bộ đơn giản.
- Một số read SQL chéo bảng theo tier/allowlist.

Không chấp nhận:

- Module nào cũng ghi mọi bảng.
- Bỏ qua owner API vì "cùng DB".
- Dùng SQL direct để copy business rule của owner.

### Read performance vs isolation

Dashboard và Jira dry-run/sync cần snapshot nhanh, rõ, ít round-trip nội bộ. Vì vậy Lite giữ một số read trực tiếp:

- Dashboard Tier 2 reporting read-only.
- Jira Tier 3 sync snapshot read-only.

Nhưng các read này phải có governance:

- allowlist;
- comment tier nếu cần;
- không kèm write foreign table;
- có trigger migrate sang owner API/read model khi coupling tăng.

### Compatibility route

Một số URL cũ vẫn phải giữ để không phá Admin UI/API contract.

Chấp nhận:

```text
compat route/module A -> ModuleBApi
```

Điều kiện:

- Có comment `TODO compatibility wrapper`.
- Nêu module sở hữu thật.
- Không thêm business logic ở wrapper.
- Không dùng pattern này cho capability mới.

## Anti-patterns cần tránh

### Big ball of mud trong vỏ module

Dấu hiệu:

- Folder module có nhưng import chéo internals.
- Module A gọi repository của module B.
- Controller gọi nhiều module API và tự quyết định orchestration.
- Helper nghiệp vụ nằm trong `src/shared` để ai cũng dùng.

### Database-driven architecture

Dấu hiệu:

- Dev bắt đầu từ "bảng nào có data" thay vì "domain nào sở hữu use case".
- Module query/update bất kỳ bảng nào thấy tiện.
- Business rule nằm trong SQL rải rác nhiều repository.
- Schema change nhỏ làm nhiều module vỡ vì query private table.

### API facade sai ownership

Dấu hiệu:

- `CisApi` có method chỉ gọi `TranslationApi`.
- `BacklogApi` có method retry/cancel job thuộc Sync.
- Module API trở thành "service locator" của cả app.

### External adapter owns business state

Dấu hiệu:

- `JiraClient` hoặc `JiraSyncRepository` tự set `issues.sync_status`.
- Backlog/Jira adapter tự tạo anomaly hoặc mapping rule mà không qua owner use case.
- AI transport tự ghi translation review state.

### Translation biết quá nhiều về CIS

Dấu hiệu:

- Translation import `CisRepository`.
- Translation tự merge `fields_json`.
- Translation tự apply reviewed text vào canonical issue.

Quyết định đúng: Translation giữ review lifecycle, CIS apply canonical.

### Dashboard trở thành workflow engine

Dấu hiệu:

- Dashboard không chỉ count mà còn update job/anomaly/translation.
- Dashboard query chứa business decision phức tạp của Mapping/Anomaly/Sync.

Dashboard Tier 2 là read-only reporting, không phải orchestration.

## Rủi ro của MM-PH

| Rủi ro | Cách giảm |
| --- | --- |
| Read allowlist bị mở rộng tùy tiện | Mỗi read exception phải cập nhật `data_ownership.md` |
| Schema change làm Dashboard/Jira read bundle vỡ | Review query allowlist khi migration |
| Dev copy pattern SQL direct | Audit write/read và PR checklist |
| `translation_queue` ownership mơ | Document storage primitive tạm, không mở rộng lifecycle trên CIS |
| Khó extract service nhanh | Dùng owner API/read model dần ở các điểm có trigger |

## Trigger nâng cấp strict hơn

Khi một trigger xảy ra, phải giảm direct SQL và tăng owner API/read model:

| Trigger | Hành động |
| --- | --- |
| Extract module thành service/process riêng | Tách schema/DB hoặc chỉ expose API/event |
| Schema migration gây lỗi cross-module >= 2 lần/quý | Thay SQL bằng owner read API/read model |
| Dashboard/reporting phức tạp | Dùng projection/warehouse |
| Team deploy độc lập theo domain | Database-per-module hoặc schema/role |
| Test module cần cô lập khỏi SQLite shared | Mock qua public API |
| Security/permission cần giới hạn data theo domain | Tách schema/role hoặc service boundary |

## Checklist review kiến trúc

Khi review PR/task modular monolith, hỏi:

1. Use case này thuộc domain nào?
2. State nào bị ghi và module owner là ai?
3. Controller có gọi đúng module chủ quản route không?
4. Có import sâu module khác không?
5. Public API mới có đúng ownership không hay chỉ proxy?
6. Direct SQL chéo bảng có thuộc allowlist/tier không?
7. External API call có nằm trong adapter đúng module không?
8. Job/action quan trọng có journal/audit/correlation id không?
9. Dry-run/pre-check có trước outbound thật không?
10. Thay đổi này có làm Medium/Full khó kế thừa không?

