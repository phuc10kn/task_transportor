# 05 - Architecture

## Mục tiêu

Thư mục này dựng candidate entity-type taxonomy cho `custom_modular_monolith`.

Trọng tâm không còn là chụp nhanh codebase theo 1 bucket mỗi concern, mà là:

- chuẩn hóa taxonomy architecture dùng lại được;
- không bao gồm entity instance của một application;
- bám theory của custom modular monolith.

## Vai Trò Hiện Tại

Folder này giữ template/taxonomy candidate cho custom modular monolith. Entity instance thuộc application instance space; reasoning theory nền nằm ở `docs/theories/modular-architecture`.

## Cấu trúc concern

```text
05-architecture/
|-- 01-structure/
|-- 02-boundaries/
|-- 03-interactions/
|-- 04-state/
|-- 05-data/
|-- 06-deployment/
`-- 07-cross-cutting/
```

## Quy ước tài liệu trong folder này

- Mỗi concern có thể có nhiều `entity type`.
- Một số type là `type nền` cho mọi custom modular monolith.
- Không chứa entity instance.
- Mọi candidate type cần được review trước khi promote vào canonical registry.

## Nguồn Đối Chiếu

- `docs/app_variants/custom_modular_monolith/**`
- `docs/theories/modular-architecture/**`

## Chỉ mục nhanh

- [01-structure](./01-structure/README.md)
- [02-boundaries](./02-boundaries/README.md)
- [03-interactions](./03-interactions/README.md)
- [04-state](./04-state/README.md)
- [05-data](./05-data/README.md)
- [06-deployment](./06-deployment/README.md)
- [07-cross-cutting](./07-cross-cutting/README.md)
