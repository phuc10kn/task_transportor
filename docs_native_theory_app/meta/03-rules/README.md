# Rules

Định nghĩa combination hợp lệ:

```text
Source Entity Type + Relation Type + Target Entity Type
```

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
