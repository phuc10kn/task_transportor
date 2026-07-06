# Architecture Guide

Folder `docs/architecture` là source of truth cho cách `task_transportor` áp dụng kiến trúc.

Ở đây có hai lớp tài liệu:

- `docs/architecture/*`: quyết định kiến trúc riêng của repo hiện tại.
- `docs/architecture/custom_modular_monolith_theory/*`: knowledge base nền về pattern `custom_modular_monolith_theory`, có thể tái dùng cho repo khác.

Tài liệu trong folder này không thay thế spec chi tiết của từng version trong `docs/work`, nhưng là nơi chốt repo này dùng pattern như thế nào, boundary hiện tại ra sao và các flow chính được triển khai theo hướng nào.

## Thứ tự đọc

1. [01-direction.md](01-direction.md) - phương hướng kiến trúc và product model của repo.
2. [02-module-structure.md](02-module-structure.md) - cấu trúc module canonical và bản đồ domain hiện tại.
3. [04-boundaries.md](04-boundaries.md) - boundary, ownership, read allowlist và AI/Translation boundary của repo.
4. [05-flow-template.md](05-flow-template.md) - bản đồ flow và cách repo dùng workflow architecture.
5. [workflows/README.md](workflows/README.md) - danh sách workflow hiện tại, mỗi file mô tả một workflow riêng.
6. [06-evolution.md](06-evolution.md) - cách Lite, Medium, Full kế thừa cùng kiến trúc trong repo này.
7. [07-boundary-cleanup.md](07-boundary-cleanup.md) - backlog cleanup boundary còn lại của repo.
8. [custom_modular_monolith_theory/overview.md](custom_modular_monolith_theory/overview.md) - knowledge base nền về pattern.
9. [custom_modular_monolith_theory/implement_rules.md](custom_modular_monolith_theory/implement_rules.md) - checklist generic khi sửa code module.
10. [custom_modular_monolith_theory/module_design_template.md](custom_modular_monolith_theory/module_design_template.md) - template generic khi thiết kế module/capability mới.

## Tóm tắt

- Hướng triển khai của repo: **custom modular monolith**.
- Product model của repo: **System -> CIS -> System**.
- `custom_modular_monolith_theory` giải thích pattern chung; `docs/architecture/*` chốt cách repo này áp dụng pattern đó.
- External systems là adapter; CIS là lõi nghiệp vụ của sản phẩm hiện tại.
- Mọi action quan trọng cần job, journal hoặc audit theo boundary của repo.
