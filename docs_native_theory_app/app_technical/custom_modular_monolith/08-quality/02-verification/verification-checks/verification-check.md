# VerificationCheck

| Field | Value |
|-------|-------|
| **name** | VerificationCheck |
| **layer** | `08-quality` |
| **concern** | `02-verification` |
| **folder** | `verification-checks/` |
| **ID pattern** | `VCHK-{NNN}-{slug}` |

## meaning

Check chứng minh hệ thống được xây đúng theo spec, design hoặc rule kỹ thuật.

## instance criteria

Khi test hoặc static check có target, expected result và automation rõ.

## required fields

id, slug, entity_type, layer, concern, status

Body: target, method, expected_result

## optional fields

environment, automation, failure_signal, related_rules, verifies

## lifecycle

planned -> active -> replaced

## allowed relations (candidate)

```text
VerificationCheck -> CodingRule (checks)
VerificationCheck -> PublicContract (verifies)
VerificationCheck -> QualityObjective (supports)
```

## validation

- Không nhầm với validation phía business/user
