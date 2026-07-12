# Quick Start

## Nếu bạn chỉ muốn hiểu app hiện tại

Đọc:

```text
docs/app/00-context/README.md
docs/app/01-business/README.md
docs/app/02-product/README.md
docs/app/10-decisions/README.md
```

Sau đó mở layer liên quan task.

## Nếu bạn muốn hiểu cách docs được tổ chức

Đọc:

```text
docs/guide/concepts/documentation-architecture.md
docs/guide/concepts/layer-model.md
docs/guide/concepts/entity-model.md
docs/guide/concepts/relation-model.md
docs/guide/reference/folder-structure.md
```

## Nếu bạn muốn sửa docs

Trước hết, đọc [Luồng vận hành chuẩn](../README.md#luồng-vận-hành-chuẩn).

Đọc:

```text
docs/guide/workflows/read-for-task.md
docs/guide/reference/folder-map.md
docs/guide/reference/folder-structure.md
docs/guide/workflows/write-docs.md
docs/guide/workflows/trace-impact.md
docs/guide/workflows/validate-after-change.md
docs/guide/unit-structure/
```

## Nếu code hoặc product behavior đổi

Đọc thêm:

```text
docs/guide/workflows/sync-product-change.md
```

Luồng:

```text
read-for-task
→ sync-product-change
→ write-docs
→ trace-impact (nếu cần)
→ validate-after-change
```

Prose không đổi behavior bỏ qua sync.

Sau `write-docs`, emit `write-docs result`: short form cho typo/link/wording; full form cho entity/relation/meta/decision hoặc thay đổi đã qua sync.

## Nếu bạn muốn thêm relation hoặc entity type

Đọc canonical meta trước:

```text
docs/meta/README.md
docs/meta/00-schemas/
docs/meta/01-entity-types/
docs/meta/02-relation-types/
docs/meta/03-rules/
docs/meta/04-conventions/
docs/guide/unit-structure/
```

Guide chỉ giúp định hướng, không thay meta.

## Nếu project có nội dung chưa xác định được home

Không đưa thẳng vào app/theory/meta nếu chưa biết nó là app truth, meta rule hay theory. Khi project đã kích hoạt Workbench, dùng [use-workbench.md](../workflows/use-workbench.md); khái niệm xem [workbench-model.md](../concepts/workbench-model.md). Known-home local gap dùng `NOTE-*`.

## Tiếp theo trong getting-started

1. [introduction.md](introduction.md) — bức tranh Meta / App / Theory và vì sao cần guide.
2. [first-doc-change.md](first-doc-change.md) — checklist đổi docs đầu tiên an toàn.
