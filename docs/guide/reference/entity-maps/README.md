# Entity Maps

Default map theo **layer**. Variant chỉ khi vocabulary type và relation của layer phụ thuộc methodology/style.

Universal layer + concern baseline: [folder-structure.md](../folder-structure.md).

## Cấu trúc

```text
entity-maps/
├── overview.md
├── 00-context.md … 10-decisions.md   ← default map theo layer
├── variants/                         ← reading overlay (view)
│   ├── ddd/04-domain/
│   └── modular-monolith/
│       └── 05-architecture/
└── packs/                            ← stable reusable source
    ├── universal/
    └── variants/
        ├── ddd/
        └── modular-monolith/
```

`variants/<name>/<layer>/` là reading view (câu hỏi/status/graph).  
`packs/variants/<name>/` là source template reusable. Không nhầm view với source.

## Rule: khi nào là Variant

Dùng phép thử đổi methodology:

```text
Đổi methodology/style mà vocabulary entity type và relation
của layer bắt buộc phải đổi theo
  → variant-bound.

Đổi methodology/style nhưng vocabulary vẫn dùng được
  → default/generic.
```

Chỉ tạo `variants/<name>/<layer>/` khi đồng thời có:

1. type names hoặc semantics phụ thuộc methodology/style;
2. interaction graph của layer phụ thuộc methodology/style;
3. type pack thật cho đúng layer.

Reusable stable source nằm trong `entity-maps/packs/`. Project tự quản lý provenance và lifecycle local; source pack không tự chứng minh một layer có entity-map variant.

Guide giữ stable source pack; meta giữ contract active của project; app không khai báo methodology runtime.

## Ownership Nội Dung

- Default map chỉ giữ câu hỏi đọc (theo layer-model), concern lens và route sang universal pack. Không nhúng type list, relation graph hay triple của `docs/meta` hoặc của một variant.
- Variant map chỉ giữ reading view khi vocabulary phụ thuộc methodology/style; không thay default.
- `folder-structure.md` giữ path layer/concern universal; pack giữ stable taxonomy, type template và relation/rule template.
- `docs/meta/` giữ relation slot và valid triple canonical của project.
- Không lặp concern table, type list hoặc triple table từ pack/meta vào map; map link tới owner thay vì chép lại.

## Luật khác

1. Map layer mặc định nằm ngay dưới `entity-maps/`.
2. Map phải thể hiện knowledge structure hoặc relation; chỉ dùng Mermaid khi diagram giúp đọc tốt hơn prose.
3. Entity map phải có type set, hoặc ghi rõ type set/graph chưa được chốt và cần bổ sung.
4. Luôn mở default map trước; chỉ đọc variant khi layer có type pack đã chốt.

Đọc: [overview.md](overview.md). Variants: [variants/](variants/README.md). Packs: [packs/](packs/README.md).
