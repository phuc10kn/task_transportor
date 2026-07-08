# SnapshotBundle

| Field | Value |
|-------|-------|
| **name** | SnapshotBundle |
| **layer** | `05-architecture` |
| **concern** | `05-data` |
| **folder** | `snapshot-bundles/` |
| **ID pattern** | `SB-{NNN}-{slug}` |

## meaning

Bundle dữ liệu read-only được gom lại để build preview, outbound payload hoặc reporting.

## use when

Khi consumer cần đọc nhiều owner state nhưng không được lấy ownership của chúng.
