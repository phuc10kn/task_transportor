# Variants

Methodology/style overlay: **bộ entity type mới** của một layer. Chia theo layer:

```text
variants/<variant-name>/
  README.md
  <layer>/
    README.md
    entity-types.md
    interaction-map.md
```

Ví dụ: `variants/ddd/04-domain`, `variants/modular-monolith/05-architecture`.

Default map vẫn ở [../](../README.md). Variant **không thay** default.

## Rule (bắt buộc)

```text
Style mới làm vocabulary type + relation của layer X
bắt buộc đổi theo
  → mới được có variants/<name>/X/

Style mới nhưng vocabulary layer Y vẫn dùng được
  → Y không có variant (kể cả khi app_variants có template Y)
```

Ví dụ đúng:

- Architecture modular monolith → vocabulary Module, ModuleBoundary, … → `variants/modular-monolith/05-architecture/`
- Domain theo DDD → vocabulary Aggregate, ValueObject, … → `variants/ddd/04-domain/`

Ví dụ sai:

- Technical vẫn Platform / DataStore / … dù architecture đổi → **không** nhét `06` vào variant
- Có [raw_app_original/06-technical/](../../../../app_variants/raw_app_original/06-technical/README.md) → đó là generic taxonomy/example, không phải entity-map variant

Chi tiết: [../README.md](../README.md) § *Rule: khi nào là Variants*.

## Biến thể hiện có

| Variant | Layers (sinh type pack mới) | Path |
| --- | --- | --- |
| DDD (tactical) | `04-domain` | [ddd/](ddd/README.md) |
| Modular monolith | `05-architecture` | [modular-monolith/](modular-monolith/README.md) |

## Luật

1. Chỉ tạo `variants/<name>/<layer>/` khi layer đó có bộ type mới theo style.
2. Không gắn mục Variants trên default map nếu chưa có pack folder tương ứng.
3. Tên variant: `kebab-case`.
