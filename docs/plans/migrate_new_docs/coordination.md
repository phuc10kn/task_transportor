# Điều phối migrate new docs

## Vai trò file này

File này điều phối migration từ `docs_legacy/` sang `docs/`.

Nó không chứa nội dung app truth. Nó chỉ định nghĩa:

- thứ tự chạy phase;
- cách quyết định số phận của từng legacy file;
- checkpoint trước khi đi tiếp;
- rule khi phát hiện nội dung chưa có home trong docs mới;
- điều kiện được phép xóa `docs_legacy/`.

## Migration matrix

Mỗi file hoặc cụm file trong `docs_legacy/` phải được phân loại bằng một trong các trạng thái sau:

Matrix bắt buộc nằm tại [migration_matrix.md](migration_matrix.md). Không ghi matrix rải rác trong ghi chú phase.

Schema tối thiểu:

| Cột | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `legacy_path` | Có | File hoặc cụm file legacy đang xử lý. |
| `knowledge_slice` | Có | Phần tri thức cụ thể nếu một file chứa nhiều lớp nội dung. |
| `phase_owner` | Có | Phase chịu trách nhiệm chốt dòng này. |
| `status` | Có | Một trong các status hợp lệ. |
| `destination` | Có nếu `migrate`, `merge`, `migrated`, `merged` | Home mới trong `docs/`. |
| `reason` | Có nếu `discard`, `superseded` | Vì sao không migrate. |
| `review_question` | Có nếu `defer` | Câu hỏi cần người review chốt. |
| `deadline_phase` | Có nếu `defer`, `keep-temporary` | Phase cuối cùng được phép giữ trạng thái mở. |
| `evidence` | Có khi hoàn tất | Link/file/lệnh chứng minh quyết định. |

| Status | Ý nghĩa | Hành động |
| --- | --- | --- |
| `migrate` | Nội dung còn là source of truth và chưa có trong `docs/` | Tách hoặc nhập vào đúng home |
| `merge` | Nội dung đã có một phần trong `docs/`, nhưng legacy còn chi tiết hữu ích | Merge phần thiếu, không copy nguyên file |
| `superseded` | Nội dung đã được thay thế bởi docs mới | Ghi lý do, không migrate |
| `discard` | Nội dung cũ, scratch, hoặc không còn liên quan | Không migrate |
| `defer` | Cần quyết định của người review | Tạo open item và không xóa legacy file đó |
| `keep-temporary` | Cần giữ tạm để đối chiếu trong phase sau | Gắn deadline phase phải xử lý |
| `migrated` | Đã migrate xong vào `docs/` | Ghi destination và evidence |
| `merged` | Đã merge xong phần còn sống vào `docs/` | Ghi destination và evidence |

## Luật chọn nơi đặt nội dung

| Nội dung | Home trong `docs/` |
| --- | --- |
| Product direction, scope, stakeholder value | `app/00-context`, `app/01-business`, `app/02-product` |
| Use case, workflow nghiệp vụ | `app/01-business` hoặc `app/02-product` |
| Domain vocabulary, state meaning, invariant | `app/04-domain` |
| Module, boundary, data flow, interaction flow | `app/05-architecture` |
| API contract, config, persistence, external client mechanics | `app/06-technical` |
| Source layout, coding rule, implementation contract | `app/07-implementation` |
| Acceptance, verification, release readiness | `app/08-quality` |
| Runtime, deploy, monitoring, recovery | `app/09-operation` |
| Why/trade-off/final choice | `app/10-decisions` |
| Reusable principle | `theories/` |
| Documentation schema/rule/convention | `meta/` |
| Reusable custom modular monolith template | `app_technical/custom_modular_monolith` |

## Luật chốt chặn phase

Không được chạy phase sau nếu phase hiện tại còn:

- legacy files trạng thái `defer` mà ảnh hưởng trực tiếp đến phase sau;
- legacy files thuộc phase hiện tại chưa có dòng trong `migration_matrix.md`;
- legacy files thuộc phase hiện tại còn `migrate` hoặc `merge` nhưng chưa có destination;
- legacy files thuộc phase hiện tại có `discard` hoặc `superseded` nhưng chưa có reason;
- reference mới trong `docs/` trỏ đến path không tồn tại;
- nội dung source-of-truth được copy nguyên nhưng chưa route vào đúng layer;
- conflict giữa legacy truth và docs mới chưa có decision hoặc challenge.

## Luật đối chiếu code hiện tại

Khi legacy mô tả module, API, config, database, state machine, workflow runtime hoặc boundary, phase owner phải đối chiếu với code hiện tại trước khi chốt `migrated`, `merged`, `superseded` hoặc `discard`.

Nguồn đối chiếu tối thiểu:

- `src/`
- `package.json`
- config/runtime files nếu có
- database/migration/schema files nếu có
- route/controller/service/module files liên quan

Nếu docs legacy đúng nhưng code khác, tạo decision hoặc open item. Không âm thầm sửa docs theo legacy.

## Cách xử lý conflict

Khi legacy nói khác docs mới:

- nếu docs mới đúng hơn: đánh legacy là `superseded`;
- nếu legacy đúng hơn: cập nhật docs mới và ghi source provenance;
- nếu chưa quyết được: tạo decision hoặc open item trong `app/10-decisions`;
- nếu conflict chạm theory: ghi challenge trong `theories/<theory>/governance.md` hoặc root `theories/governance.md`.

## Checkpoint chung

Sau mỗi phase chạy:

```powershell
rg -n "docs_legacy" docs
rg -n "docs/work|docs/architecture|docs/meta/relation-types|docs/meta/rules" docs
rg -n "TODO|NOTE-OPEN|NOTE-CONFLICT" docs
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]+\|[^|]+\|[^|]+\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
```

Kết quả không bắt buộc rỗng ở mọi phase, nhưng mọi match phải có lý do rõ.

## Điều kiện xóa `docs_legacy/`

Chỉ xóa khi:

- phase 07 pass;
- `AGENTS.md` đã trỏ hoàn toàn vào `docs/` cho công việc thường ngày;
- `docs/README.md` không còn gọi `docs_legacy` là reading path;
- không còn `docs_legacy` reference trong `docs/` ngoài final removal record;
- migration matrix không còn dòng có cột `status` bằng `migrate`, `merge`, `defer`, `keep-temporary`;
- [final_migration_report.md](final_migration_report.md) đã được cập nhật bằng kết quả thật;
- người review xác nhận không cần giữ legacy tree làm archive local.
