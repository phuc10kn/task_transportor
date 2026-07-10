# ConfigurationState

| Field | Value |
|-------|-------|
| **name** | ConfigurationState |
| **layer** | `05-architecture` |
| **concern** | `04-state` |
| **folder** | `configuration-states/` |
| **ID pattern** | `CFGS-{NNN}-{slug}` |

## meaning

State cấu hình nghiệp vụ hoặc integration mà runtime khác cần đọc nhưng không sở hữu.

## use when

Khi project có project profile, sync toggle, provider config hoặc env binding được quản lý như business state.
