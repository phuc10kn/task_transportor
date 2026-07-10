# DeploymentRunbook

| Field | Value |
|-------|-------|
| **name** | DeploymentRunbook |
| **layer** | `09-operation` |
| **concern** | `02-release-and-change` |
| **folder** | `deployment-runbooks/` |
| **ID pattern** | `OPS-DEP-{NNN}-{slug}` |

## meaning

Procedure vận hành mô tả cách một thay đổi được rollout vào runtime thật.

## instance criteria

Khi deployment cần step, rollback và verification rõ ràng.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, procedure, verification

## optional fields

rollback, approvals, preconditions, migration_links, related_release_gates

## lifecycle

draft -> active -> superseded

## relation templates

```text
DeploymentRunbook -> RuntimeEnvironment (deploys_to)
DeploymentRunbook -> ReleaseGate (governed_by)
```

## validation

- Procedure phải actionable và có rollback
