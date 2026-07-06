# Custom Modular Monolith Knowledge Base

Folder này là knowledge base nền cho pattern `custom_modular_monolith_theory`.

Mục tiêu của folder này là giữ:

- lý thuyết chung của pattern;
- ngôn ngữ module và boundary;
- template thiết kế;
- checklist generic khi sửa code theo modular monolith.

Folder này không phải nơi chốt kiến trúc riêng của một repo cụ thể. Mọi quyết định áp dụng cụ thể phải nằm ở architecture guide của repo đó.

## Thứ tự đọc

1. [theory.md](theory.md) - lý do tồn tại của pattern và hướng Pragmatic Hybrid.
2. [knowledge_boundary.md](knowledge_boundary.md) - ranh giới tri thức của folder này.
3. [design_axioms.md](design_axioms.md) - các tiên đề thiết kế chung.
4. [concepts.md](concepts.md) - khái niệm nền như module, owner API, application database.
5. [module_structure.md](module_structure.md) - cấu trúc module generic.
6. [boundary_model.md](boundary_model.md) - import boundary, API boundary, data tier và transaction boundary.
7. [data_ownership.md](data_ownership.md) - cách document ownership và read allowlist theo kiểu generic.
8. [flow_examples.md](flow_examples.md) - ví dụ generic cho các loại flow thường gặp.
9. [module_design_template.md](module_design_template.md) - template thiết kế module/capability mới.
10. [flow_template.md](flow_template.md) - template generic để mô tả flow.
11. [evolution.md](evolution.md) - cách một modular monolith tiến hóa theo các giai đoạn.
12. [tradeoffs_and_antipatterns.md](tradeoffs_and_antipatterns.md) - trade-off và anti-pattern cần tránh.
13. [implement_rules.md](implement_rules.md) - checklist generic khi sửa code module.

## Cách dùng

- Nếu cần hiểu pattern tổng quát, đọc folder này.
- Nếu cần biết repo hiện tại áp dụng pattern ra sao, quay lại `docs/architecture/*`.
