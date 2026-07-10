# PublicContract

| Field | Value |
|-------|-------|
| **name** | PublicContract |
| **layer** | `07-implementation` |
| **concern** | `02-contracts` |
| **folder** | `public-contracts/` |
| **ID pattern** | `IMPL-CON-{NNN}-{slug}` |

## meaning

Contract ở mức source code mà consumer nội bộ hoặc external code được phép dựa vào.

## instance criteria

Khi module có API công khai, event contract, schema contract hoặc stable input/output cần trace.

## required fields

id, slug, entity_type, layer, concern, status

Body: owner, purpose, contract_shape

## optional fields

compatibility, consumers, error_behavior, related_interfaces

## lifecycle

planned -> active -> deprecated

## allowed relations (candidate)

```text
PublicContract -> Interface (exposes)
PublicContract -> VerificationCheck (verified_by)
```

## validation

- Public contract != private function signature
