# StateOwner

| Field | Value |
|-------|-------|
| **name** | StateOwner |
| **layer** | `05-architecture` |
| **concern** | `04-state` |
| **folder** | `state-owners/` |
| **ID pattern** | `SO-{NNN}-{slug}` |

## meaning

Khẳng định architectural ownership của một loại state hoặc aggregate quan trọng.

## architectural value

Type này chống lại nhầm lẫn rất hay gặp trong monolith:

- cùng DB thì tưởng cùng owner;
- module adapter chiếm write path của canonical state;
- queue state bị lẫn với business state;
- read model bị tưởng là source of truth.

## instance criteria

Khi state đó là canonical, workflow-critical hoặc thường bị nhầm owner trong review.

## required fields

id, slug, entity_type, layer, concern, status

Body: state_name, owner, reason

## optional fields

consumers, write_policy, consistency_notes, read_exceptions, theory_basis

## lifecycle

draft -> active -> superseded

## relation templates

```text
Module -> StateOwner (owns)
StateOwner -> DataFlow (shared_via)
```

## validation

- State owner != database engine owner
- Phải nêu owner write rõ ràng

## questions a good instance should answer

- State này có phải canonical không?
- Ai được quyền write trực tiếp?
- Consumer nào được đọc?
- Review state, execution state hay configuration state có đang bị lẫn với canonical state không?
