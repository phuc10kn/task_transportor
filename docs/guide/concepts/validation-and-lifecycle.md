# Validation And Lifecycle

## Validation

Validation của docs có 5 nhóm chính:

| Nhóm | Câu hỏi |
| --- | --- |
| Structural | File có nằm đúng Layer -> Concern -> Entity Type -> Entity Instance không? |
| Semantic | Nội dung có đúng meaning của entity type/concern không? |
| Relation | Relation slot, relation type, direction và valid triple có hợp lệ không? |
| Reference | Entity ID, Theory ID, Decision ID có tồn tại không? |
| Convention | ID, folder, file, metadata, status có đúng format không? |

Canonical detail:

```text
docs/meta/04-conventions/validation-model.md
```

## Trace validation

Khi kiểm tra A có trace tới B:

```text
1. Xác định ID/type/layer của A và B.
2. Xác định hướng trace.
3. Tra valid hops trong docs/meta/03-rules/.
4. Walk qua relation block, Related Entities và rg ID.
5. Validate từng hop.
6. Kết luận path/gap/open question.
```

## Lifecycle

Status vocabulary và lifecycle canonical thuộc project local:

```text
docs/meta/04-conventions/status-vocabulary.md
```

Guide không định nghĩa temporary-record lifecycle. Nếu chưa có canonical home, dừng thay đổi và làm theo policy local của project.
