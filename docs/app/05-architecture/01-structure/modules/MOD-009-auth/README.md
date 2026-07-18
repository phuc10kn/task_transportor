---
schema: entity-instance/v1
id: MOD-009
slug: auth
title: Auth
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Module sở hữu user identity, password/Google login, system role và user JWT cho Admin UI/API.
theory_basis:
  - TH-MOD-01
---
# MOD-009 - Auth

## Summary

Module sở hữu user identity, password/Google login, system role và user JWT cho Admin UI/API.

## Meaning

Module sở hữu user identity, password/Google login, system role và user JWT cho Admin UI/API.

## Responsibility

- Login user bằng password hoặc linked Google `sub`; Google-first tạo CIS user role `user`.
- Sở hữu `user_identities`, explicit Google linking và one-time password setup cho Google-first user.
- Owner-write self-profile display name; email identity và system role không thuộc self-service mutation.
- Bootstrap system admin khi có env phù hợp.
- System-admin CRUD user tối thiểu, gồm hard-delete có guard, và cấp/đọc user JWT.
- Expose middleware authenticate cho HTTP layer.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Auth/AuthApi.js`, `src/modules/Auth/http/routes.js` |
| Owned behavior | user identity, credential login, Google identity mapping, system role |
| Main consumers | toàn bộ authenticated route và `Projects` safe user lookup |
| Runtime impact | cross-cutting security entry point |

## Rules / constraints

- Auth không sở hữu policy của từng domain module.
- Business authorization chi tiết nếu có phải nằm ở owner use case.
- Project/Team role thuộc `Projects`; `system_admin` không bypass membership.
- Google-first chỉ auto-provision role `user`; Google không cấp Project access hoặc system role khác.
- Password-first chỉ link Google explicit khi verified email trùng CIS email; không auto-merge theo email.
- Không lưu/log Google ID/access/refresh token; chỉ lưu provider `sub` và verified email.
- Hard-delete user không cascade xóa Project; self-delete, system admin enabled cuối cùng và Project owner còn được tham chiếu đều bị chặn.

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
