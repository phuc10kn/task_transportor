# DefectRecord

| Field | Value |
|-------|-------|
| **name** | DefectRecord |
| **layer** | `08-quality` |
| **concern** | `06-defects` |
| **folder** | `defect-records/` |
| **ID pattern** | `DEF-{NNN}-{slug}` |

## meaning

Lỗi đã được quan sát trong app hoặc tài liệu hóa đủ để theo dõi và verify fix.

## instance criteria

Khi có observed behavior, expected behavior và ảnh hưởng rõ ràng.

## required fields

id, slug, entity_type, layer, concern, status

Body: observed_behavior, expected_behavior, severity

## optional fields

affected_versions, root_cause, resolution, verification, related_incidents

## lifecycle

reported -> confirmed -> fixed -> verified

## allowed relations (candidate)

```text
DefectRecord -> IncidentRecord (raised_by)
DefectRecord -> VerificationCheck (retested_by)
DefectRecord -> RiskRecord (related_to)
```

## validation

- Không dùng defect record cho vague complaint không có observed behavior
