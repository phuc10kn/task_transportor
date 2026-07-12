# Validate After Change

Terminal gate sau `write-docs`, `trace-impact` hoặc `slim-layer-readme`.

Workflow này tạo bằng chứng kết thúc chung cho human và agent. Luật validation chi tiết thuộc [validation-model.md](../../meta/04-conventions/validation-model.md); file này không nhân bản contract meta.

## Trigger

Chạy khi:

- vừa tạo hoặc sửa knowledge unit;
- vừa thêm/sửa relation;
- vừa slim layer README;
- chuẩn bị handoff/review hoặc merge docs.

Không cần chạy cho task chỉ đọc. Không thay [sync-product-change.md](sync-product-change.md); sync chỉ là intake trước write.

## Input

- danh sách path đã đổi;
- loại unit: README layer, entity instance, entity type, relation type, valid triple, theory, decision hoặc guide prose;
- kết quả `read-for-task` / `trace-impact` nếu đã chạy;
- `write-docs result` nếu task đi qua [write-docs.md](write-docs.md) (optional evidence input);
- `product-change sync result` nếu task đi qua [sync-product-change.md](sync-product-change.md) (optional evidence input);
- local tooling hooks của project (nếu có).

`write-docs result` giúp reviewer thấy classification home, relation intent và handoff lúc viết. Sync result giúp kiểm conflict/authority và coverage test. **Không** artifact nào thay checklist schema/relation của workflow này.

## Workflow

```text
1. Xác định scope path và unit type đã đổi.
2. Validate placement và canonical authority.
3. Validate schema/frontmatter/body sections nếu unit schema-managed.
4. Validate entity type, ID, status và naming.
5. Validate relation slot/type/triple/direction/target nếu có.
6. Validate references tới theory/decision/entity.
7. (Optional) Chỉ khi project có tooling local: chạy command áp dụng cho phạm vi và ghi coverage thật.
8. Ghi Passed / Violations / Warnings / Open questions.
9. Verdict: ready | blocked | accepted-gap.
```

Checklist thủ công (bước 2–6) là **bắt buộc**. Không có npm/script vẫn kết thúc được workflow nếu checklist pass.

## Checklist

### Placement / boundary

- Canonical home đúng (`docs/app`, `docs/meta`, `docs/theories`, guide pack, decision).
- Guide không chứa app truth thay `docs/app`.
- Meta không chứa app-specific detail.
- Theory không chứa implementation cụ thể.

### Schema / type

- Schema-managed unit có schema canonical và required fields.
- Entity type resolve được; type mới/sửa có `schema` và `## structure extends`.
- Instance path khớp type directory trong meta hoặc cấu trúc local đã chốt.

### Relation / reference

- Relation chỉ dùng slot trong `relations_template`.
- Relation type, valid triple và direction đúng.
- Target tồn tại nếu slot được điền.
- Reference tới theory/decision/entity resolve được hoặc ghi accepted gap.

Chi tiết relation/trace: [trace-impact.md](trace-impact.md) và [validation-model.md](../../meta/04-conventions/validation-model.md).

## Project tooling hooks (optional)

Bước này **không** thuộc contract xuyên dự án của guide.

- Không có tooling local → bỏ qua; dựa checklist + report.
- Có tooling → chạy đúng phạm vi và **không claim quá coverage**.
- Guide **không** bắt buộc `npm`, Node, hay tên script của bất kỳ repo nào.

Ví dụ local của `task_transportor` (minh họa coverage, không portable):

| Command (local only) | Coverage thật |
| --- | --- |
| `npm run verify:entity-type-contract -- --type <path>` | Type có `schema` + `## structure extends` |
| `npm run verify:entity-type-contract -- --instance <path>` | Path instance resolve tới type có contract tối thiểu; **không** validate body/relations của instance |
| `npm run verify:entity-instance -- --instance <path>` / `verify:entity-instance:architecture` | Frontmatter, ID/slug/folder, base + type-required sections; **không** semantic/evidence |
| `npm run verify:relations -- --instance <path>` / `verify:relations:architecture` | Slot, relation type, valid triple, target exists/type; **không** trace need |
| `npm run verify:references -- --instance <path>` / `verify:references:architecture` | `theory_basis` / `decision_basis` resolve; **không** quét prose body links |
| `npm run verify:workbench` | Structural contract của Workbench item/registry theo policy local; **không** semantic/authority/promotion approval |
| `npm run verify:docs` | Link/anchor trong guide, AGENT_SKILLS, workbench, review; **không** quét `docs/app` / `docs/meta` |
| `npm run verify:architecture-baseline` | Frozen inventory/edge graph `docs/app/05-architecture` (bổ sung, không thay generic verifiers) |
| `npm run verify:phaseXX` / `npm test` | Behavior code/product theo phase + scoped docs contract gates |

Structural verifier pass **không** thay checklist semantic (meaning, boundary, evidence, trace need). Dùng `meta-validate` / human review cho các mục đó.

## Stop condition

`blocked` nếu:

- thiếu canonical home hoặc contract;
- relation thiếu slot / relation type / valid triple / target bắt buộc;
- local command **mà project đã chọn là bắt buộc cho scope** fail;
- evidence không đủ để nâng candidate thành app truth;
- code và app truth mâu thuẫn chưa có quyết định;
- sync result gắn `implementation evidence pending: yes` trong khi docs claim behavior active đã sẵn sàng merge.

`accepted-gap` chỉ khi gap có chủ đích, slot cho phép thiếu, và đã ghi lý do.

## Output

```md
## validate-after-change result

### Scope
- Paths:
- Unit types:

### Passed
- ...

### Violations
- ...

### Warnings
- ...

### Commands
- command:
  result:
  coverage:

### Open questions
- ...

### Verdict
ready | blocked | accepted-gap
```

## Handoff

- `ready` → review/merge hoặc task tiếp theo.
- `blocked` → quay `write-docs` / `trace-impact` / meta update theo violation.
- Agent checklist chi tiết: `docs/AGENT_SKILLS/meta-validate/SKILL.md` (không thay workflow này).
