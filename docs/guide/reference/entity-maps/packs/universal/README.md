# Universal App Base

## Mục Đích

Base này giữ source stable xuyên dự án cho:

- layer model có thể tái dùng;
- concern folder và sub-concern universal;
- generic entity-type taxonomy không phụ thuộc methodology.

Base không giữ project decision, runtime truth, entity instance, migration history hoặc local lifecycle.

## Layer Index

- [00-context](00-context/README.md)
- [01-business](01-business/README.md)
- [02-product](02-product/README.md)
- [03-interface](03-interface/README.md)
- [04-domain](04-domain/README.md)
- [05-architecture](05-architecture/README.md)
- [06-technical](06-technical/README.md)
- `07-implementation` — không có universal pack; concern folder chỉ ở [folder-structure.md](../../folder-structure.md#07-implementation)
- [08-quality](08-quality/README.md)
- [09-operation](09-operation/README.md)
- [10-decisions](10-decisions/README.md)

## Boundary

- Concern trong base phải đủ universal để nhiều project archetype dùng chung tên folder.
- `docs/guide/reference/folder-structure.md` là route cho layer/concern universal; base giữ taxonomy/template bổ sung.
- `07-implementation` không có universal pack taxonomy/entity type; chỉ concern folder ở `folder-structure.md`.
- Generic taxonomy trong base không tự là entity type active trong `docs/meta/`.
- Type phụ thuộc methodology thuộc methodology base tương ứng.
- Chỉ bổ sung hoặc thay đổi source khi meaning đã được review là reusable; project migration và local application không phải evidence nằm trong base.

## Generic Taxonomy

Generic taxonomy hiện có tại:

- [06-technical](06-technical/README.md)
- [08-quality](08-quality/README.md)
- [09-operation](09-operation/README.md)
