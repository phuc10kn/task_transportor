# Trace Impact

## Hướng dẫn truy vấn ngược

- Theo dõi reverse lookup mặc định qua `frontmatter` và `derived inverse`.
- Ưu tiên `repository search`/`index`/`tooling` trước khi cân nhắc tạo relation ngược.
- Chỉ tạo inverse riêng khi có semantic độc lập và nhu cầu query first-class.

## Mục đích trace

| Mục đích | Câu hỏi |
| --- | --- |
| Impact | Đổi A thì B có bị ảnh hưởng không? |
| Coverage | B có được justify từ A không? |
| Consistency | Path có hợp lệ theo meta không? |

## Workflow

```text
1. Xác định A và B bằng ID/path.
2. Xác định entity type và layer của A/B.
3. Xác định hướng trace.
4. Tra relation slot trong entity type của A.
5. Tra valid hops trong docs/meta/03-rules/.
6. Search ID bằng rg.
7. Walk qua frontmatter `relations`, theory_basis, decision_basis và repository search.
8. Validate từng hop.
9. Kết luận: path / accepted gap / invalid relation / rejected relation.
```

## Relation Validation Gate

Khi thêm hoặc sửa entity, kiểm tra relation theo thứ tự:

```text
1. Entity này có cần trace tới context/product/decision/theory không?
2. Entity type có slot phù hợp trong `relations_template` chưa?
3. Relation type của slot đã tồn tại trong docs/meta/02-relation-types/ chưa?
4. Source entity type và target entity type đã đúng slot chưa?
5. Valid triple đã tồn tại trong docs/meta/03-rules/ chưa?
6. Direction có đúng canonical direction chưa?
7. Target instance có tồn tại nếu slot được điền chưa?
8. Frontmatter `relations` đã dùng đúng slot chưa?
9. Target có phải entity type canonical, không phải pseudo target hoặc wildcard không?
```

Kết quả hợp lệ chỉ thuộc một trong các trạng thái:

- `valid path`: relation hợp lệ và đủ trace.
- `accepted gap`: không cần relation vì cardinality cho phép hoặc scope chưa yêu cầu.
- `rejected relation`: relation chưa được ghi vì thiếu slot, thiếu relation type hoặc thiếu valid triple.
- `invalid relation`: relation đã ghi nhưng sai slot, sai target type, sai direction hoặc sai valid triple.

## Không làm

- Không tạo relation mới chỉ để trace cho đẹp.
- Không nhảy thẳng qua nhiều layer nếu chưa có valid triple.
- Không ghi relation nếu entity type chưa có slot tương ứng.
- Không coi thiếu relation là bug nếu cardinality là `0..n`.
- Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`.
- Không tạo outbound relation từ Assumption hoặc ContextConstraint tới mọi entity.

## Khi thiếu slot hoặc path

Không ghi relation vào entity instance.

Nếu relation thật sự cần thiết, chỉ cập nhật phần metadata đang thiếu:

```text
1. thiếu slot -> cập nhật entity type relations_template
2. thiếu relation type -> cập nhật docs/meta/02-relation-types/
3. thiếu valid triple -> cập nhật docs/meta/03-rules/
4. đủ metadata -> ghi entity instance relations
```

Với Assumption hoặc ContextConstraint rộng, chỉ tạo relation canonical khi entity bị ảnh hưởng có slot cụ thể tới Assumption/ContextConstraint và valid triple cụ thể. Nếu chưa đủ điều kiện, ghi tác động bằng `affected_entities`, `affected_layers`, `validation_method`, `review_trigger` hoặc `exceptions`.
