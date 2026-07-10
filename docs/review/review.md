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
- Outbound Jira safety slice đã materialize 12 instance theo `entity-instance/v1` và 11 canonical relation edge; phần còn lại của app graph vẫn đang ở prose/link.
- `docs/app/10-decisions/` đã có decision unit `DEC-001`; finding cũ về việc chưa có decision unit không còn hiệu lực.

## Findings Còn Hiệu Lực

### R1 - App Graph Mới Materialize Một Safety Slice

Severity: High.

`docs/meta/` đã quy định relation instance canonical qua `relations:` và relation chỉ hợp lệ khi có slot, relation type và valid triple. Outbound Jira safety slice hiện đã dùng contract này cho AF-006, AF-007, MB-006, bốn module và bốn state owner liên quan.

Slice chứng minh được trace từ Jira dry-run/sync tới module participant, boundary và state owner. Ngoài phạm vi đó, graph app vẫn chủ yếu ở prose/link; tooling chưa thể query/trace toàn bộ architecture chỉ từ canonical YAML.

Hướng tiếp theo cần chốt theo nhu cầu trace mới. Không tự động chuyển toàn bộ prose sang relation, không tạo dual/inverse edge, và không thêm Boundary-to-Flow relation nếu chưa có slot, direction và valid triple.

## Open Questions

### Q1 - Relation Mirror Và Canonical Direction

Các cặp dưới đây cần được xem là fact độc lập hay inverse/mirror trước khi đổi vocabulary hoặc thêm rule:

| Nhóm | Relation đang cần chốt |
| --- | --- |
| Business composition | `Scenario --composes--> Process` / `Process --part_of--> Scenario` |
| Domain composition | `Aggregate --contains--> DomainEntity` / `DomainEntity --member_of--> Aggregate` |
| Architecture flow | `Module --participates_in--> InteractionFlow` / `InteractionFlow --involves--> Module` |
| Architecture governance | `Module --governed_by--> ModuleBoundary` |
| Domain usage | `ValueObject --used_by--> DomainEntity` và direction `uses` tương ứng |
| Business direction | `Problem --motivates--> Goal` / `Goal --addresses--> Problem` |
| Business measurement | `Goal --measured_by--> SuccessCriterion` / `SuccessCriterion --validates--> Goal` |

Không đổi relation chỉ vì tên nghe đối xứng. Mỗi quyết định phải chốt fact gốc, query intent, canonical direction và valid triple cần thiết.

### Q2 - Requirement Model Có Cần Mở Rộng Không

Contract hiện chỉ có `allowed_when_known` và `required_at_creation`. Đây là model active và đủ cho relation đã biết hoặc identity prerequisite khi tạo entity.

Cần quyết định riêng nếu project thật sự cần lifecycle/release gate như `required_before_active`, `required_before_release` hoặc nhóm relation bắt buộc. Không tự thêm mode mới từ review này.

### Q3 - Taxonomy `07-implementation`

Guide chưa có stable methodology-specific type pack hoặc interaction graph cho `07-implementation`. Local proposal của project nằm trong decision local; guide chỉ nhận source mới khi vocabulary và graph đã có reusable meaning được review độc lập.

Đây là boundary có chủ ý, không phải lý do để đưa candidate, migration hoặc lifecycle local trở lại guide.

## Đã Đóng Hoặc Không Phải Finding Active

- `implements` chỉ áp dụng cho product/UI realization theo concrete-to-abstract direction.
- Ownership `04-domain` và `05-architecture` đã chốt: guide pack là reusable source, meta là contract active local, app là app truth; app không khai báo methodology runtime.
- `P0-05` đã xác nhận template không còn application instance/relation cần migrate.
- Root `Luồng vận hành chuẩn` đã tồn tại, route agent đã là Markdown link được kiểm tra; guide không còn finding active riêng.
- Legacy entity type contract là debt có control: Type Contract Gate chặn type legacy khi type bị sửa hoặc khi tạo instance mới, nhưng không ép rewrite 35 type chưa dùng.
- Workbench chưa active vì project chưa có local activation policy. Đây là trạng thái hiện hành, không phải một workflow thiếu trong guide.

## Quy Tắc Dùng Review

- Review ghi gap, risk và câu hỏi; không tự tạo schema, relation, entity type hoặc decision mới.
- Khi xử lý một finding, cập nhật source of truth trước, rồi bỏ finding đã đóng khỏi file này.
- Khi cần thay đổi cross-project reusable source, kiểm tra boundary guide/meta/app trước khi tạo scope triển khai.
