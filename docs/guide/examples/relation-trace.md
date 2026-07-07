# Example: Relation Trace

## Task

Kiểm tra một Business Problem có dẫn tới Product Requirement hay không.

## Workflow

```text
1. Tìm Problem ID.
2. Xác định target Product entity type.
3. Tra docs/meta/03-rules/cross-layer/valid-triples.md.
4. Search Problem ID bằng rg.
5. Kiểm tra relation block và Related Entities.
6. Validate từng hop.
```

## Kết luận

```text
Path exists
```

Trường hợp chưa có path nhưng triple hợp lệ:

```text
No path yet, but valid triple exists.
```

Trường hợp relation chưa hợp lệ:

```text
No valid triple. Create NOTE-OPEN or propose meta rule.
```

Không tự thêm relation nếu chưa có valid triple.
