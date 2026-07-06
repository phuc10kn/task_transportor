# SourceStructure

| Field | Value |
|-------|-------|
| **name** | SourceStructure |
| **layer** | `07-implementation` |
| **concern** | `01-organization` |
| **folder** | `source-structures/` |
| **ID pattern** | `IMPL-ORG-{NNN}-{slug}` |

## meaning

Cách source code map từ architecture unit sang folder, package hoặc public surface thật.

## instance criteria

Khi source organization phản ánh một rule quan trọng như module boundary hoặc public entry point.

## required fields

id, slug, entity_type, layer, concern, status

Body: mapping, purpose, protected_boundary

## optional fields

folder_layout, public_surfaces, internal_zones, related_modules

## lifecycle

draft -> active -> replaced

## allowed relations (candidate)

```text
SourceStructure -> Module (implements)
SourceStructure -> CodingRule (governed_by)
SourceStructure -> PublicContract (exposed_via)
```

## validation

- Không document mọi helper nhỏ
