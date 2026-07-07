# 05 - Architecture

## Mục tiêu

Thư mục này dựng `khung entity type chuẩn` cho `custom_modular_monolith`, rồi dùng `task_transportor` làm ngữ liệu minh họa.

Trọng tâm không còn là chụp nhanh codebase theo 1 bucket mỗi concern, mà là:

- chuẩn hóa taxonomy architecture dùng lại được;
- giữ instance code hiện tại như ví dụ phụ;
- bám theory của custom modular monolith nhưng không tách rời repo thật.

## Mô hình áp dụng

Repo hiện tại đang vận hành theo hướng:

```text
System -> CIS -> System
```

Đó là ngữ liệu tốt để minh họa taxonomy, nhưng không giới hạn taxonomy chỉ còn những gì repo đang instantiate hôm nay.

## Vai trò sau Phase 02

Folder này giữ template/taxonomy reusable cho custom modular monolith. Nội dung app-specific của `task_transportor` nằm ở `docs/app/05-architecture`; reasoning theory nền nằm ở `docs/theories/modular-architecture`.

Không dùng folder này làm source of truth cho module thật của repo nếu nội dung đó đã có entity instance trong `docs/app/05-architecture`.

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
- `task_transportor` hiện mới instantiate mạnh ở một số type tổng quát như `Module`, `ModuleBoundary`, `InteractionFlow`, `StateOwner`, `DataFlow`, `DeploymentUnit`, `CrossCuttingRule`.
- Các type chi tiết hơn vẫn được định nghĩa để làm khung chuẩn cho các repo hiện tại và tương lai.

## Evidence Phase 02

Phase 02 chỉ chốt vai trò của folder này là template/taxonomy reusable và tách nó khỏi app-specific truth. Deep import từ legacy theory folder vẫn thuộc Phase 05 theo `docs/plans/migrate_new_docs/migration_matrix.md`.

Nguồn đối chiếu hiện tại:

- `docs/app_technical/custom_modular_monolith/**`
- `docs/theories/modular-architecture/**`
- `docs/app/05-architecture/**`

## Chỉ mục nhanh

- [01-structure](./01-structure/README.md)
- [02-boundaries](./02-boundaries/README.md)
- [03-interactions](./03-interactions/README.md)
- [04-state](./04-state/README.md)
- [05-data](./05-data/README.md)
- [06-deployment](./06-deployment/README.md)
- [07-cross-cutting](./07-cross-cutting/README.md)
