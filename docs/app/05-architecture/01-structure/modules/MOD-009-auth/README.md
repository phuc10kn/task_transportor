---
schema: entity-instance/v1
id: MOD-009
slug: auth
title: Auth
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Module xác thực admin cho toàn bộ admin UI và API nội bộ của hệ thống.
theory_basis:
  - TH-MOD-01
---
# MOD-009 - Auth

## Summary

Module xác thực admin cho toàn bộ admin UI và API nội bộ của hệ thống.

## Meaning

Module xác thực admin cho toàn bộ admin UI và API nội bộ của hệ thống.

## Responsibility

- Login admin.
- Bootstrap admin khi có env phù hợp.
- Cấp và đọc JWT identity hiện tại.
- Expose middleware authenticate cho HTTP layer.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Auth/AuthApi.js`, `src/modules/Auth/http/routes.js` |
| Owned behavior | admin identity, bootstrap admin, logout semantics đơn giản |
| Main consumers | gần như toàn bộ route admin |
| Runtime impact | cross-cutting security entry point |

## Rules / constraints

- Auth không sở hữu policy của từng domain module.
- Business authorization chi tiết nếu có phải nằm ở owner use case.
- Bootstrap admin chỉ là convenience hiện tại, không được kéo business logic vào đây.

## Related Entities

- Canonical relation: [DU-001-node-monolith](../../../06-deployment/deployment-units/DU-001-node-monolith/README.md) - deployable runtime host của auth
- Canonical relation: [CCR-002-owner-write-discipline](../../../07-cross-cutting/cross-cutting-rules/CCR-002-owner-write-discipline/README.md) - auth bảo vệ write path nhưng không thay owner


## Relations

Chưa có outbound relation canonical trong baseline hiện tại. Prose liên quan được giữ làm context hoặc evidence; chỉ materialize theo DEC-002.

## Evidence

- `src/modules/Auth/AuthApi.js`
- `src/modules/Auth/http/middleware/authenticate.js`
- `src/app.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
