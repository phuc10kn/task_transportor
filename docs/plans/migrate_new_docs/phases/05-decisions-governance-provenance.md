# Phase 05 - Quyết định, quản trị và nguồn gốc

## Mục tiêu

Phase này chuyển phần "vì sao" từ legacy sang home mới.

Legacy đang giữ nhiều reasoning rải rác:

- quyết định trong `implement-interview.md`;
- phân tích trong `docs_legacy/explain`;
- kế hoạch import theory trong `docs_legacy/plan/import_theories`;
- decision ngầm trong work/architecture/business docs.

Nếu không migrate phần này, `docs/` có thể có cấu trúc đúng nhưng thiếu lý do.

## Inputs bắt buộc

- `docs_legacy/work/implement-interview.md`
- `docs_legacy/explain/custom_modular_monolith.md`
- `docs_legacy/explain/missing_theories.md`
- `docs_legacy/plan/import_theories/**`
- `docs/plans/migrate_new_docs/migration_matrix.md`
- `docs/plans/migrate_new_docs/final_migration_report.md`
- `docs/app/10-decisions/**`
- `docs/theories/governance.md`
- `docs/theories/*/governance.md`
- `docs/plans/migrate_new_docs/**`

## Phân loại nội dung

| Nội dung legacy | Destination |
| --- | --- |
| Quyết định đã chốt | `app/10-decisions` |
| Trade-off còn ảnh hưởng | `app/10-decisions` |
| Rule tạo/split theory group | `theories/governance.md` |
| Challenge với một theory | `theories/<theory>/governance.md` |
| Lịch sử import theory | `docs/plans/migrate_new_docs` hoặc final migration report |
| Analysis chỉ để suy nghĩ tạm | `discard` hoặc `superseded` |

## Việc cần làm

1. Đọc `implement-interview.md` và tách decision thật khỏi trao đổi tạm.
2. Đọc `custom_modular_monolith.md` và `missing_theories.md` để tìm reasoning còn sống.
3. Đối chiếu `plan/import_theories` với theory governance hiện tại.
4. Chuyển decision sống vào `app/10-decisions`.
5. Chuyển rule governance sống vào `theories/governance.md`.
6. Chuyển challenge vào governance của theory group liên quan.
7. Summarize migration history vào `final_migration_report.md`.
8. Cập nhật matrix cho `docs_legacy/explain/**`, `docs_legacy/plan/import_theories/**` và decision slices phát hiện trong work/architecture/business.
9. Đánh dấu analysis đã bị thay thế là `superseded`.

## Mapping ưu tiên

| Legacy file/cụm | Xử lý ưu tiên |
| --- | --- |
| `implement-interview.md` | Extract decisions và assumptions còn sống |
| `explain/custom_modular_monolith.md` | Merge phần reusable vào theory/app_technical nếu còn thiếu |
| `explain/missing_theories.md` | So với 6 theory core; giữ gap nếu còn |
| `plan/import_theories/00-*` | So với root theory governance |
| `plan/import_theories/01-06-*` | So với từng theory group |
| `plan/import_theories/07-*` | So với app theory routing hiện tại |

## Deliverables

- Decision layer giữ đủ lý do quan trọng.
- Theory governance không cần đọc legacy plan để hiểu boundary.
- Challenge/open question còn sống nằm đúng governance file.
- Legacy explain/plan có status cuối.
- Migration history quan trọng không bị mất.
- Matrix rows for explain/plan/decision slices have owner, status and evidence.

## Câu hỏi review

- Đây là decision hay chỉ là analysis?
- Decision này còn hiệu lực không?
- Reasoning này thuộc theory, app decision hay technical template?
- Có challenge nào cần giữ mở không?
- Có phần nào trong explain cũ đang mâu thuẫn docs mới?
- Có dòng matrix nào vẫn giữ reasoning quan trọng ở legacy mà chưa có destination không?

## Chốt chặn

Phase đạt khi:

