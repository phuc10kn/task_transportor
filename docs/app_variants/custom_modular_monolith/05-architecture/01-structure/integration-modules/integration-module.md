# IntegrationModule

| Field | Value |
|-------|-------|
| **name** | IntegrationModule |
| **layer** | `05-architecture` |
| **concern** | `01-structure` |
| **folder** | `integration-modules/` |
| **ID pattern** | `IM-{NNN}-{slug}` |

## meaning

Module chuyên làm adapter inbound hoặc outbound giữa canonical core và external system.

## use when

Khi module chủ yếu làm external client, normalization, payload build hoặc sync transport.

## notes

- Có thể vẫn là `Module`, nhưng type này giúp tách rõ `integration-facing` khỏi `core-domain`.
- `Backlog` và `Jira` là ngữ liệu tốt cho type này.
