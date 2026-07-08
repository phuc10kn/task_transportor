# Structure Extends

`structure extends` là cơ chế để entity type đặc thù thêm cấu trúc riêng mà vẫn tuân thủ base schema.

## Base Rule

Mọi entity instance bắt đầu từ:

```text
entity-instance/v1
```

Base schema chỉ giữ phần chung:

- frontmatter identity;
- `Summary`;
- `Meaning`;
- `Relations`;
- `Validation Notes`.

Phần khác biệt theo từng `entity_type` phải nằm trong chính entity type definition ở:

```text
docs/meta/01-entity-types/**/<entity-type>.md
```

Không đặt per-type extension trong `docs/guide`. Guide chỉ giữ template sử dụng.

Trong `## structure extends`, entity type được phép:

- thêm required body section;
- thêm optional body section;
- siết validation rule;
- siết relation cardinality nếu đã có valid triple;
- định nghĩa lifecycle riêng.

Entity type không được:

- bỏ required frontmatter của base;
- bỏ base body sections `Summary`, `Meaning`, `Relations`, `Validation Notes`;
- đổi meaning của field base;
- cho phép relation chưa canonical;
- thêm section tùy ý mà không khai báo.

## Extension Ownership

| Nội dung | Source of truth |
| --- | --- |
| Field/section chung của mọi entity | `docs/meta/00-schemas/entity-instance.md` |
| Section riêng của từng entity type | `docs/meta/01-entity-types/**/<entity-type>.md` |
| Valid relation giữa entity type | `docs/meta/03-rules/**/valid-triples.md` |
| Template copy nhanh | `docs/guide/unit-structure/` |

Nếu entity type không có `structure extends`, instance của type đó dùng base schema và core sections mặc định `Responsibility`, `Rules`.

## Declaration Format

Trong entity type definition:

```md
## structure extends

Base: `entity-instance/v1`

Required sections:

- `Trigger`
- `Participants`
- `Steps`
- `Outcomes`

Optional sections:

- `Inputs`
- `Decisions`
- `Exceptions`

Additional validation:

- Không mô tả API, database, technical implementation.
```

## Instance Format

Entity instance của type đó phải giữ base sections và thêm section required của extension.

```md
# PROC-001 - Backlog To CIS Lite Flow

## Summary

## Meaning

## Trigger

## Participants

## Steps

## Outcomes

## Rules

## Relations

## Validation Notes
```

## Extension Levels

| Level | Khi dùng | Example |
| --- | --- | --- |
| Base | Entity type chưa cần cấu trúc riêng. | `GlossaryTerm`. |
| Type extension | Mọi instance của type cần cùng section riêng. | `Process` cần `Trigger`, `Steps`, `Outcomes`. |
| Variant extension | Một subtype lặp lại nhiều lần trong cùng entity type. | `ArchitectureFlow` dưới `InteractionFlow`. |

## Variant Extension Rule

Variant chỉ được tạo khi có ít nhất hai instance tiềm năng và structure khác base type đủ rõ.

Nếu chỉ có một case đặc biệt, dùng section optional đã khai báo hoặc `NOTE-OPEN`; không tạo schema riêng.
