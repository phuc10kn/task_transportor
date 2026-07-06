# ScheduledScanFlow

| Field | Value |
|-------|-------|
| **name** | ScheduledScanFlow |
| **layer** | `05-architecture` |
| **concern** | `03-interactions` |
| **folder** | `scheduled-scan-flows/` |
| **ID pattern** | `SSF-{NNN}-{slug}` |

## meaning

Luồng quét định kỳ để phát hiện dữ liệu nguồn hoặc việc cần enqueue thêm job.

## use when

Khi hệ thống có scheduler, poller hoặc periodic sync scan.
