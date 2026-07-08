# Example: Relation Trace

## Task

Kiểm tra một Business Problem có dẫn tới Product Requirement hay không.

## Workflow

```text
1. Tìm Problem ID.
2. Xác định target Product entity type.
3. Tra relation slot trong entity type của source.
4. Tra docs/meta/03-rules/cross-layer/valid-triples.md.
4. Search Problem ID bằng rg.
5. Kiểm tra frontmatter `relations`.
6. Validate từng hop.
```

## Kết luận

```text
Path exists
```

Trường hợp chưa có path nhưng slot optional và triple hợp lệ:

```text
No path yet, but slot is optional.
```

Trường hợp relation chưa hợp lệ:

```text
No relation slot or no valid triple. Reject relation from entity instance.
```

Không tự thêm relation nếu chưa có relation slot và valid triple.
