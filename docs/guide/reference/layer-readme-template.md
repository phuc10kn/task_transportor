# Layer README Template

Template này dùng khi slim `docs/app/<layer>/README.md`.

Layer README sau cleanup vẫn là entry point của layer, nhưng không dạy lại toàn bộ documentation system. Structure chuẩn của folder con nằm ở:

```text
docs/guide/reference/folder-structure.md
```

## Template

```md
# <NN> - <Layer Name>

## Vai Trò

Layer này giữ <loại app knowledge> của Central Sync Hub.

Để hiểu mô hình layer/entity/relation và folder structure chuẩn, đọc:

- docs/guide/concepts/layer-model.md
- docs/guide/concepts/entity-model.md
- docs/guide/concepts/relation-model.md
- docs/guide/reference/folder-structure.md

## App Truth Hiện Tại

<Các statement hiện hành của layer này trong repo.>

Ví dụ:

- scope/rule/behavior/state hiện hành;
- Lite/MVP boundary nếu layer liên quan product;
- module/state/flow hiện hành nếu layer liên quan architecture;
- quality/operation gate nếu layer liên quan quality/operation.

## Routing Nhanh

| Cần tìm | Đọc |
| --- | --- |
| Folder structure của layer | `docs/guide/reference/folder-structure.md#<layer-anchor>` |
| Entity type canonical | `docs/meta/01-entity-types/` |
| Relation slot/type/triple canonical | Entity type `relations_template`, `docs/meta/02-relation-types/` và `docs/meta/03-rules/` |
| Unit template | `docs/guide/unit-structure/` |

## Entity Index

| Entity type | Canonical definition |
| --- | --- |
| `<EntityType>` | `docs/meta/01-entity-types/.../<entity-type>.md` |

Không viết meaning, criteria hoặc schema chi tiết ở đây; đặt trong entity type definition canonical.

## Rule Riêng Của Layer

- <Rule app-specific chỉ thuộc layer này.>

## Theory / Decision Basis

| Loại | Reference |
| --- | --- |
| Theory | `<TH-...>` |
| Decision | `<DEC-...>` hoặc `docs/app/10-decisions/README.md` |

## Cách Đọc / Sửa

- Cách đọc theo task: docs/guide/workflows/read-for-task.md
- Cách sửa docs: docs/guide/workflows/write-docs.md
- Cách trace impact: docs/guide/workflows/trace-impact.md
- Folder structure chuẩn: docs/guide/reference/folder-structure.md

## Không Đặt Ở Đây

- <Loại nội dung thuộc layer khác.>
- <Loại nội dung thuộc meta/theory/decision/candidate chưa chốt.>
```

## Section Bắt Buộc

| Section | Bắt buộc? | Lý do |
| --- | --- | --- |
| Vai trò | Có | Người đọc cần biết layer giữ gì. |
| App Truth Hiện Tại | Có | README vẫn phải có giá trị app-specific. |
| Routing Nhanh | Có | Điều hướng về guide/meta canonical thay vì lặp nội dung. |
| Entity Index | Có nếu layer có entity type riêng | Chỉ index path canonical, không giải thích lại entity. |
| Rule Riêng Của Layer | Có nếu có rule | Tránh mất rule khi slim. |
| Theory / Decision Basis | Có nếu layer chịu ảnh hưởng rõ | Giữ trace reasoning. |
| Cách Đọc / Sửa | Có | Link về guide thay prose generic. |
| Không Đặt Ở Đây | Nên có | Hữu ích khi layer dễ bị nhầm. |

## Anti-Pattern

Không slim thành:

```md
# 00-context

Xem docs/guide.
```

Vì layer README vẫn phải giữ app truth và routing riêng của layer.

Không tạo structure song song:

```text
overview/
scope/
premises/
```

Nếu path chuẩn là:

```text
01-overview/
02-scope/
03-premises/
```
