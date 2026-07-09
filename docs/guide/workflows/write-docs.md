# Write Docs

## Bước 0: đặt thay đổi lên đường ray

Trước khi sửa file, phải xác định:

- task đang sửa canonical knowledge hay chỉ thêm ghi chú chưa chót;
- canonical home nằm ở `docs/app`, `docs/meta`, `docs/theories`, `docs/app_variants` hay `docs/AGENT_SKILLS`;
- unit cần sửa là README layer, entity instance, entity type, relation type, valid triple, theory hay decision;
- workflow trace impact có cần chạy sau khi sửa không.

Nếu chưa chắc canonical home hay unit type, quay lại [read-for-task.md](read-for-task.md).

## Bước 1: phân loại knowledge

| Knowledge | Home |
| --- | --- |
| App-specific behavior/scope/rule | `docs/app/` |
| Documentation schema/rule/convention | `docs/meta/` |
| Reusable reasoning principle | `docs/theories/` |
| Universal app model / generic taxonomy | `docs/app_variants/raw_app_original/` |
| Methodology-specific template | `docs/app_variants/custom_modular_monolith/` |
| Long-term choice/trade-off | `docs/app/10-decisions/` |
| Candidate/chưa chốt | Chưa có home đang hoạt động; dùng `NOTE-OPEN` hoặc note ngoài docs cho tới khi promote. |

Sau khi xác định home là `docs/app/`, chọn layer, concern và entity type theo:

```text
docs/guide/reference/folder-structure.md
```

Không dùng tên concern rút gọn khi viết path. Path chuẩn có prefix số như `01-business/04-behavior/01-processes/`.

Trước khi tạo hoặc sửa knowledge unit, chọn schema canonical:

| Unit | Schema canonical | Template |
| --- | --- | --- |
| Entity instance | `docs/meta/00-schemas/entity-instance.md` | [entity](../unit-structure/entity/README.md) |
| Entity type definition | `docs/meta/00-schemas/entity-type-definition.md` | [entity-type](../unit-structure/entity-type/README.md) |
| Entity structure extension | `docs/meta/00-schemas/structure-extends.md` | [entity-type](../unit-structure/entity-type/README.md) |
| Entity relation block | `docs/meta/00-schemas/entity-instance.md`, entity type `relations_template` và `docs/meta/03-rules/` | [entity-relations](../unit-structure/entity-relations/README.md) |
| Relation type definition | `docs/meta/00-schemas/relation-type-definition.md` | [relation-type](../unit-structure/relation-type/README.md) |
| Valid triple rule | `docs/meta/00-schemas/valid-triple-rule.md` | [valid-triple](../unit-structure/valid-triple/README.md) |
| Theory package | `docs/meta/00-schemas/theory-package.md` | [theory](../unit-structure/theory/README.md) |
| Decision record | `docs/meta/00-schemas/decision.md` | [decision](../unit-structure/decision/README.md) |

Schema gate:

- Không tạo unit mới nếu chưa chọn schema canonical.
- Không tự tạo schema name trong guide.
- Nếu schema chưa tồn tại trong `docs/meta/00-schemas/`, xử lý trước ở `docs/meta`.
- Nếu chỉ cần ví dụ hoá schema, sửa guide/unit template, không sửa schema canonical.

## Bước 2: sửa file hiện có trước

Không tạo file mới nếu nội dung vẫn trùng chủ đề với file hiện có.

Ví dụ:

```text
Dry-run Jira requirement
```

Thông thường cập nhật `docs/app/02-product`, `docs/app/05-architecture`, hoặc `docs/app/08-quality`; không tạo file thừa nếu chưa có entity đã rõ.

## Bước 3: kiểm tra boundary

Không đưa:

- code/schema/API detail vào business layer;
- app-specific detail vào pure theory;
- relation chưa có slot/meta rule vào app docs như canonical relation;
- decision rationale dài vào implementation file.

Không tự tạo metadata field, heading hoặc relation mới nếu schema trong `docs/meta/00-schemas/` chưa cho phép.

## Bước 4: ghi uncertainty rõ

Nếu chưa chắc:

- NOTE-OPEN
- NOTE-CANDIDATE
- NOTE-CONFLICT
- NOTE-DECISION
- NOTE-THEORY

Không đưa vào `docs/workbench/` khi workbench chưa được kích hoạt.

## Bước 5: review sau khi sửa

Trước khi kết thúc, kiểm tra:

- nội dung đã nằm đúng canonical home;
- guide không chứa app truth thay cho `docs/app`;
- app README layer không chứa generic theory dài;
- meta chỉ chứa luật/schema/convention, không chứa app-specific detail;
- entity mới không tự tạo relation ngoài slot của entity type;
- khi tạo entity mới:
  - nếu slot relation là `required_at_creation` thì target bắt buộc tồn tại trước khi tạo entity;
  - nếu slot relation là `allowed_when_known` thì relation ghi khi đã có fact và target; thiếu vẫn không phải lỗi hard;
- relation mới phải dùng slot, relation type và valid triple hợp lệ;
- path, folder, workflow retired không quay lại;
- nếu guide thay đổi, kiểm tra tác động tới `docs/AGENT_SKILLS`.
