# ValidationScenario

| Field | Value |
|-------|-------|
| **name** | ValidationScenario |
| **layer** | `08-quality` |
| **concern** | `03-validation` |
| **folder** | `validation-scenarios/` |
| **ID pattern** | `VAL-{NNN}-{slug}` |

## meaning

Scenario kiểm tra app có giải quyết đúng nhu cầu thật của user hoặc business hay không.

## instance criteria

Khi scenario phản ánh acceptance, usability hoặc business outcome quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: need, scenario, success_signal

## optional fields

actors, prerequisites, evidence, validates, related_features

## lifecycle

planned -> active -> obsolete

## relation templates

```text
ValidationScenario -> Capability (validates)
ValidationScenario -> AcceptanceCriterion (verifies)
ValidationScenario -> ReleaseGate (required_by)
```

## validation

- Không biến thành unit test description
