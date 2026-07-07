# WorkerRuntime

| Field | Value |
|-------|-------|
| **name** | WorkerRuntime |
| **layer** | `05-architecture` |
| **concern** | `06-deployment` |
| **folder** | `worker-runtimes/` |
| **ID pattern** | `WRU-{NNN}-{slug}` |

## meaning

Runtime xử lý job bất đồng bộ, retry hoặc execution loop ngoài request lifecycle.

## use when

Khi hệ thống có internal worker hoặc worker tách riêng.
