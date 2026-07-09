# CrossCuttingRule

| Field | Value |
|-------|-------|
| **name** | CrossCuttingRule |
| **layer** | `05-architecture` |
| **concern** | `07-cross-cutting` |
| **folder** | `cross-cutting-rules/` |
| **ID pattern** | `CCR-{NNN}-{slug}` |

## meaning

Rule kiến trúc ảnh hưởng xuyên nhiều module hoặc nhiều concern trong app.

## architectural value

Type này giữ cho team không chỉ document structure tĩnh, mà còn document những luật xuyên suốt đang thực sự điều khiển evolution của monolith.

## instance criteria

Khi rule áp dụng cho nhiều unit cùng lúc như auth, audit, observability hoặc ownership discipline.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope, purpose

## optional fields

affected_units, enforcement_points, quality_impact, theory_basis, decision_basis

## lifecycle

draft -> active -> superseded

## allowed relations (candidate)

```text
CrossCuttingRule -> Module (affects)
```

## validation

- Rule phải actionable, không viết quá chung chung

## questions a good instance should answer

- Rule này bảo vệ nguy cơ lặp lại nào?
- Nó áp dụng cho những module nào?
- Nó có thể bị vi phạm theo kiểu anti-pattern nào?
- Review một thay đổi mới thì dùng rule này để hỏi câu gì?
