# IntegrationGuardrail

| Field | Value |
|-------|-------|
| **name** | IntegrationGuardrail |
| **layer** | `05-architecture` |
| **concern** | `07-cross-cutting` |
| **folder** | `integration-guardrails/` |
| **ID pattern** | `IG-{NNN}-{slug}` |

## meaning

Rule cắt ngang bảo vệ inbound hoặc outbound integration khỏi bypass path nguy hiểm.

## use when

Khi flow cần dry-run, review gate, mapping check, anomaly gate hoặc journal.
