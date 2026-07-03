# Architecture Guide

Architecture là ngôn ngữ chung để phát triển toàn bộ Central Sync Hub/CIS qua các phiên bản Lite, Medium và Full.

Tài liệu này không thay thế spec chi tiết của từng phiên bản. Nó chỉ chốt phương hướng phát triển, cách chia module, template khi thêm chức năng mới và các luật để codebase vẫn tiến hóa theo một hướng.

Source of truth cho thiết kế `custom_modular_monolith` nằm tại [../architechture/custom_modular_monolith/overview.md](../architechture/custom_modular_monolith/overview.md). Các file trong folder architecture này giữ vai trò guide chung hoặc pointer compatibility; không cập nhật lý thuyết modular monolith rải rác tại đây.

## Thứ tự đọc

1. [01-direction.md](01-direction.md) - phương hướng kiến trúc chung.
2. [../architechture/custom_modular_monolith/module_structure.md](../architechture/custom_modular_monolith/module_structure.md) - chuẩn chia folder/module.
3. [../architechture/custom_modular_monolith/implement_rules.md](../architechture/custom_modular_monolith/implement_rules.md) - luật bắt buộc chống import chéo module internals và data/write ownership.
4. [../architechture/custom_modular_monolith/module_design_template.md](../architechture/custom_modular_monolith/module_design_template.md) - template phát triển một module hoặc capability mới.
5. [../architechture/custom_modular_monolith/boundary_model.md](../architechture/custom_modular_monolith/boundary_model.md) - luật boundary và dependency.
6. [../architechture/custom_modular_monolith/flow_template.md](../architechture/custom_modular_monolith/flow_template.md) - template mô tả luồng System -> CIS -> System.
7. [../architechture/custom_modular_monolith/evolution.md](../architechture/custom_modular_monolith/evolution.md) - cách Lite, Medium, Full kế thừa cùng kiến trúc.

## Tóm tắt

- Hướng triển khai: **custom modular monolith** theo [../architechture/custom_modular_monolith/overview.md](../architechture/custom_modular_monolith/overview.md).
- Runtime ban đầu: một Node.js service.
- Database ban đầu: SQLite.
- Core model: **System -> CIS -> System**.
- External systems là adapter; CIS là lõi nghiệp vụ.
- Mọi action quan trọng cần job/journal/audit.
- AI propose/draft/analyze; human hoặc policy đã duyệt quyết định.
