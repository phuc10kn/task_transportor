# Layer Model

## Layer là gì

Layer là vùng câu hỏi lớn của app docs.

Ví dụ:

| Layer | Câu hỏi chính |
| --- | --- |
| `00-context` | App tồn tại trong bối cảnh nào? |
| `01-business` | Business cần gì và vận hành thế nào? |
| `02-product` | Product phải cung cấp gì? |
| `03-ui` | Người dùng trải nghiệm và tương tác ra sao? |
| `04-domain` | Meaning/domain rule nội bộ là gì? |
| `05-architecture` | System được tổ chức và boundary thế nào? |
| `06-technical` | Mechanism kỹ thuật nào được chọn? |
| `07-implementation` | Code/source tổ chức và implement thế nào? |
| `08-quality` | Chất lượng được kiểm tra và giữ thế nào? |
| `09-operation` | Runtime/ops/recovery vận hành ra sao? |
| `10-decisions` | Vì sao project chọn hướng này? |

## Layer không phải pipeline cứng

Thứ tự folder giúp đọc dễ hơn, nhưng app knowledge là graph.

Ví dụ:

```text
Business Process
    -> Product Use Case
    -> UI Flow

Business Rule
    -> Domain Invariant

Architecture Boundary
    -> Implementation Contract
```

Không bắt mọi entity phải đi qua đủ mọi layer.

## Layer README nên làm gì

Layer README nên giữ:

- vai trò của layer trong repo;
- app truth hiện tại của layer;
- concern/entity type đang dùng;
- rule riêng của layer;
- link tới `docs/guide` cho cách dùng docs;
- link tới `docs/meta` cho rule/schema/convention canonical;
- link tới `docs/theories` cho theory basis khi có.

Layer README không nên lặp lại toàn bộ documentation architecture chung.

## Layer dùng folder structure chuẩn

Mỗi layer trong `docs/app` dùng concern folder có prefix số theo:

```text
docs/folder_structure.md
docs/guide/reference/folder-structure.md
```

Ví dụ path chuẩn là:

```text
docs/app/00-context/01-overview/
docs/app/01-business/04-behavior/
docs/app/02-product/05-specification/
```

Khi viết README hoặc guide, dùng đúng path có prefix. Chỉ dùng tên không prefix khi đang nói meaning chung của concern.
