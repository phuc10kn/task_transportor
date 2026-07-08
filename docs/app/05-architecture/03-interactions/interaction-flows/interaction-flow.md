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

planned -> active -> changed

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| involves | `involves` | Module | false | 0..n |
| uses | `uses` | Interface | false | 0..n |
| implemented_by | `implemented_by` | ExecutionMechanism | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không nhét chi tiết controller, class hoặc payload schema vào entity này

## questions a good instance should answer

- Trigger kiến trúc của flow là gì?
- Flow đi qua owner nào và vì sao?
- Kết quả cuối cùng là owner state nào thay đổi?
- Có review, retry, dry-run hay canonicalization không?
- Anti-pattern nào flow này đang tránh?
