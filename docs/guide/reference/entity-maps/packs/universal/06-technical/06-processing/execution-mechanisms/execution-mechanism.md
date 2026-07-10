# ExecutionMechanism

| Field | Value |
|-------|-------|
| **name** | ExecutionMechanism |
| **layer** | `06-technical` |
| **concern** | `06-processing` |
| **folder** | `execution-mechanisms/` |
| **ID pattern** | `TECH-EXE-{NNN}-{slug}` |

## meaning

Cơ chế runtime thực thi request, background job, scheduler hoặc worker loop.

## instance criteria

Khi app có execution model đủ quan trọng để ảnh hưởng reliability, throughput hoặc ownership.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, runtime_path, purpose

## optional fields

concurrency_notes, retry_notes, observability, failure_modes

## lifecycle

planned -> active -> evolved

## relation templates

```text
ExecutionMechanism -> AutomationMechanism (invoked_by)
```

## validation

- Không nhét business acceptance flow vào entity này
