# 01 - Business

`01-business/` mô tả business reality mà sản phẩm phải phục vụ, độc lập với stack kỹ thuật hay implementation cụ thể.

Layer này trả lời:

- vấn đề business nào đang được giải quyết;
- mục tiêu, stakeholder, process và governance nào đang chi phối sản phẩm;
- metric và success criteria nào dùng để đánh giá.

## Covered Universal Concerns

- `01-discovery/`
- `02-direction/`
- `03-organization/`
- `04-behavior/`
- `05-governance/`
- `06-measurement/`

## Universal Boundary

Layer này giữ business concern chung, không giữ:

- API, schema, database, retry implementation;
- UI screen hay source code contract;
- rule riêng của một current project nếu rule đó không còn universal.
