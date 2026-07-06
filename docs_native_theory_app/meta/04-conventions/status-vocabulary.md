# Status Vocabulary

## Entity instance (chung)

```text
draft       → đang soạn, chưa review
active      → canonical, đang hiệu lực
deprecated  → không dùng cho instance mới
superseded  → thay bằng instance khác
retired     → kết thúc vòng đời
closed      → hoàn tất (scope, problem)
```

## Theo Entity Type

Một số type có lifecycle riêng — xem file trong `01-entity-types/`:

```text
Assumption:  active → validated | invalidated | retired
Goal:        draft → active → achieved | abandoned
Release:     planned → in_progress → released → closed
```

## Theory root catalog

```text
planned      → thuộc active target set nhưng folder theory chưa materialize
materialized → folder theory đã tồn tại đủ cấu trúc chuẩn
active       → theory đã materialize và đang được app docs route về
deprecated   → không dùng cho theory reference mới
superseded   → thay bằng theory group khác
```

## Không dùng

```text
done, finished, ok, wip   (không canonical)
```

Dùng NOTE-OPEN nếu status vocabulary cho type chưa chốt.
