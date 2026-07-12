# Assumption

| Field | Value |
|-------|-------|
| **name** | Assumption |
| **layer** | `00-context` |
| **concern** | `03-premises` |
| **folder** | `assumptions/` |
| **ID pattern** | `ASM-{NNN}` |
| **Instance folder pattern** | `ASM-{NNN}-{slug}` |

## meaning

Điều project đang tạm coi là đúng nhưng chưa được xác minh như fact.

## instance criteria

Khi premise sai có thể ảnh hưởng nhiều layer hoặc decision.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, reason, confidence

## optional fields

affected_entities, validation_method, review_trigger, theory_basis

## lifecycle

active → validated | invalidated | retired

## relations_template

Không có relation slot canonical hiện tại.

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phải ghi rõ là assumption, không viết như fact
- Assumption không tự tạo outbound relation tới `entities` hoặc target rộng.
- Entity bị ảnh hưởng chỉ tạo relation tới Assumption khi entity type của entity đó có slot cụ thể và valid triple cụ thể.
- Nếu chưa có relation cụ thể, ghi ảnh hưởng bằng `affected_entities`, `validation_method` hoặc `review_trigger`.
