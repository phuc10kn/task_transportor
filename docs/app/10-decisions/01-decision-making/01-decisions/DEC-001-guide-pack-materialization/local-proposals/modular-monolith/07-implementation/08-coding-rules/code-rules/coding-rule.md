# CodingRule

| Field | Value |
|-------|-------|
| **name** | CodingRule |
| **layer** | `07-implementation` |
| **concern** | `08-coding-rules` |
| **folder** | `code-rules/` |
| **ID pattern** | `IMPL-RULE-{NNN}-{slug}` |

## meaning

Rule source code có thể đọc, review và lý tưởng là kiểm tra được bằng tooling hoặc agent.

## instance criteria

Khi rule giúp bảo vệ module boundary, public surface, security hoặc maintainability.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope, rationale

## optional fields

examples, anti_examples, enforcement, related_boundaries, theory_basis

## lifecycle

draft -> active -> superseded

## allowed relations (candidate)

```text
CodingRule -> AutomationMechanism (checked_by)
CodingRule -> VerificationCheck (verified_by)
```

## validation

- Rule phải actionable
- Tránh wording mơ hồ kiểu "keep code clean"
