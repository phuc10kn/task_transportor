# Custom Modular Monolith cho task_transportor

Folder này là **source of truth** cho thiết kế `custom_modular_monolith` của `task_transportor`.

Mọi lý thuyết, luật triển khai, ownership, data tier, trade-off và kế hoạch cleanup liên quan tới custom modular monolith của dự án phải được đặt hoặc cập nhật trong folder này.

Không tạo thêm nguồn sự thật mới cho modular monolith ở nơi khác. Nếu cần thay đổi thiết kế `custom_modular_monolith`, cập nhật folder này trước, sau đó các tài liệu khác chỉ link về đây.

## Thứ tự đọc

1. [theory.md](theory.md) - định nghĩa custom modular monolith của dự án và lý do chọn Pragmatic Hybrid.
2. [knowledge_boundary.md](knowledge_boundary.md) - ranh giới tri thức của folder này: phần nào thuộc custom modular monolith, phần nào thuộc product/API/schema docs.
3. [design_axioms.md](design_axioms.md) - các tiên đề thiết kế dùng để suy luận khi gặp case mới.
4. [concepts.md](concepts.md) - khái niệm nền: module, bounded context, application database, integration database, owner API.
5. [module_structure.md](module_structure.md) - cấu trúc module, vai trò folder và domain Lite.
6. [boundary_model.md](boundary_model.md) - import/API/controller boundary, transaction boundary và data access tiers.
7. [data_ownership.md](data_ownership.md) - ownership bảng, read allowlist và hướng xử lý coupling dữ liệu.
8. [flow_examples.md](flow_examples.md) - áp dụng custom modular monolith vào các flow Backlog/CIS/Translation/Jira.
9. [module_design_template.md](module_design_template.md) - template thiết kế module/capability mới.
10. [flow_template.md](flow_template.md) - template thiết kế flow System -> CIS -> System.
11. [evolution.md](evolution.md) - cách Lite, Medium, Full kế thừa cùng kiến trúc.
12. [tradeoffs_and_antipatterns.md](tradeoffs_and_antipatterns.md) - trade-off đã chấp nhận, anti-pattern cần tránh và trigger nâng cấp strict hơn.
13. [implement_rules.md](implement_rules.md) - luật bắt buộc khi sửa/thêm code module.
14. [p2_cleanup_plan.md](p2_cleanup_plan.md) - kế hoạch cleanup boundary P2 theo hybrid.

## Định nghĩa ngắn

`task_transportor` là **Central Sync Hub** theo model:

```text
System -> CIS -> System
```

Ở Lite:

```text
Backlog manual/project pull
  -> CIS
  -> optional Translation review
  -> Jira dry-run
  -> CIS -> Jira
```

Kiến trúc triển khai là **Modular Monolith Pragmatic Hybrid**:

```text
Một Node.js service
Một SQLite application database
Nhiều domain module có public boundary rõ
Strict với import, HTTP/API ownership và write ownership
Pragmatic với một số read SQL chéo bảng có allowlist
```

## Cách dùng

Khi cần hiểu hoặc thay đổi thiết kế custom modular monolith, cập nhật các file trong folder này. Tài liệu ngoài folder chỉ nên trỏ vào đây.

Nếu task có đụng code module, đọc lại [implement_rules.md](implement_rules.md) trước khi code.
