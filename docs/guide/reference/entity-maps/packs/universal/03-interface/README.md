# 03 - Interface

`03-interface/` mô tả cách người hoặc hệ thống khác chạm vào sản phẩm.

Layer này trả lời:

- ai đang tương tác với sản phẩm;
- experience, structure, composition và interaction nào được expose;
- quality và interface system nào cần giữ ổn định.

## Covered Universal Concerns

- `01-audience/`
- `02-experience/`
- `03-structure/`
- `04-composition/`
- `05-interaction/`
- `06-quality/`
- `07-system/`

## Universal Boundary

`03-interface` bao phủ:

- UI;
- API/operator touchpoint;
- CLI/admin touchpoint;
- interface system được người hoặc hệ thống khác dùng để làm việc với sản phẩm.

Layer này không giữ:

- protocol/schema kỹ thuật thuần;
- implementation của controller, component tree hay adapter code.
