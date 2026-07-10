# Review Chung - Documentation System

Ngày cập nhật: 2026-07-10

## Mục Đích

Đây là review artifact chung duy nhất trong `docs/review/`. File chỉ giữ finding còn hiệu lực, open question cần quyết định và snapshot đã được xác nhận; nó không thay thế source of truth trong `docs/meta/`, `docs/app/`, `docs/theories/` hoặc `docs/guide/`.

Khi một finding được giải quyết, xóa nó khỏi file này. Decision, migration provenance và lịch sử triển khai thuộc canonical home local của project, không nằm ở review.

## Snapshot Đã Xác Nhận

- Guide là manual xuyên dự án và stable reusable source; `docs/meta/` giữ contract active, `docs/app/` giữ app truth. Boundary này đã được chốt tại [DEC-001](../app/10-decisions/01-decision-making/01-decisions/DEC-001-guide-pack-materialization/README.md).
- Standard agent là đường mặc định; workbench chỉ là support path local và hiện chưa active trong `task_transportor`.
- `docs/meta/01-entity-types/` có 52 entity type definition cho layers `00` đến `05`; cả 52 có `relations_template`.
- 17/52 entity type đã có explicit `schema` và `structure extends`; 35 type legacy đang kế thừa base schema theo [entity-type-definition.md](../meta/00-schemas/entity-type-definition.md). Type Contract Gate chặn legacy type khi type bị sửa hoặc có instance mới.
- Toàn bộ 42 architecture instance active đã đạt `entity-instance/v1`, base/type section contract và `npm run verify:architecture-baseline`; core graph Flow/Module/ModuleBoundary/StateOwner/DataFlow/DeploymentUnit/CrossCuttingRule giữ 127 canonical relation edge đã được validate. `architecture:trace` query canonical YAML với reverse trace derived; mọi link `Related Entities` đã được phân loại và verifier kiểm tra.
- `docs/app/10-decisions/` đã có decision unit `DEC-001` và `DEC-002`; finding cũ về việc chưa có decision unit không còn hiệu lực.

## Open Questions

Không còn open question active.

## Direction Đã Chốt

### Architecture

- `InteractionFlow --involves--> Module` là fact canonical cho flow participant; reverse trace được derive, không ghi `Module --participates_in--> InteractionFlow`.
- `ModuleBoundary --constrains--> Module` là fact canonical cho boundary constraint; không ghi `Module --governed_by--> ModuleBoundary` cho cùng fact.

### Business / Domain (Q1)

- `Scenario --composes--> Process` — không ghi `Process --part_of--> Scenario`.
- `Aggregate --contains--> DomainEntity` — không ghi `DomainEntity --member_of--> Aggregate`.
- `DomainEntity --uses--> ValueObject` — không ghi `ValueObject --used_by--> DomainEntity`.
- `Goal --addresses--> Problem` — không ghi `Problem --motivates--> Goal` cho cùng linkage.
- `Goal --measured_by--> SuccessCriterion` — không ghi `SuccessCriterion --validates--> Goal` cho cùng success-bar fact.
- `Metric --measures--> Goal` và `Metric --input_to--> SuccessCriterion` là fact độc lập, không phải inverse của `measured_by`.

## Đã Đóng Hoặc Không Phải Finding Active

- Q1 relation mirror: đã chốt canonical direction ở trên; meta triple/slot/relation type và DDD pack đã cập nhật theo một fact một chiều ghi.
- Q3 taxonomy `07-implementation`: guide không giữ taxonomy/entity type cho layer này. Concern folder chỉ ở `folder-structure.md`; candidate type (nếu có) thuộc decision local; implementation truth thuộc `docs/app/07-implementation/`.
- Q2 requirement model: tạm thời chỉ dùng `allowed_when_known` và `required_at_creation`. Không mở rộng lifecycle/release gate (`required_before_active`, `required_before_release`, …) cho đến khi có nhu cầu thật sự.
- `implements` chỉ áp dụng cho product/UI realization theo concrete-to-abstract direction.
- Ownership `04-domain` và `05-architecture` đã chốt: guide pack là reusable source, meta là contract active local, app là app truth; app không khai báo methodology runtime.
- `P0-05` đã xác nhận template không còn application instance/relation cần migrate.
- Root `Luồng vận hành chuẩn` đã tồn tại, route agent đã là Markdown link được kiểm tra; guide không còn finding active riêng.
- Legacy entity type contract là debt có control: Type Contract Gate chặn type legacy khi type bị sửa hoặc khi tạo instance mới, nhưng không ép rewrite 35 type chưa dùng.
- Workbench chưa active vì project chưa có local activation policy. Đây là trạng thái hiện hành, không phải một workflow thiếu trong guide.
- Architecture graph đã có query CLI đọc canonical YAML, reverse trace derived và 127 edge đã validate. Mọi link trong `Related Entities` đã được phân loại thành canonical relation có direct edge hoặc context/evidence; không còn link nào làm relation ngầm.

## Quy Tắc Dùng Review

- Review ghi gap, risk và câu hỏi; không tự tạo schema, relation, entity type hoặc decision mới.
- Khi xử lý một finding, cập nhật source of truth trước, rồi bỏ finding đã đóng khỏi file này.
- Khi cần thay đổi cross-project reusable source, kiểm tra boundary guide/meta/app trước khi tạo scope triển khai.
