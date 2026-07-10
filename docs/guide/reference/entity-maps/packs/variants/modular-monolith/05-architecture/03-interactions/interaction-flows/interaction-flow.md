# InteractionFlow

| Field | Value |
|-------|-------|
| **name** | InteractionFlow |
| **layer** | `05-architecture` |
| **concern** | `03-interactions` |
| **folder** | `interaction-flows/` |
| **ID pattern** | `AF-{NNN}-{slug}` |

## meaning

Luồng tương tác ở mức architecture giữa các module, external system hoặc deployment unit.

## architectural value

Type này dùng để nhìn ra:

- đường đi chính của dữ liệu và control;
- chỗ nào phải qua owner API;
- chỗ nào cần queue, dry-run, review hoặc journal;
- chỗ nào không được phép đi tắt giữa hai external systems.

## instance criteria

Khi luồng đó là đường đi chính của capability, integration hoặc side effect quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, path, outcome

## optional fields

participants, sync_mode, failure_points, owner_modules, theory_basis

## lifecycle

Project định nghĩa lifecycle local trong `docs/meta/`.

## relation templates

```text
InteractionFlow -> Module (involves)
```

## source note

- `InteractionFlow -> Module (involves)` là source template relation được khuyến nghị cho flow -> participant.
- Relation type, valid triple và local predicate thuộc contract project trong `docs/meta/`.

## validation

- Không nhét chi tiết controller, class hoặc payload schema vào entity này

## questions a good instance should answer

- Trigger kiến trúc của flow là gì?
- Flow đi qua owner nào và vì sao?
- Kết quả cuối cùng là owner state nào thay đổi?
- Có review, retry, dry-run hay canonicalization không?
- Anti-pattern nào flow này đang tránh?
