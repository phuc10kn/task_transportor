# Rules

Định nghĩa combination hợp lệ:

```text
Source Entity Type + Relation Type + Target Entity Type
```

`03-rules/` là source of truth cho valid usage của relation.

`02-relation-types/` định nghĩa vocabulary và meaning. `03-rules/` mới quyết định relation đó có được dùng giữa hai entity type cụ thể hay không.

## Cấu trúc

Mirror `docs/app/` layers (00-context → 04-domain) + cross-layer.

| Path | Nội dung |
|------|----------|
| [00-context/valid-triples.md](00-context/valid-triples.md) | Rules trong context layer |
| [01-business/valid-triples.md](01-business/valid-triples.md) | Rules trong business layer |
| [02-product/valid-triples.md](02-product/valid-triples.md) | Rules trong product layer |
| [03-ui/valid-triples.md](03-ui/valid-triples.md) | Rules trong ui layer |
| [04-domain/valid-triples.md](04-domain/valid-triples.md) | Rules trong domain layer |
| [cross-layer/valid-triples.md](cross-layer/valid-triples.md) | Rules xuyên layer |

## Phân biệt

```text
Meta Rule     → schema: combination nào hợp lệ
Theory        → nguyên lý suy luận
App Rule      → instance cụ thể (MOD-001 không depend MOD-003)
```

## Cardinality

Mặc định `0..n` trừ khi file rule ghi rõ `1..1` hoặc `1..n`.

## Graph thưa, không ép pipeline

Valid triple cho phép một edge tồn tại, nhưng không bắt mọi entity instance phải có edge đó.

Mặc định:

```text
0..n
```

nghĩa là graph có thể thưa. Không lấp đầy relation chỉ để tạo chuỗi đẹp.

Ví dụ, một `Problem` có thể dừng ở relation trong business layer nếu chưa có product requirement tương ứng.

## Không nhảy cóc nếu chưa có valid triple

Một trace path nên đi qua các hop đã được định nghĩa trong `03-rules/`.

Không ghi relation trực tiếp giữa hai entity xa nhau chỉ vì con người thấy chúng "có liên quan".

Nếu cần nối trực tiếp:

```text
1. kiểm tra relation type đã tồn tại chưa;
2. kiểm tra valid triple đã tồn tại chưa;
3. nếu chưa có, dùng NOTE-OPEN hoặc Open Relation Question;
4. chỉ thêm rule mới khi semantic đủ rõ.
```
