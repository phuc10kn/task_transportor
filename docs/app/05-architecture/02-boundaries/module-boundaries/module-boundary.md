# ModuleBoundary

| Field | Value |
|-------|-------|
| **name** | ModuleBoundary |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `module-boundaries/` |
| **ID pattern** | `MB-{NNN}-{slug}` |

## meaning

Rule kiến trúc xác định module nào được phép phụ thuộc, đọc, ghi hoặc expose capability theo cách nào.

## architectural value

Type này giữ cho modular monolith không trượt thành:

- shared-database shared-ownership;
- deep import coupling;
- controller ownership mờ;
- integration bypass path.

## instance criteria

Khi boundary có ảnh hưởng thật đến ownership, dependency hoặc data access của nhiều phần trong app.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, scope, protected_assets

## optional fields

allowed_dependencies, forbidden_dependencies, read_exceptions, write_policy, theory_basis, decision_basis

## lifecycle

draft -> active -> superseded

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| constrains | `constrains` | Module | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Boundary không mô tả chi tiết code import path
- Boundary phải nói rõ cái gì bị cấm hoặc được phép

## questions a good instance should answer

- Boundary này đang bảo vệ asset nào?
- Ai được phép đi qua boundary này và bằng con đường nào?
- Điều gì mặc định bị cấm?
- Nếu có read exception, tier và lý do là gì?
- Boundary này bắt nguồn từ ownership, integration hay reliability?
