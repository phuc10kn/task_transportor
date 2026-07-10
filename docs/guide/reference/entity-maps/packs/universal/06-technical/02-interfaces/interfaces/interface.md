# Interface

| Field | Value |
|-------|-------|
| **name** | Interface |
| **layer** | `06-technical` |
| **concern** | `02-interfaces` |
| **folder** | `interfaces/` |
| **ID pattern** | `TECH-IF-{NNN}-{slug}` |

## meaning

Technical interface mà app expose hoặc consume như REST API, webhook, file format hoặc CLI contract.

## instance criteria

Khi interface có consumer/provider rõ và cần compatibility knowledge riêng.

## required fields

id, slug, entity_type, layer, concern, status

Body: direction, purpose, provider

## optional fields

consumer, versioning, compatibility, security_notes, related_contracts

## lifecycle

draft -> active -> deprecated

## relation templates

```text
Interface -> SecurityMechanism (protected_by)
```

## validation

- Không document handler code ở entity này
