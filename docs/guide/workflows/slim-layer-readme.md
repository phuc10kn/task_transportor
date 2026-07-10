# Slim Layer README

## Mục Tiêu

Layer README là entry point của layer, không phải manual toàn hệ docs.

Muốn giảm lặp, chuyển phần generic sang `docs/guide`, rồi layer README chỉ giữ phần riêng:

- app truth hiện tại;
- routing ngắn tới universal concern baseline, entity type canonical và relation rule canonical;
- rule riêng của layer;
- link tới `docs/guide` cho cách dùng docs;
- link tới `docs/meta` cho rule/schema/convention canonical;
- link tới `docs/theories` và `docs/app/10-decisions` khi cần reasoning/rationale.

Nếu trong lúc slim phát hiện thiếu canonical schema/rule/convention, xử lý riêng trong `docs/meta`. Không dùng `docs/meta` làm nơi chứa giải thích generic.

## Điều Kiện Trước Khi Slim

Đọc trước:

```text
docs/guide/reference/folder-structure.md
docs/guide/reference/layer-readme-template.md
```

Layer README phải dùng path layer/concern universal có prefix số từ `docs/guide/reference/folder-structure.md`, ví dụ:

```text
00-context/01-overview/
01-business/04-behavior/
02-product/05-specification/
```

Entity type folder bên dưới concern lấy từ meta hoặc cấu trúc local đã được project chốt. Không viết path universal rút gọn như `overview/`, `behavior/`, `specification/` nếu đang nói folder thật.

## Giữ Lại Trong Layer README

- Vai trò layer trong repo.
- App truth hiện tại của layer.
- Routing ngắn tới universal concern baseline, entity type canonical và relation rule canonical.
- Rule riêng của layer.
- Link tới `docs/guide` cho cách dùng docs.
- Link tới `docs/meta` khi layer README cần nhắc canonical rule/schema/convention.
- Link tới `docs/theories` và `docs/app/10-decisions` khi layer có theory/decision basis.

## Thay Bằng Link Guide

- Giải thích `Layer -> Concern -> Entity Type -> Entity Instance`.
- Quan hệ generic giữa mọi layer.
- Giải thích chung về relation type/valid triple.
- Workflow đọc/sửa/validate docs chung.
- Agent reading strategy chung.
- Universal concern baseline và lý do từng concern tồn tại.

Canonical relation rule vẫn thuộc `docs/meta`.

## Workflow

```text
1. Đọc layer README.
2. Đọc docs/guide/reference/folder-structure.md cho layer đó.
3. Đánh dấu đoạn generic vs app-specific.
4. Kiểm tra đoạn generic đã có trong docs/guide chưa.
5. Nếu chưa có, thêm vào docs/guide trước.
6. Kiểm tra concern path khớp docs/guide/reference/folder-structure.md.
7. Rút gọn layer README thành app truth + routing + rule + link.
8. Không xóa app truth hoặc rule riêng của layer.
```

## Thứ Tự Migrate Đề Xuất

Không slim toàn bộ layer cùng lúc nếu chưa có review giữa các bước.

Thứ tự mặc định:

```text
1. 00-context
2. 01-business
3. 02-product
4. 10-decisions
5. 05-architecture
6. 08-quality
7. 06-technical
8. 07-implementation
9. 09-operation
10. 03-interface
11. 04-domain
```

Lý do:

- `00-02` là đường đọc đầu tiên của product truth.
- `10-decisions` giữ rationale khi rút gọn các layer khác.
- `05` và `08` thường được code/task dùng nhiều.
- `03` và `04` nên làm sau nếu chưa có nhiều instance sống.

## Checklist Pass/Fail

| Check | Pass khi |
| --- | --- |
| App truth giữ lại | Scope/rule/behavior hiện hành của layer vẫn còn trong README hoặc entity canonical. |
| Generic explanation đã có home | Đoạn generic bị xóa đã có trong `docs/guide`. |
| Universal baseline đúng | Concern path dùng prefix số đúng với `docs/guide/reference/folder-structure.md`; type path route về meta hoặc cấu trúc local đã được project chốt. |
| Routing concern còn rõ | README trỏ tới universal concern baseline của layer. |
| Entity type routing còn rõ | README trỏ tới entity type definition canonical, không giải thích lại meaning/criteria. |
| Canonical links đủ | README trỏ đúng vai trò: guide cho cách dùng, meta cho canonical rule, theory/decision cho reasoning. |
| No hidden decision | Không xóa rationale mà chưa chuyển sang `docs/app/10-decisions`. |
| No unowned content | Nội dung chưa có canonical home không bị biến thành rule. |
| Search path còn tốt | Stable ID/path quan trọng vẫn search được bằng `rg`. |

Fail nếu:

- README chỉ còn link mà không nói layer này giữ app truth gì;
- rule riêng của layer bị chuyển vào guide generic;
- guide copy lại quá nhiều app-specific content;
- README tạo structure song song như `overview/` thay vì `01-overview/`;
- người đọc phải mở nhiều hơn trước để hiểu scope hiện hành.

## Example Skeleton

```md
# 00-context

## Vai Trò

Layer này giữ bối cảnh nền của <Project Name>.

## App Truth Hiện Tại

...

## Routing Nhanh

| Cần tìm | Đọc |
| --- | --- |
| Universal concern baseline của context | [00-context trong folder-structure.md](../reference/folder-structure.md#00-context) |
| Entity type canonical | docs/meta/01-entity-types/ |
| Relation rule canonical | docs/meta/02-relation-types/ và docs/meta/03-rules/ |

## Entity Index

| Entity type | Canonical definition |
| --- | --- |
| Application | docs/meta/01-entity-types/... |

## Cách Dùng

- Universal concern baseline: docs/guide/reference/folder-structure.md
- Mô hình layer/entity chung: docs/guide/concepts/layer-model.md
- Cách đọc theo task: docs/guide/workflows/read-for-task.md
- Context-specific rules: ...
```
