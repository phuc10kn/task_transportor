# SecurityRule

| Field | Value |
|-------|-------|
| **name** | SecurityRule |
| **layer** | `05-architecture` |
| **concern** | `07-cross-cutting` |
| **folder** | `security-rules/` |
| **ID pattern** | `SEC-{NNN}-{slug}` |

## meaning

Rule cắt ngang về auth, trust boundary, secret handling hoặc privileged write path.

## use when

Khi concern bảo mật ảnh hưởng nhiều module chứ không chỉ một controller.
