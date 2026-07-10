# Write Docs

## Bước 0: đặt thay đổi lên đường ray

Trước khi sửa file, phải xác định:

- task đang sửa canonical knowledge hay chỉ thêm ghi chú chưa chót;
- canonical home nằm ở `docs/app`, `docs/meta`, `docs/theories` hay `docs/AGENT_SKILLS`; reusable source nằm ở guide pack;
- unit cần sửa là README layer, entity instance, entity type, relation type, valid triple, theory hay decision;
- workflow trace impact có cần chạy sau khi sửa không.

Nếu chưa chắc canonical home hay unit type, quay lại [read-for-task.md](read-for-task.md).

## Bước 1: phân loại knowledge

| Knowledge | Home |
| --- | --- |
| App-specific behavior/scope/rule | `docs/app/` |
| Documentation schema/rule/convention | `docs/meta/` |
| Reusable reasoning principle | `docs/theories/` |
| Universal app model / generic taxonomy | `docs/guide/reference/entity-maps/packs/universal/` |
| Methodology-specific template | `docs/guide/reference/entity-maps/packs/variants/` |
| Long-term choice/trade-off | `docs/app/10-decisions/` |

Sau khi xác định home là `docs/app/`, chọn layer/concern universal theo:

```text
docs/guide/reference/folder-structure.md
```

Entity type folder và instance path lấy từ entity type contract active trong `docs/meta/` hoặc cấu trúc local đã được project chốt. Không dùng tên concern rút gọn khi viết universal path, ví dụ `01-business/04-behavior/`.

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

## Type Contract Gate

Khi task tạo hoặc sửa entity type, type đó phải có explicit `schema` và `## structure extends`. Khi task tạo instance mới, kiểm tra type đích trước khi viết instance. Nếu type còn legacy, chuẩn hóa type trước; không tạo instance để né contract.

```text
npm run verify:entity-type-contract -- --type <canonical-entity-type-path>
```

Sau khi instance đã tồn tại, kiểm tra thêm mapping canonical:

```text
npm run verify:entity-type-contract -- --instance <docs/app-instance-readme-path>
```

Type legacy chưa có instance và không bị sửa chỉ là debt được audit; không cần rewrite hàng loạt.

## Bước 2: sửa file hiện có trước

Không tạo file mới nếu nội dung vẫn trùng chủ đề với file hiện có.

Ví dụ:

```text
<Requirement summary>
```

Thông thường cập nhật `docs/app/02-product`, `docs/app/05-architecture`, hoặc `docs/app/08-quality`; không tạo file thừa nếu chưa có entity đã rõ.

## Bước 3: kiểm tra boundary

Không đưa:

- code/schema/API detail vào business layer;
- app-specific detail vào pure theory;
- relation chưa có slot/meta rule vào app docs như canonical relation;
- decision rationale dài vào implementation file.

Không tự tạo metadata field, heading hoặc relation mới nếu schema trong `docs/meta/00-schemas/` chưa cho phép.

## Bước 4: dừng khi chưa có canonical home

Nếu chưa xác định được canonical home hoặc contract, không tự tạo knowledge unit. Làm theo lifecycle local của project trước khi quay lại workflow này.

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
- path, folder hoặc workflow không còn active không quay lại;
- nếu guide thay đổi, kiểm tra tác động tới `docs/AGENT_SKILLS`.
