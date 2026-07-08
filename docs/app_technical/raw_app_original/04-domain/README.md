# 04 - Domain

`04-domain/` mô tả meaning, model và lifecycle cốt lõi mà hệ thống dùng để hiểu problem space.

Layer này trả lời:

- vocabulary nào là canonical trong domain;
- entity, value object, aggregate và lifecycle nào tồn tại;
- invariant, domain rule và behavior nào chi phối meaning đó.

## Concern Canonical

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

## Provenance

- Extraction ID: `EXTRACT-04-domain-model`
- Source app path: `docs/app/04-domain/README.md`
