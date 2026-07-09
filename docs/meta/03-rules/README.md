# Rules

Định nghĩa combination hợp lệ:

```text
Source Entity Type + Relation Type + Target Entity Type
```

`03-rules/` là source of truth cho valid usage của relation ở mức entity type.

`02-relation-types/` định nghĩa vocabulary và meaning. `03-rules/` quyết định relation đó có được dùng giữa hai entity type cụ thể hay không. Entity instance vẫn chỉ được ghi relation nếu entity type của nó có slot tương ứng trong `relations_template`.

Schema canonical cho valid triple rule nằm ở:

```text
docs/meta/00-schemas/valid-triple-rule.md
```

## Cấu trúc

Mirror các layer đã có valid-triples canonical trong `docs/meta/`; hiện gồm `00-context` → `05-architecture`, cùng `cross-layer`.

| Path | Nội dung |
|------|----------|
| [00-context/valid-triples.md](00-context/valid-triples.md) | Rules trong context layer |
| [01-business/valid-triples.md](01-business/valid-triples.md) | Rules trong business layer |
| [02-product/valid-triples.md](02-product/valid-triples.md) | Rules trong product layer |
| [03-interface/valid-triples.md](03-interface/valid-triples.md) | Rules trong interface layer |
| [04-domain/valid-triples.md](04-domain/valid-triples.md) | Rules trong domain layer |
| [05-architecture/valid-triples.md](05-architecture/valid-triples.md) | Rules trong architecture layer |
| [cross-layer/valid-triples.md](cross-layer/valid-triples.md) | Rules xuyên layer |

## Phân biệt

```text
Meta Rule     → schema: combination nào hợp lệ
Theory        → nguyên lý suy luận
App Rule      → instance cụ thể (MOD-001 không depend MOD-003)
```

## Cardinality

Mặc định `0..n` trừ khi file rule ghi rõ `1..1` hoặc `1..n`.

## Source Of Truth Theo Layer

Valid triple chỉ có một source of truth:

- Entity type cùng layer: ghi trong `docs/meta/03-rules/<layer>/valid-triples.md`.
- Entity type khác layer: ghi trong `docs/meta/03-rules/cross-layer/valid-triples.md`.

Không duplicate cùng một triple giữa layer-local file và `cross-layer/valid-triples.md`.

`relations_template` vẫn nằm ở entity type source, vì nó quyết định entity instance nào được phép ghi relation slot. Ví dụ `BusinessRequirement --derived_from--> Problem` có slot ở `BusinessRequirement`, nhưng valid triple source of truth nằm trong `cross-layer/valid-triples.md`.

## Graph thưa, không ép pipeline

Valid triple và relation slot cho phép một edge tồn tại, nhưng không bắt mọi entity instance phải có edge đó nếu slot không required.

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
1. kiểm tra entity type có slot trong relations_template chưa;
2. kiểm tra relation type đã tồn tại chưa;
3. kiểm tra valid triple đã tồn tại chưa;
4. nếu thiếu slot hoặc meta rule, reject relation ở entity instance;
5. chỉ thêm slot/rule mới khi semantic đủ rõ.
```
