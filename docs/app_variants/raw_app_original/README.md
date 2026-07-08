# Raw App Original

`docs/app_variants/raw_app_original/` là origin model cho app documentation ở mức universal.

Folder này dùng để giữ:

- layer model ổn định có thể tái dùng qua nhiều project;
- concern folder canonical ở mức app docs;
- boundary giữa concern universal và entity type project-specific.

Folder này không phải:

- source of truth hiện tại của `task_transportor`;
- pattern extension;
- nơi ghi project decision hay runtime truth riêng của một repo cụ thể.

## Vai Trò Trong Hệ Docs

- `docs/app_variants/raw_app_original/`: origin universal cho app docs.
- `docs/app_variants/custom_modular_monolith/`: pattern extension cho custom modular monolith.
- `docs/app/`: current project truth của `task_transportor`.
- `docs/guide/`: hướng dẫn cách đọc, viết, trace và evolve docs.
- `docs/meta/`: schema, relation, rule và convention canonical.

## Canonical Layer List

```text
00-context
01-business
02-product
03-interface
04-domain
05-architecture
06-technical
07-implementation
08-quality
09-operation
10-decisions
```

## Rule

- Concern ở đây phải đủ universal để nhiều archetype project dùng chung tên folder.
- Entity type bên trong concern được phép thay đổi theo project hoặc pattern.
- Khi current project truth thay đổi, cập nhật `docs/app/` trước; chỉ cập nhật folder này khi universal model thật sự đổi.
- Historical alias chỉ được giữ ở compatibility/provenance docs, không tạo lại path cũ trong folder này.