- không còn quyết định quan trọng chỉ tồn tại trong legacy explain/interview;
- root theory governance đủ để điều phối theory group mới;
- plan import theories cũ chỉ còn giá trị lịch sử;
- `final_migration_report.md` đã có phần provenance cho theory import/history;
- mọi conflict reasoning có decision hoặc challenge.

## Không coi là xong nếu

- chỉ đổi link từ legacy plan sang plan mới;
- decision bị trộn vào theory như principle;
- challenge chưa quyết được bị bỏ qua;
- explain cũ vẫn là nơi duy nhất giải thích một boundary quan trọng.
- matrix còn `defer`, `migrate` hoặc `merge` cho reasoning mà không có owner/deadline.

## Checklist nghiệm thu

- [x] Đã đọc và phân loại `implement-interview.md`.
- [x] Decision còn sống đã có home trong `docs/app/10-decisions` hoặc open item.
- [x] `custom_modular_monolith.md` đã được đối chiếu với theory/app_technical hiện tại.
- [x] `missing_theories.md` đã được đối chiếu với 6 theory core hiện tại.
- [x] Nội dung quan trọng từ `plan/import_theories` đã được hấp thụ hoặc ghi provenance.
- [x] `final_migration_report.md` đã ghi provenance quan trọng từ explain/import_theories.
- [x] Challenge còn sống đã được ghi vào governance phù hợp.
- [x] Analysis/scratch đã được đánh `superseded` hoặc `discard`.
- [x] Không còn reasoning quan trọng chỉ tồn tại trong legacy explain/plan.
- [x] Matrix rows thuộc explain/plan/decision slices đã được cập nhật bằng status cuối phase.
- [x] Đã chạy lệnh verification của phase và ghi lại kết quả.
- [x] Người review đã xác nhận phase 05 đạt chốt chặn.

## Review-fix result

- `docs_legacy/explain/custom_modular_monolith.md` đã được rà lại với `docs/theories/modular-architecture`, `docs/app_technical/custom_modular_monolith`, `docs/app/10-decisions` và root theory governance.
- `docs_legacy/explain/missing_theories.md` đã được rà lại với 6 theory core hiện tại, root theory index và root governance.
- `docs_legacy/plan/import_theories/**` đã được chuyển thành provenance; source hiện tại là `docs/theories/**`, `docs/theories/governance.md` và `docs/app/10-decisions`.
- `docs_legacy/business/governance/**` đã được chuyển thành meta-governance trong `docs/meta/README.md` và decision note trong `docs/app/10-decisions/README.md`.
- Challenge còn sống nằm trong governance của từng theory group; unresolved challenge không bị discard.
- Matrix owner Phase 05 không còn dòng `migrate`, `merge`, `defer` hoặc `keep-temporary`.

## Reviewer finding đã fix

Người review đã bác kết luận self-check trước đó. Phase 05 review-fix xử lý lại các điểm đó như sau:

- Không chỉ đổi link legacy sang plan mới: matrix phân loại lại từng cụm theo meaning-to-layer và report ghi provenance.
- Decision không bị trộn vào theory như principle: app choice nằm ở `docs/app/10-decisions`; pure reasoning nằm trong `docs/theories`.
- Challenge chưa quyết không bị bỏ qua: các challenge mở vẫn ở governance của từng theory group.
- Explain cũ không còn là nơi duy nhất giải thích boundary quan trọng: boundary hiện nằm trong root governance, theory governance, app architecture và app_technical template.
- Matrix không còn `defer`, `migrate`, `merge` hoặc `keep-temporary` cho owner Phase 05.

## Verification

```powershell
rg -n "docs_legacy/explain|docs_legacy/plan/import_theories|implement-interview" docs -g "!docs/plans/migrate_new_docs/**" -g "!docs/theories/governance.md" -g "!docs/app/10-decisions/README.md" -g "!docs/README.md"
rg -n "Challenge|Decision|accepted|open" docs/theories docs/app/10-decisions
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]*\|[^|]+\|\s*05\s*\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
```
