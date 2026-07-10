# Platform

| Field | Value |
|-------|-------|
| **name** | Platform |
| **layer** | `06-technical` |
| **concern** | `01-platforms` |
| **folder** | `platforms/` |
| **ID pattern** | `TECH-PLAT-{NNN}-{slug}` |

## meaning

Technology platform hoặc engine chính dùng để hiện thực architecture của app.

## instance criteria

Khi technology có vai trò nền như runtime, framework, database engine hoặc object storage.

## required fields

id, slug, entity_type, layer, concern, status

Body: technology, role, rationale

## optional fields

constraints, alternatives, owned_concerns, decision_basis

## lifecycle

proposed -> active -> deprecated

## relation templates

```text
Platform -> DeploymentUnit (runs)
Platform -> ExecutionMechanism (enables)
```

## validation

- Platform != package nhỏ hoặc utility library lẻ
