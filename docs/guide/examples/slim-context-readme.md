# Example: Slim `00-context` README

Ví dụ này minh họa cách rút gọn một layer README dài mà không làm mất app truth.

Không copy nguyên nội dung hiện tại. Đây là pattern before/after.

## Before

README layer đang giữ cả:

- mô tả Context layer;
- Central Sync Hub context hiện tại;
- cấu trúc concern;
- giải thích `Layer -> Concern -> Entity Type -> Entity Instance`;
- quan hệ generic với Business/Product/UI/Domain/Architecture/Quality/Decision;
- nguyên tắc chung như Scope phải có Out of Scope, Assumption không viết như Fact.

Vấn đề:

- nhiều phần generic sẽ lặp với layer khác;
- agent tốn token để đọc lại cùng một mô hình;
- khó biết đâu là app truth của `00-context`, đâu là docs-system rule chung.

## After

````md
# 00 — Context

## Vai trò

Layer này giữ bối cảnh nền của Central Sync Hub.

Để hiểu mô hình layer/entity/relation chung, đọc:

- docs/guide/concepts/layer-model.md
- docs/guide/concepts/entity-model.md
- docs/guide/concepts/relation-model.md
- docs/guide/reference/folder-structure.md

## App Truth Hiện Tại

`task_transportor` là Central Sync Hub/CIS cho luồng:

```text
System -> CIS -> System
```

Lite hiện ưu tiên:

- Backlog manual/project pull vào CIS;
- CIS giữ canonical state, source snapshot, mapping, translation review, anomaly và audit;
- CIS -> Jira phải qua dry-run/pre-check trước khi ghi thật;
- webhook và Jira inbound đầy đủ chưa là đường chính của Lite.

## Routing Nhanh

| Cần tìm | Đọc |
| --- | --- |
| Folder structure của context | docs/guide/reference/folder-structure.md#00-context |
| Entity type canonical | docs/meta/01-entity-types/ |
| Relation rule canonical | docs/meta/02-relation-types/ và docs/meta/03-rules/ |

## Entity Index

| Entity type | Canonical definition |
| --- | --- |
| Application | docs/meta/01-entity-types/... |

## Rule Riêng Của Context

- Scope phải có `Out of Scope`.
- Assumption không viết như fact.
- Constraint quan trọng phải có source.
- Ecosystem không thay thế integration docs.
- Environment context không thay thế operation runtime.

## Theory / Decision Basis

- `TH-HUBFLOW`
- `TH-CANON`
- `docs/app/10-decisions/README.md`

## Cách Đọc / Sửa

- Cách đọc theo task: docs/guide/workflows/read-for-task.md
- Cách sửa docs: docs/guide/workflows/write-docs.md
- Cách trace impact: docs/guide/workflows/trace-impact.md
- Folder structure chuẩn: docs/guide/reference/folder-structure.md

## Không Đặt Ở Đây

- Business process chi tiết -> `docs/app/01-business`
- Product requirement -> `docs/app/02-product`
- Architecture boundary -> `docs/app/05-architecture`
- Relation/schema rule -> `docs/meta`
- Pure reasoning -> `docs/theories`
````

## Checklist

Before applying this pattern:

- Confirm Central Sync Hub context statement is still current.
- Keep context-specific rules in the layer README or canonical app entity.
- Move generic relation/layer explanation to guide links.
- Do not delete app-specific Lite scope.
