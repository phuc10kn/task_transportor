# Variants

`variants/` là methodology/style **reading overlay** theo layer. Nó chỉ giữ câu hỏi đọc, status và graph; source entity-type/relation template luôn nằm trong `packs/variants/`.

```text
variants/<variant-name>/
  README.md
  <layer>/
    README.md
    entity-types.md      <- view/index, không phải source template
    interaction-map.md   <- view graph
```

Ví dụ: `variants/ddd/04-domain`, `variants/modular-monolith/05-architecture`.

Default map vẫn ở [../](../README.md). Variant view **không thay** default map hoặc source pack.

## Rule (bắt buộc)

```text
Style mới làm vocabulary type + relation của layer X
bắt buộc đổi theo, và đã có source pack tương ứng
  → mới được có variants/<name>/X/ reading view

Style mới nhưng vocabulary layer Y vẫn dùng được
  → Y không có variant view (kể cả khi reusable pack có template Y)
```

Ví dụ đúng:

- Architecture modular monolith → vocabulary Module, ModuleBoundary, … → `variants/modular-monolith/05-architecture/`
- Domain theo DDD → vocabulary Aggregate, ValueObject, … → `variants/ddd/04-domain/`

Ví dụ sai:

- Technical vẫn Platform / DataStore / … dù architecture đổi → **không** nhét `06` vào variant
- Có universal pack cho `06-technical` → đó là generic taxonomy/example, không phải entity-map variant

Chi tiết: [../README.md](../README.md) § *Rule: khi nào là Variants*.

## Biến thể hiện có

| Variant | Layers có reading view | Path |
| --- | --- | --- |
| DDD (tactical) | `04-domain` | [ddd/](ddd/README.md) |
| Modular monolith | `05-architecture` | [modular-monolith/](modular-monolith/README.md) |

## Luật

1. Chỉ tạo `variants/<name>/<layer>/` khi layer đó có type/relation phụ thuộc style và source pack tương ứng.
2. Không gắn mục Variants trên default map nếu chưa có pack source folder tương ứng.
3. Tên variant: `kebab-case`.
