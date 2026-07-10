# 04 - Domain

`04-domain/` mô tả meaning, model và lifecycle cốt lõi mà hệ thống dùng để hiểu problem space.

Layer này trả lời:

- vocabulary nào là canonical trong domain;
- conceptual model, domain rule, behavior và lifecycle nào chi phối meaning đó.

## Covered Universal Concerns

- `01-language/`
- `02-model/`
- `03-rules/`
- `04-behavior/`
- `05-lifecycle/`

## Universal Boundary

Layer này giữ domain concern chung, không giữ:

- entity instance hay state truth riêng của một project;
- technical schema hay storage detail;
- screen flow hay source code organization.

Type vocabulary phụ thuộc methodology, như DDD tactical, thuộc variant pack tương ứng chứ không thuộc universal baseline này.
