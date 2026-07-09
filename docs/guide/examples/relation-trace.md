# Example: Relation Trace

## Task

Kiểm tra một `Problem` có đang được trace bởi `BusinessRequirement` nào không.

## Nguyên tắc

- `Problem` trong ví dụ này là query anchor.
- Canonical source của edge không phải `Problem`.
- Edge cần kiểm tra là:

```text
BusinessRequirement --derived_from--> Problem
```

Không suy ra từ đó rằng `Problem` phải có slot outbound sang `BusinessRequirement`.
Không tạo inverse canonical chỉ để query ngược.

## Workflow

```text
1. Tìm Problem ID.
2. Xác định canonical edge cần kiểm tra:
   BusinessRequirement --derived_from--> Problem
3. Tra docs/meta/03-rules/cross-layer/valid-triples.md.
4. Tra relation slot `derived_from` trong entity type canonical của `BusinessRequirement`.
5. Search các `BusinessRequirement` instance có frontmatter `relations.derived_from` chứa Problem ID.
6. Validate từng hit theo slot, relation type, direction và target instance.
```

## Kết luận

```text
Path exists:
BusinessRequirement --derived_from--> Problem
```

Trường hợp chưa có path nhưng slot là `allowed_when_known` và triple hợp lệ:

```text
No path yet.
Query anchor exists, but canonical source has not recorded the edge.
```

Trường hợp relation chưa hợp lệ:

```text
No relation slot or no valid triple. Reject relation from entity instance.
```

Trường hợp bắt đầu từ query anchor:

```text
Anchor = Problem
Canonical source = BusinessRequirement
```

Search bắt đầu từ `Problem` chỉ là cách truy vấn.
Nó không đổi canonical direction của relation.

Không tự thêm relation nếu chưa có relation slot và valid triple.
