# DataFlow

| Field | Value |
|-------|-------|
| **name** | DataFlow |
| **layer** | `05-architecture` |
| **concern** | `05-data` |
| **folder** | `data-flows/` |
| **ID pattern** | `DF-{NNN}-{slug}` |

## meaning

Luồng di chuyển hoặc chia sẻ dữ liệu qua boundary của app.

## architectural value

Type này có giá trị khi cần thấy:

- dữ liệu đổi owner ở đâu và không đổi owner ở đâu;
- dữ liệu được canonicalize, review hay snapshot ở chỗ nào;
- outbound payload được build từ state nào;
- read exception nào đang được dùng để tạo flow.

## instance criteria

Khi dữ liệu đi qua nhiều module, nhiều tier hoặc qua external system với trách nhiệm rõ ràng.

## required fields

id, slug, entity_type, layer, concern, status

Body: source, destination, data_meaning

## optional fields

canonical_status, transformation, ownership_notes, sensitivity, theory_basis

## lifecycle

planned -> active -> retired

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| moves | `moves` | StateOwner | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không biến Data Flow thành schema chi tiết

## questions a good instance should answer

- Dữ liệu bắt đầu ở dạng gì và kết thúc ở dạng gì?
- Transformation này có mục đích kiến trúc gì?
- Sau mỗi chặng, owner là ai?
- Có chỗ nào đang chỉ là snapshot read thay vì ownership transfer?
- Flow này cắt giảm coupling gì?
