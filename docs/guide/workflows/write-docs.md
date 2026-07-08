# Write Docs

## Bước 0: đặt thay đổi lên đường ray

Trước khi sửa file, phải xác định:

- task đang sửa canonical knowledge hay chỉ thêm ghi chú chưa chốt;
- canonical home nằm ở `docs/app`, `docs/meta`, `docs/theories`, `docs/app_variants` hay `docs/AGENT_SKILLS`;
- unit cần sửa là README layer, entity instance, entity type, relation type, valid triple, theory hay decision;
- workflow trace impact có cần chạy sau khi sửa không.

Nếu chưa xác định được canonical home hoặc unit type, quay lại [read-for-task.md](read-for-task.md).

## Bước 1: phân loại knowledge

| Knowledge | Home |
| --- | --- |
| App-specific behavior/scope/rule | `docs/app/` |
| Documentation schema/rule/convention | `docs/meta/` |
| Reusable reasoning principle | `docs/theories/` |
| Reusable technical taxonomy/template | `docs/app_variants/` |
| Long-term choice/trade-off | `docs/app/10-decisions/` |
| Candidate/chưa chắc | Chưa có home đang hoạt động; dùng `NOTE-OPEN` hoặc giữ ngoài docs cho tới khi đủ promote. |

Sau khi xác định home là `docs/app/`, chọn layer, concern và entity type theo:

```text
docs/guide/reference/folder-structure.md
```

Không dùng tên concern rút gọn nếu đang viết path. Path chuẩn có prefix số như `01-business/04-behavior/01-processes/`.

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

- Không tạo unit mới nếu chưa chọn được schema canonical.
- Không tự tạo schema name trong guide.
- Nếu schema chưa tồn tại trong `docs/meta/00-schemas/`, dừng và xử lý ở `docs/meta` trước.
- Nếu chỉ cần ví dụ hoặc cách dùng schema, sửa `docs/guide/unit-structure/`, không sửa schema canonical.

## Bước 2: sửa file hiện có trước

Không tạo file mới nếu nội dung vẫn cùng chủ đề với file hiện có.

Ví dụ:

```text
Dry-run Jira requirement
```

thường nên cập nhật `docs/app/02-product`, `docs/app/05-architecture`, hoặc `docs/app/08-quality`, không tạo một file lẻ nếu chưa có entity rõ.

## Bước 3: kiểm tra boundary

Không đưa:

- code/schema/API detail vào business layer;
- app-specific detail vào pure theory;
- relation chưa có slot/meta rule vào app docs như relation canonical;
- decision rationale dài vào implementation file.

Không tự tạo metadata field, heading hoặc relation mới nếu schema trong `docs/meta/00-schemas/` chưa cho phép.

## Bước 4: ghi uncertainty rõ

Nếu chưa chắc:

```text
NOTE-OPEN
NOTE-CANDIDATE
NOTE-CONFLICT
NOTE-DECISION
NOTE-THEORY
```

Không đưa vào `docs/workbench/` vì workbench hiện chưa được đi vào hoạt động.

## Bước 5: review sau khi sửa

Trước khi kết thúc, kiểm tra:

- nội dung đã nằm đúng canonical home;
- guide không chứa app truth thay cho `docs/app`;
- app README layer không chứa generic theory dài;
- meta chỉ chứa luật/schema/convention, không chứa app-specific detail;
- entity mới không tự tạo relation ngoài slot của entity type;
- relation mới dùng slot, relation type và valid triple hợp lệ;
- path cũ, folder cũ và retired workflow không quay lại;
- nếu workflow guide đổi, kiểm tra tác động tới `docs/AGENT_SKILLS`.
