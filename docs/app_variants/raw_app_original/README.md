# Raw App Original

`docs/app_variants/raw_app_original/` là origin model cho app documentation ở mức universal.

Folder này dùng để giữ:

- layer model ổn định có thể tái dùng qua nhiều project;
- concern folder canonical ở mức app docs;
- generic entity-type taxonomy không phụ thuộc methodology.

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

- [00-context](00-context/README.md)
- [01-business](01-business/README.md)
- [02-product](02-product/README.md)
- [03-interface](03-interface/README.md)
- [04-domain](04-domain/README.md)
- [05-architecture](05-architecture/README.md)
- [06-technical](06-technical/README.md)
- [07-implementation](07-implementation/README.md)
- [08-quality](08-quality/README.md)
- [09-operation](09-operation/README.md)
- [10-decisions](10-decisions/README.md)

## Rule

- Concern ở đây phải đủ universal để nhiều archetype project dùng chung tên folder.
- Raw origin materialize concern và sub-concern universal có prefix số (ví dụ `03-premises/01-assumptions/`).
- Không materialize entity-type folder plural (`assumptions/`, `modules/`, …) hoặc entity instance; các path đó thuộc registry/template hoặc app truth tương ứng.
- Generic entity type trong folder này là baseline tái dùng, không phải entity type canonical trong `docs/meta/`.
- Entity type phụ thuộc methodology nằm trong pattern extension tương ứng.
- Khi current project truth thay đổi, cập nhật `docs/app/` trước; chỉ cập nhật folder này khi universal model thật sự đổi.
- Historical alias chỉ được giữ ở compatibility/provenance docs, không tạo lại path cũ trong folder này.

## Generic Taxonomy Hiện Có

- [06-technical/](06-technical/README.md)
- [08-quality/](08-quality/README.md)
- [09-operation/](09-operation/README.md)
