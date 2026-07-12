# Workflows

<a id="luong-tong"></a>
## Luồng tổng

```text
read-for-task
-> sync-product-change khi task từ code/incident/product behavior
-> canonical-home gate
   resolved -> write-docs khi có thay đổi knowledge
            -> trace-impact khi có entity/relation/impact
            -> validate-after-change
            -> handoff/review
   undetermined-placement -> use-workbench khi project đã kích hoạt
                          -> canonical handoff quay lại luồng trên

side branch:
  slim-layer-readme khi README layer bị phình
```

Folder này mô tả cách thao tác với docs.

Khi viết knowledge unit mới, dùng kèm [unit-structure/](../unit-structure/README.md) (skeleton) và schema trong `docs/meta/00-schemas/`.

## Decision matrix

| Loại task | Luồng |
| --- | --- |
| Chỉ cần hiểu | [read-for-task](read-for-task.md) |
| Sửa prose / knowledge không đổi product behavior | read-for-task → [write-docs](write-docs.md) → [validate-after-change](validate-after-change.md) |
| Code / incident / product behavior change | read-for-task → [sync-product-change](sync-product-change.md) → write-docs → [trace-impact](trace-impact.md) (nếu cần) → validate-after-change |
| Thêm/sửa entity hoặc relation | read-for-task → write-docs → trace-impact → validate-after-change |
| Slim layer README | read-for-task → [slim-layer-readme](slim-layer-readme.md) → validate-after-change |
| Canonical home chưa xác định và project đã kích hoạt Workbench | [use-workbench](use-workbench.md) → handoff về luồng phù hợp ở trên |

## File

| File | Khi dùng |
| --- | --- |
| [read-for-task.md](read-for-task.md) | Cần đọc docs cho một task cụ thể. |
| [sync-product-change.md](sync-product-change.md) | Task bắt đầu từ code, incident hoặc product behavior change. |
| [write-docs.md](write-docs.md) | Cần thêm hoặc sửa knowledge. |
| [trace-impact.md](trace-impact.md) | Cần kiểm tra impact/coverage/consistency. |
| [validate-after-change.md](validate-after-change.md) | Terminal gate sau sửa/trace/slim. |
| [slim-layer-readme.md](slim-layer-readme.md) | Maintenance: giảm lặp trong layer README. |
| [use-workbench.md](use-workbench.md) | Conditional core: undetermined-placement khi project đã kích hoạt Workbench. |

## Nhánh và conditional

`sync-product-change` là intake trước `write-docs` cho nhánh behavior. Task prose không đổi behavior **không** bắt buộc chạy sync.

`slim-layer-readme` không phải bước cuối của mọi thay đổi; chỉ chạy khi README layer phình hoặc lặp generic.

`use-workbench.md` là nhánh có điều kiện của Luồng tổng khi canonical home chưa xác định và local decision đã kích hoạt Workbench. Workbench hỗ trợ maturation/staging, không tạo luồng canonical song song và phải handoff lại các workflow ở trên. Chi tiết khái niệm: [workbench-model.md](../concepts/workbench-model.md).

Sau [write-docs](write-docs.md), emit `write-docs result` (short hoặc full theo ceremony matrix) trước khi sang [trace-impact](trace-impact.md) hoặc [validate-after-change](validate-after-change.md).
