# Trace Impact

## Hướng dẫn truy vấn ngược

- Theo dõi reverse lookup theo `frontmatter` và `derived inverse`.
- Ưu tiên `repository search`/`index`/`tooling` trước khi tạo relation ngược.
- Chỉ tạo inverse riêng khi có semantic độc lập và nhu cầu query first-class.

## Mục tiêu trace

| Mục tiêu | Câu hỏi |
| --- | --- |
| Impact | Nếu A thay đổi thì B có bị ảnh hưởng không? |
| Coverage | B có được justify từ A không? |
| Consistency | Path có hợp lệ theo meta không? |

## Workflow

```text
1. Xác định A và B bằng ID/path.
2. Xác định entity type và layer của A/B.
3. Xác định hướng trace.
4. Kiểm tra relation slots trong entity type của A.
5. Kiểm tra valid hops trong docs/meta/03-rules/.
6. Search ID bằng rg.
7. Walk qua frontmatter `relations`, `theory_basis`, `decision_basis` và repository search.
8. Validate từng hop.
9. Kết luận: path / accepted gap / invalid relation / rejected relation.
```

## Relation Validation Gate

Khi thêm hoặc sửa entity, kiểm tra relation theo thứ tự:

```text
1. Entity có cần trace tới context/product/decision/theory không?
2. Entity type có slot phù hợp trong `relations_template` chưa?
3. Relation type của slot đã tồn tại trong docs/meta/02-relation-types/ chưa?
4. Source entity type và target entity type khớp slot chưa?
5. Valid triple đã tồn tại trong docs/meta/03-rules/ chưa?
6. Direction đã đúng canonical chưa?
7. Nếu `requirement_mode = required_at_creation`, target instance phải có thật trước khi tạo source.
8. Nếu `requirement_mode = allowed_when_known`, target chưa có vẫn có thể chấp nhận thiếu tạm thời (đánh dấu gap).
9. Frontmatter `relations` dùng đúng slot chưa?
10. Target là entity type canonical, không pseudo target hay wildcard.
```

Kết quả hợp lệ thuộc một trong:

- `valid path`: relation hợp lệ và được ghi nhận.
- `accepted gap`: thiếu `allowed_when_known` ở giai đoạn chưa có target, chưa phải reject.
- `rejected relation`: thiếu slot, relation type hoặc valid triple.
- `invalid relation`: relation đã ghi nhưng sai slot/target/direction/valid triple.

## Không làm

- Không tạo relation mới chỉ để làm đẹp đồ thị.
- Không nhảy qua nhiều layer nếu chưa có valid triple.
- Không ghi relation khi entity type chưa có slot phù hợp.
- Không coi thiếu `allowed_when_known` là bug nếu cardinality cho phép.

## Khi thiếu slot hoặc path

Không ghi relation vào entity instance.

Nếu relation thực sự cần:

1. thiếu slot -> cập nhật entity type `relations_template`;
2. thiếu relation type -> cập nhật docs/meta/02-relation-types/;
3. thiếu valid triple -> cập nhật docs/meta/03-rules/;
4. sau đó mới gán metadata vào entity instance relations.
