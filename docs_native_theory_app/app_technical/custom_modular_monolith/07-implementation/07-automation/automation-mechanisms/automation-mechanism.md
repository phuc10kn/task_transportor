# AutomationMechanism

| Field | Value |
|-------|-------|
| **name** | AutomationMechanism |
| **layer** | `07-implementation` |
| **concern** | `07-automation` |
| **folder** | `automation-mechanisms/` |
| **ID pattern** | `IMPL-AUTO-{NNN}-{slug}` |

## meaning

Script, generator, check hoặc CI automation trực tiếp hỗ trợ implementation.

## instance criteria

Khi automation có owner, trigger và validation rõ, hoặc ảnh hưởng nhiều contributor.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, input, output

## optional fields

owner, safety_checks, rollback, scope_limit, related_rules

## lifecycle

proposed -> active -> deprecated

## allowed relations (candidate)

```text
AutomationMechanism -> CodingRule (enforces)
AutomationMechanism -> VerificationCheck (runs)
AutomationMechanism -> SourceStructure (supports)
```

## validation

- Automation phải có scope rõ, không chỉ ghi "CI runs"
