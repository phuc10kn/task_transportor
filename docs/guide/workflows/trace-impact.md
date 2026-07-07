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

## Không làm

- Không tạo relation mới chỉ để trace cho đẹp.
- Không nhảy thẳng qua nhiều layer nếu chưa có valid triple.
- Không coi thiếu relation là bug nếu cardinality là `0..n`.

## Khi thiếu path

Dùng:

```text
NOTE-OPEN
Open Relation Question
docs/backlog-theories/
```

Sau đó mới cân nhắc cập nhật `docs/meta`.

