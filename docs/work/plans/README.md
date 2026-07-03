# Kế hoạch phát triển

Thư mục này chia kế hoạch triển khai Central Sync Hub/CIS thành 3 phiên bản kế thừa nhau:

```text
Lite -> Medium -> Full
```

Mỗi phiên bản nằm trong một thư mục riêng:

- [architecture](../../architecture/README.md) - ngôn ngữ kiến trúc chung; source of truth cho custom modular monolith nằm tại [../../architechture/custom_modular_monolith/overview.md](../../architechture/custom_modular_monolith/overview.md).
- [lite](lite/README.md) - bản nhỏ nhất, dùng manual/scheduled pull để chạy Backlog -> CIS -> Review -> Jira.
- [medium](medium/README.md) - bản MVP vận hành hằng ngày, thêm webhook Backlog/Jira và Jira -> CIS trên nền Lite.
- [full](full/README.md) - bản mở rộng hai chiều đầy đủ, có CIS -> Backlog, learning/operation/reporting sâu hơn.

## Nguyên tắc kế thừa

1. Lite vẫn phải dùng CIS làm trung tâm, không quay lại mô hình Backlog gọi Jira trực tiếp.
2. Tên bảng, trạng thái và field hướng sync phải đi theo tài liệu hiện có, đặc biệt là `direction_from` và `direction_to`.
3. Schema nên được thiết kế để Medium/Full mở rộng bằng migration nhỏ, không phải đổi lại mô hình dữ liệu.
4. Manual pull, scheduled pull, webhook và worker dùng chung normalizer theo source khi các cơ chế đó được bật.
5. Outbound thật luôn đi sau dry-run và pre-check.
6. AI chỉ đề xuất hoặc tạo draft; các quyết định sync quan trọng vẫn qua admin review/approval.
7. Các tính năng chưa bật ở Lite nên để dạng module/config flag, không viết tắt kiểu khó mở rộng.

## Tóm tắt phạm vi

| Nhóm | Lite | Medium | Full |
| --- | --- | --- | --- |
| Luồng chính | Backlog pull -> CIS -> Jira | Backlog webhook/pull -> CIS, Jira webhook/pull -> CIS, CIS -> Jira | Backlog <-> CIS <-> Jira đầy đủ |
| Inbound trigger | Manual pull, scheduled pull optional | Webhook + manual pull + scheduled recovery | Webhook + pull + replay/rollback |
| Đối tượng | Issue, comment; attachment metadata và file Backlog -> CIS cơ bản | Issue, comment, attachment upload/sync sang Jira | Issue, comment, attachment, link, field nâng cao |
| Translation | Nhật -> Việt, AI draft + human review/manual-edit | Nhật -> Việt đầy đủ cho issue/comment, provider fallback có kiểm soát | Nhật <-> Việt, học từ review, glossary nâng cao |
| Mapping | Mapping seed/manual, approve trước sync | AI propose + admin approve + bulk approve | Mapping learning, stale/conflict health, project override sâu |
| Anomaly | Tối thiểu: routing mismatch, mapping gap, sync failure | Đủ nhóm anomaly MVP | AI analysis sâu, rule tuning, notification ngoài UI |
| UI | Admin tối thiểu để chạy luồng | Admin UI đầy đủ theo MVP | UI vận hành, role, notification, report |
| Sync safety | Dry-run Jira, retry cơ bản | Retry/backoff đầy đủ, conflict policy, journal đầy đủ | Queue nâng cao, project pause, rollback/replay tốt hơn |
| Runtime | 1 service Node/Express + SQLite | 1 service + worker nội bộ ổn định | Có thể tách worker, backup tự động, scale DB nếu cần |

## Kế hoạch phát triển đề xuất

### Giai đoạn 0: Nền kỹ thuật chung

Làm trước khi gọi là Lite:

1. App skeleton Express CommonJS.
2. Config/env loader.
3. SQLite connection + migration runner.
4. Storage directory bootstrap.
5. Correlation id middleware.
6. Error envelope.
7. Admin auth.
8. Project seed JSON.

### Giai đoạn 1: Lite

Tập trung vào một đường đi chạy được:

```text
Backlog manual pull / scheduled pull
  -> CIS issue/comment/attachment download cơ bản
  -> optional AI translation/Admin review
  -> Mapping check
  -> Jira dry-run
  -> Jira sync
```

Không mở rộng webhook/Jira inbound/attachment upload đầy đủ trước khi đường này ổn.

### Giai đoạn 2: Medium

Mở rộng theo đúng MVP:

1. Backlog webhook vào CIS, dùng lại Backlog normalizer của Lite.
2. Jira webhook/manual pull vào CIS.
3. Attachment upload/copy sang Jira và vận hành retry đầy đủ.
4. AI mapping propose.
5. Anomaly detection đầy đủ.
6. UI vận hành đầy đủ.
7. Search, backup docs, retention.

### Giai đoạn 3: Full

Mở rộng sau khi Medium đã chạy ổn:

1. CIS -> Backlog.
2. Việt -> Nhật review/publish.
3. Learning nâng cao.
4. Notification ngoài UI.
5. Scale worker/DB nếu cần.
6. Role, reporting, integration mới.

## Ranh giới quan trọng

- Lite không được bỏ CIS hoặc bỏ audit, vì như vậy Medium sẽ phải viết lại.
- Medium không nên làm CIS -> Backlog vội; việc này thuộc Full để tránh rủi ro publish nhầm cho khách hàng.
- Full không nên biến AI thành người quyết định cuối cùng; AI chỉ propose/draft/analyze, admin hoặc policy đã duyệt mới quyết định.
- Attachment fail không block issue sync trong Lite/Medium, trừ khi sau này project config đánh dấu attachment là required.
- Dry-run là cổng an toàn bắt buộc trước khi sync Jira thật.
