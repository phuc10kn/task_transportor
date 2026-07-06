# WebhookFlow

| Field | Value |
|-------|-------|
| **name** | WebhookFlow |
| **layer** | `05-architecture` |
| **concern** | `03-interactions` |
| **folder** | `webhook-flows/` |
| **ID pattern** | `WHF-{NNN}-{slug}` |

## meaning

Luồng verify webhook, lưu raw event, enqueue job và return nhanh.

## use when

Khi integration inbound event-driven là đường chính hoặc đường bổ sung của hệ thống.
