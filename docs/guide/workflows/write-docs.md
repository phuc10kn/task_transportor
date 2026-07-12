# Write Docs

## Input từ sync-product-change

Khi task bắt đầu từ code, incident hoặc product behavior change, nhận [sync-product-change.md](sync-product-change.md) result trước Bước 0.

- Chỉ nhận handoff `ready_for_write`.
- `blocked` phải quay clarification/decision; không sửa `docs/app` để hợp thức hóa code.
- Dùng behavior delta và evidence từ sync; không nhập lại.
- Canonical-home path trong sync result chỉ là **candidate**. Workflow này vẫn phải xác nhận home, unit type, schema và boundary.
- Nếu candidate home sai, authority thiếu hoặc conflict tái xuất hiện → trả lại [sync-product-change.md](sync-product-change.md), không cố tiếp tục.

Task prose không đổi behavior không cần input này.

## Bước 0: đặt thay đổi lên đường ray

Trước khi sửa file, phải xác định:

- task đang sửa canonical knowledge hay chỉ thêm ghi chú chưa chót;
- canonical home nằm ở `docs/app`, `docs/meta`, `docs/theories` hay `docs/AGENT_SKILLS`; reusable source nằm ở guide pack;
- unit cần sửa là README layer, entity instance, entity type, relation type, valid triple, theory hay decision;
- workflow trace impact có cần chạy sau khi sửa không.

Nếu chưa chắc canonical home hay unit type, quay lại [read-for-task.md](read-for-task.md). Nếu task là product/code behavior mà chưa có sync result `ready_for_write`, quay lại [sync-product-change.md](sync-product-change.md).


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

Gate này là **yêu cầu contract**, không phụ thuộc npm hay bất kỳ command cụ thể nào. Kiểm tra thủ công trên file type/instance là đủ để pass gate.

### Project tooling hooks (optional)

Chỉ dùng khi project **đã có** script/verify tương đương. Guide **không** bắt buộc `npm`, Node, hay tên script dưới đây.

Ví dụ local của `task_transportor` (không portable sang project khác):

```text
npm run verify:entity-type-contract -- --type <canonical-entity-type-path>
npm run verify:entity-type-contract -- --instance <docs/app-instance-readme-path>
npm run verify:entity-instance -- --instance <docs/app-instance-readme-path>
npm run verify:relations -- --instance <docs/app-instance-readme-path>
npm run verify:references -- --instance <docs/app-instance-readme-path>
```

- `--instance` của `entity-type-contract` chỉ xác nhận path resolve tới type có contract tối thiểu.
- `verify:entity-instance` / `relations` / `references` kiểm structural/reference contract; **không** chứng minh semantic meaning, evidence hay trace need.

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

Nếu chưa xác định được canonical home hoặc contract, không tự tạo knowledge unit. Khi project đã kích hoạt Workbench, chuyển [use-workbench.md](use-workbench.md); nếu chưa active, làm theo policy local trước khi quay lại workflow này.

## Bước 5: pre-check trước terminal gate

Trước khi handoff, tự kiểm nhanh:

- nội dung đã nằm đúng canonical home;
- guide không chứa app truth thay cho `docs/app`;
- app README layer không chứa generic theory dài;
- meta chỉ chứa luật/schema/convention, không chứa app-specific detail;
- entity mới không tự tạo relation ngoài slot của entity type;
- khi tạo entity mới:
  - nếu slot relation là `required_at_creation` thì target bắt buộc tồn tại trước khi tạo entity;
  - nếu slot relation là `allowed_when_known` thì relation ghi khi đã có fact và target; thiếu vẫn không phải lỗi hard;
