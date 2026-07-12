# Unit Structure

`unit-structure/` chứa template Markdown/YAML dùng khi tạo hoặc sửa một knowledge unit.

Canonical schema vẫn nằm ở:

```text
docs/meta/00-schemas/
```

Folder này chỉ giúp người viết và AI có skeleton dùng ngay, thay vì tự bịa heading, metadata field hoặc relation block.

## Units

| Unit | Dùng khi |
| --- | --- |
| [entity](entity/README.md) | Tạo entity instance trong `docs/app/**/<ID-slug>/README.md`. |
| [entity-type](entity-type/README.md) | Tạo hoặc sửa entity type definition. |
| [entity-relations](entity-relations/README.md) | Ghi relation block cho entity. |
| [relation-type](relation-type/README.md) | Tạo hoặc sửa relation type definition. |
| [valid-triple](valid-triple/README.md) | Tạo hoặc sửa valid triple rule. |
| [theory](theory/README.md) | Tạo hoặc sửa theory package trong `docs/theories/`. |
| [decision](decision/README.md) | Tạo hoặc sửa decision trong `docs/app/10-decisions/`. |

## Rule

- Dùng template ở đây để viết nhanh.
- Dùng `docs/meta/00-schemas/` để validate.
- Nếu template và schema mâu thuẫn, sửa template theo schema.
- Không thêm field mới vào template nếu schema canonical chưa cho phép.
