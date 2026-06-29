# Architecture Guide

Architecture là ngôn ngữ chung để phát triển toàn bộ Central Sync Hub/CIS qua các phiên bản Lite, Medium và Full.

Tài liệu này không thay thế spec chi tiết của từng phiên bản. Nó chỉ chốt phương hướng phát triển, cách chia module, template khi thêm chức năng mới và các luật để codebase vẫn tiến hóa theo một hướng.

## Thứ tự đọc

1. [01-direction.md](01-direction.md) - phương hướng kiến trúc chung.
2. [02-module-structure.md](02-module-structure.md) - chuẩn chia folder/module.
3. [03-module-template.md](03-module-template.md) - template phát triển một module hoặc capability mới.
4. [04-boundaries.md](04-boundaries.md) - luật boundary và dependency.
5. [05-flow-template.md](05-flow-template.md) - template mô tả luồng System -> CIS -> System.
6. [06-evolution.md](06-evolution.md) - cách Lite, Medium, Full kế thừa cùng kiến trúc.

## Tóm tắt

- Hướng triển khai: **modular monolith**.
- Runtime ban đầu: một Node.js service.
- Database ban đầu: SQLite.
- Core model: **System -> CIS -> System**.
- External systems là adapter; CIS là lõi nghiệp vụ.
- Mọi action quan trọng cần job/journal/audit.
- AI propose/draft/analyze; human hoặc policy đã duyệt quyết định.