- relation mới phải dùng slot, relation type và valid triple hợp lệ;
- một fact chỉ ghi một canonical direction; reverse = search / derived inverse / tooling — xem [relation-model.md](../concepts/relation-model.md); khi materialize edge trong `docs/app/`, tuân policy local (ví dụ [DEC-002](../../app/10-decisions/01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/README.md): không dual-write, không biến prose Related Entities thành edge nếu thiếu evidence);
- path, folder hoặc workflow không còn active không quay lại;
- nếu guide thay đổi, kiểm tra tác động tới `docs/AGENT_SKILLS`.

## Bước 6: emit write-docs result rồi handoff

Trước khi rời workflow này, emit `write-docs result` trong task/chat/PR theo [Output](#output).

- Nếu sync result hoặc task có entity/relation/impact chưa trace xong → [trace-impact.md](trace-impact.md).
- Sau đó luôn chạy [validate-after-change.md](validate-after-change.md) trước review/merge.
- Nếu sync gắn `implementation evidence pending: yes`, validate phải ghi pending/blocked tương ứng; không claim ready-to-merge chỉ vì docs đã viết.
- Có write-docs result **không** thay validate.

## Output

`write-docs result` là audit artifact của quyết định lúc viết. Nó sống trong task/chat/PR description.

Không phải source of truth. Không tạo file canonical trong `docs/app` / `docs/meta` chỉ để chứa report. Không thay [validate-after-change.md](validate-after-change.md).

### Full form

Dùng khi entity, relation, meta, theory hoặc decision đổi; hoặc khi tạo unit mới.

```md
## write-docs result

### Classification
- Task:
- Canonical home:
- Unit type:
- Schema / template used:
- Existing file reused: yes/no + path
- New unit (if any): path + reason

### Changes
- Paths:
- App truth changed: yes/no
- Meta contract changed: yes/no
- Theory / decision changed: yes/no

### Relations
- Added:
- Intentionally not added: + reason
- Rejected: + reason

### Evidence / decisions
- Sync result referenced: yes/no + verdict
- Sources:
- Decision/theory basis:
- Open conflicts / questions:

### Handoff
- trace-impact: yes/no + reason
- validate-after-change: required
- Next: trace-impact | validate-after-change | clarification | use-workbench
```

### Short form

Dùng khi typo, link fix hoặc wording nhỏ; không đổi behavior, schema hay relation.

```md
## write-docs result (short)

### Classification
- Canonical home:
- Unit type: prose / README layer

### Changes
- Paths:

### Handoff
- validate-after-change: required
- trace-impact: no
```

### Ceremony matrix

| Loại task | Form | Rule |
| --- | --- | --- |
| Typo / link / wording không đổi behavior | Short | Bắt buộc home + paths + validate handoff |
| README layer prose không đụng entity/relation | Short | Không bắt Relations section |
| Entity / relation / meta / theory / decision | Full | Bắt buộc Relations + Evidence |
| Code/product behavior đã qua sync | Full | Reference sync result; không nhập lại behavior delta |
| Undetermined-placement | Không emit write-docs result ready | Route [use-workbench.md](use-workbench.md) theo DEC-003; ngoài scope Workbench thì clarification theo policy local |

### Quy tắc cứng

1. Không cite `write-docs result` như app truth hoặc meta contract.
2. Không tạo file canonical trong `docs/app` / `docs/meta` chỉ để chứa report.
3. Không bỏ `validate-after-change` vì đã có write report.
4. `Intentionally not added` và `Rejected` phải có reason.
5. Sync `blocked` không được đi kèm write-docs result hợp lệ cho app truth change.

## Encoding (UTF-8)

Khi sửa file tiếng Việt bằng PowerShell hoặc script:

- đọc/ghi với encoding UTF-8 (ví dụ `Get-Content -Encoding UTF8`, `-Encoding UTF8` khi ghi);
- đặt console UTF-8 nếu cần (`[Console]::OutputEncoding`);
- không paste chuỗi đã mojibake; nếu thấy `Nếu` / ký tự combining lạ, sửa thành chữ Việt NFC chuẩn (`Nếu`) trước khi commit.
