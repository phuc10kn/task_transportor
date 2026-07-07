# RuntimeEnvironment

| Field | Value |
|-------|-------|
| **name** | RuntimeEnvironment |
| **layer** | `09-operation` |
| **concern** | `01-runtime` |
| **folder** | `runtime-environments/` |
| **ID pattern** | `OPS-RT-{NNN}-{slug}` |

## meaning

Môi trường hoặc topology runtime nơi app thật sự đang chạy.

## instance criteria

Khi environment có config, criticality hoặc operational differences cần được theo dõi riêng.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, topology, owner

## optional fields

regions, dependencies, scaling_notes, configuration_sets, monitored_signals

## lifecycle

planned -> active -> retired

## allowed relations (candidate)

```text
RuntimeEnvironment -> DeploymentUnit (operates)
RuntimeEnvironment -> ConfigurationSet (applies)
RuntimeEnvironment -> ObservabilitySignal (monitored_by)
```

## validation

- Không chỉ lặp lại architecture deployment design
