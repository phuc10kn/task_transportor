# SecurityMechanism

| Field | Value |
|-------|-------|
| **name** | SecurityMechanism |
| **layer** | `06-technical` |
| **concern** | `05-security` |
| **folder** | `security-mechanisms/` |
| **ID pattern** | `TECH-SEC-{NNN}-{slug}` |

## meaning

Cơ chế kỹ thuật bảo vệ app như auth, secret handling, token strategy hoặc encryption.

## instance criteria

Khi mechanism có giá trị kiến thức bền, ảnh hưởng nhiều flow hoặc nhiều deployment unit.

## required fields

id, slug, entity_type, layer, concern, status

Body: mechanism, protection_scope, rationale

## optional fields

threats_addressed, rotation_rules, compatibility, verification_links

## lifecycle

proposed -> active -> deprecated

## relation templates

```text
SecurityMechanism -> Interface (protects)
SecurityMechanism -> MaintenanceProcedure (maintained_by)
```

## validation

- Không ghi secret thật vào entity này
