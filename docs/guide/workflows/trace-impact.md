# Trace Impact

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
4. Tra valid hops trong docs/meta/03-rules/.
5. Search ID bằng rg.
6. Walk qua relation block, Related Entities, theory_basis, decision_basis.
7. Validate từng hop.
8. Kết luận: path / gap / invalid relation / open question.
```

## Relation Validation Gate

Khi thêm hoặc sửa entity, kiểm tra relation theo thứ tự:

```text
1. Entity này có cần trace tới context/product/decision/theory không?
2. Relation type đã tồn tại trong docs/meta/02-relation-types/ chưa?
3. Source entity type và target entity type đã đúng chưa?
4. Valid triple đã tồn tại trong docs/meta/03-rules/ chưa?
5. Direction có đúng canonical direction chưa?
6. Relation block hoặc Related Entities đã ghi đủ ID/path chưa?
```

Kết quả hợp lệ chỉ thuộc một trong các trạng thái:

- `valid path`: relation hợp lệ và đủ trace.
- `accepted gap`: không cần relation vì cardinality cho phép hoặc scope chưa yêu cầu.
- `open question`: cần `NOTE-OPEN` trước khi tạo relation.
- `invalid relation`: relation sai type, sai direction hoặc sai valid triple.

## Không làm

- Không tạo relation mới chỉ để trace cho đẹp.
- Không nhảy thẳng qua nhiều layer nếu chưa có valid triple.
- Không coi thiếu relation là bug nếu cardinality là `0..n`.

## Khi thiếu path

Dùng:

```text
NOTE-OPEN
Open Relation Question
```

Sau đó mới cân nhắc cập nhật `docs/meta`.
