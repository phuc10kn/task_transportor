# RawEventRecord

| Field | Value |
|-------|-------|
| **name** | RawEventRecord |
| **layer** | `05-architecture` |
| **concern** | `05-data` |
| **folder** | `raw-event-records/` |
| **ID pattern** | `RER-{NNN}-{slug}` |

## meaning

Dữ liệu raw inbound được lưu để audit, replay hoặc debug trước khi canonicalize.

## use when

Khi hệ thống có webhook events, ingest logs hoặc raw payload archive.
