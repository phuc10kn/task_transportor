---
id: DU-001
slug: express-admin-app
entity_type: DeploymentUnit
layer: 05-architecture
concern: 06-deployment
status: active
theory_basis:
  - TH-MOD-05
---

# DU-001 - Express Admin App

## Meaning

Deployment unit HTTP chính của hệ thống, mount admin static UI và toàn bộ admin API.

## Runtime role

Express application process tạo từ `src/app.js` và khởi động qua `src/server.js`.

## Why this unit matters architecturally

Nó là public runtime boundary của monolith hiện tại. Mọi module cùng chạy trong một app process, nhưng điều đó không xóa boundary owner-write giữa chúng.

## Hosted modules

- `Auth`
- `Projects`
- `Cis`
- `Backlog`
- `Sync`
- `Translation`
- `Mapping`
- `Anomaly`
- `Jira`
- `Dashboard`

## Boundary notes

- Đây là public admin entry point.
- Nó không thay owner module mà chỉ mount router và middleware.
- Shared runtime ở đây là quyết định deployment, không phải quyết định ownership.

## Operational implications

- Failure ở process này ảnh hưởng cả admin API surface.
- Correlation ID, auth middleware và error handling trở thành concern chung của toàn runtime.
- Worker hiện được khởi động cùng server process, nên app runtime và worker runtime đang coupled ở mức triển khai.

## Evolution notes

- Khi scale hơn, worker có thể tách process trước khi cần tách module thành service.
- Nếu admin UI hoặc API cần deploy độc lập, đây là điểm bắt đầu để tách runtime boundary.

## Evidence

- `src/app.js`
- `src/server.js`
