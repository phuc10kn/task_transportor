# Entity Maps

Default map theo **layer**. Variant chỉ khi vocabulary type và relation của layer phụ thuộc methodology/style.

Layer + concern SoT: [folder-structure.md](../folder-structure.md).

## Cấu trúc

```text
entity-maps/
├── overview.md
├── 00-context.md … 10-decisions.md   ← default map theo layer
└── variants/
    ├── ddd/04-domain/
    └── modular-monolith/
        └── 05-architecture/
```

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

`docs/app_variants/**` là template/candidate, không tự chứng minh một layer có entity-map variant.

Status ownership của `04-domain` và `05-architecture` còn mở: meta đang giữ type canonical, trong khi guide vẫn cần đánh giá type pack có thực sự variant-bound hay không.

## Luật khác

1. Map layer mặc định nằm ngay dưới `entity-maps/`.
2. Map phải thể hiện knowledge structure hoặc relation; chỉ dùng Mermaid khi diagram giúp đọc tốt hơn bảng/prose.
3. Entity map phải có type set, hoặc ghi rõ type set/graph chưa được chốt và cần bổ sung.
4. Luôn mở default map trước; chỉ đọc variant khi layer có type pack đã chốt.

Đọc: [overview.md](overview.md). Variants: [variants/](variants/README.md).
