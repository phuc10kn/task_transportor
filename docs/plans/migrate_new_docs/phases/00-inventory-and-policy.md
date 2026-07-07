# Phase 00 - Kiểm kê và chính sách migration

## Mục tiêu

Phase này tạo bản đồ đầy đủ cho `docs_legacy/` trước khi di chuyển nội dung.

Mục tiêu không phải là đếm file cho đủ, mà là biết mỗi cụm tri thức trong legacy sẽ có số phận nào:

- nội dung nào còn là source of truth;
- nội dung nào đã bị docs mới thay thế;
- nội dung nào chỉ còn giá trị lịch sử;
- nội dung nào cần người review quyết định;
- nội dung nào tuyệt đối không nên copy nguyên vào `docs/`.

Phase này là lớp kiểm soát để các phase sau không biến `docs/` thành bản sao lộn xộn của `docs_legacy/`.

## Phạm vi legacy cần kiểm kê

| Legacy area | Câu hỏi cần trả lời |
| --- | --- |
| `docs_legacy/work/` | Còn giữ product direction, Lite scope, implementation plan hay acceptance nào chưa migrate không? |
| `docs_legacy/architecture/` | Rule boundary, module structure, workflow architecture nào còn là truth hiện tại? |
| `docs_legacy/business/` | Workflow, business rule, state, glossary nào còn dùng được? |
| `docs_legacy/explain/` | Phần nào là synthesis có giá trị, phần nào chỉ là scratch analysis? |
| `docs_legacy/plan/import_theories/` | Nội dung nào đã được hấp thụ vào `docs/theories`, nội dung nào cần lưu như provenance? |
| `docs_legacy/explain_b2j/` | Có liên quan migration khỏi `backlog2jira` không, hay bỏ mặc định? |
| `docs_legacy/server/` | Có runtime/server note nào còn dùng trong hệ hiện tại không? |

## Inputs bắt buộc

- `docs_legacy/`
- `docs/README.md`
- `docs/app/README.md`
- `docs/theories/README.md`
- `docs/theories/governance.md`
- `docs/meta/README.md`
- `docs/plans/migrate_new_docs/coordination.md`
- `docs/plans/migrate_new_docs/migration_matrix.md`
- `AGENTS.md`

## Ma trận phân loại

Mỗi file hoặc cụm file phải được gắn một trạng thái:

| Status | Khi dùng | Ví dụ hành động |
| --- | --- | --- |
| `migrate` | Nội dung còn sống và chưa có home trong `docs/` | Tách thành entity/decision/theory note mới |
| `merge` | Docs mới đã có một phần nhưng legacy còn chi tiết đúng | Bổ sung phần thiếu vào file đích |
| `superseded` | Docs mới đã thay thế hoàn toàn | Không migrate, ghi lý do |
| `discard` | Scratch, lỗi thời, không còn liên quan | Bỏ khỏi migration |
| `defer` | Cần người review quyết định | Tạo open item |
| `keep-temporary` | Cần giữ tạm cho phase sau | Gắn phase deadline |

## Việc cần làm

1. Liệt kê toàn bộ file trong `docs_legacy/`.
2. Tạo hoặc cập nhật dòng trong `migration_matrix.md` cho từng file.
3. Gom thành cụm theo vai trò tri thức, không chỉ theo folder.
4. Gắn status ban đầu cho từng cụm hoặc từng `knowledge_slice`.
5. Gắn destination dự kiến trong `docs/`.
6. Ghi các conflict đã thấy giữa docs mới và legacy.
7. Ghi các file không được copy nguyên vì trộn nhiều layer.
8. Xác định cụm nào cần đọc sâu ở phase sau.
9. Chốt rule: không tạo lại `docs/work` hoặc `docs/architecture` trong docs mới nếu chưa có decision riêng.
10. Ghi rõ phase owner cho mọi cụm trong matrix.

## Destination mặc định

| Nội dung legacy | Home dự kiến |
| --- | --- |
| Product scope, MVP, Lite direction | `docs/app/00-context`, `docs/app/02-product` |
| Business workflow, operator role | `docs/app/01-business` |
| Domain language, state meaning | `docs/app/04-domain` |
| Module, boundary, flow, ownership | `docs/app/05-architecture` |
| API/config/persistence mechanism | `docs/app/06-technical` |
| Test, acceptance, quality gate | `docs/app/08-quality` |
| Deployment, recovery, runtime operation | `docs/app/09-operation` |
| Why/trade-off/final decision | `docs/app/10-decisions` |
| Reusable principle | `docs/theories` |
| Documentation rule/convention | `docs/meta` |

## Deliverables

- `migration_matrix.md` có dòng cho mọi file trong `docs_legacy/`.
- Migration matrix cấp cụm có `phase_owner`, `status`, `destination/reason/review_question` phù hợp.
- Danh sách file legacy cần đọc sâu theo phase.
- Danh sách file có thể discard sớm.
- Danh sách file cần người review quyết định.
- Danh sách destination tạm thời cho từng cụm.
- Danh sách conflict hoặc ambiguity ban đầu.

## Câu hỏi review

- Có cụm legacy nào vẫn là source of truth nhưng chưa có destination rõ không?
- Có file nào đang bị nhầm là product truth nhưng thực ra chỉ là implementation checklist cũ không?
- Có file nào chứa decision quan trọng bị giấu trong prose không?
- Có phần nào của `docs_legacy/explain_b2j` thật sự cần giữ cho migration hiện tại không?
- Có cần giữ local archive riêng sau khi `docs_legacy/` bị xóa khỏi repo không?

## Chốt chặn

Phase đạt khi:

- mọi top-level folder trong `docs_legacy/` có status ban đầu;
- mọi file trong `docs_legacy/` có ít nhất một dòng trong `migration_matrix.md`;
- mọi cụm `migrate` hoặc `merge` có destination dự kiến;
- mọi cụm `defer` có câu hỏi review cụ thể;
- mọi cụm `discard` có lý do ngắn;
- phase owner biết phase sau cần đọc file nào.

## Không coi là xong nếu

- chỉ có danh sách file mà chưa có status;
- vẫn định copy nguyên `docs_legacy/work` hoặc `docs_legacy/architecture` vào `docs/`;
- chưa phân biệt source of truth với historical note;
- chưa biết cụm nào ảnh hưởng tới `AGENTS.md`.

## Kết quả phase 00

Đã kiểm kê `docs_legacy/` bằng `rg --files docs_legacy` và cập nhật [migration_matrix.md](../migration_matrix.md) thành inventory đầy đủ cấp file.

Tổng quan phân loại ban đầu:

| Nhóm | Số lượng | Ý nghĩa |
| --- | ---: | --- |
| Tổng file legacy | 185 | Toàn bộ file trả về từ `rg --files docs_legacy`. |
| Có dòng trong matrix | 185 | Không còn file legacy bị bỏ sót ở Phase 00. |
| Knowledge-slice trong matrix | 202 | Một số file đa lớp đã được tách nhiều dòng theo owner phase. |
| `merge` | 184 | Nội dung có khả năng còn sống, cần phase owner đọc sâu và nhập phần đúng vào home mới. |
| `keep-temporary` | 2 | Medium/Full plan giữ tạm để Phase 01 quyết định giữ future scope hay discard. |
| `discard` | 16 | Toàn bộ `docs_legacy/explain_b2j/*`, vì thuộc legacy `backlog2jira` và bị loại khỏi source-of-truth thường ngày theo `AGENTS.md`. |

Phân bổ phase owner:

| Phase owner | Số file | Nhóm tri thức chính |
| --- | ---: | --- |
| 00 | 16 | `explain_b2j`, discard theo policy hiện tại. |
| 01 | 25 | Product truth, Lite scope, reading order, Medium/Full future scope. |
| 02 | 19 | Architecture truth, boundary, module structure, workflow architecture. |
| 03 | 63 | Business workflow, use case, domain entity, state, rule, glossary. |
| 04 | 47 | Technical/API/runtime/config/operation/quality/implementation plan. |
| 05 | 32 | Theory, governance, decision, provenance, synthesis. |

Các cụm cần đọc sâu ở phase sau đã được ghi trực tiếp trong `migration_matrix.md` bằng `phase_owner`, `destination`, `review_question` và `deadline_phase`.

Kết quả verification:

```text
LegacyCount = 185
UniqueMatrixPathCount = 185
MatrixSliceCount = 202
MissingCount = 0
ExtraCount = 0
Wildcard path count = 0
Unresolved marker count = 0
Open status count = 186
```

`Open status count = 186` là trạng thái đúng ở Phase 00 vì phase này mới inventory và route ownership, chưa migrate sâu. Các dòng mở còn lại do Phase 01-06 xử lý.

## Checklist nghiệm thu

- [x] Đã liệt kê toàn bộ file trong `docs_legacy/`.
- [x] Mọi file trong `docs_legacy/` đã có dòng trong `migration_matrix.md`.
- [x] Đã gom file theo cụm tri thức, không chỉ theo folder vật lý.
- [x] Mỗi cụm legacy đã có status ban đầu.
- [x] Mỗi cụm `migrate` hoặc `merge` đã có destination dự kiến trong `docs/`.
- [x] Không còn cụm `defer`; các câu hỏi đọc sâu đã được ghi ở `review_question` cho `merge` và `keep-temporary`.
- [x] Mỗi cụm `discard` hoặc `superseded` đã có lý do ngắn.
- [x] Đã xác định cụm nào ảnh hưởng tới `AGENTS.md`.
- [x] Đã ghi danh sách file cần đọc sâu ở các phase sau.
- [x] Đã chạy lệnh verification của phase và ghi lại kết quả.
- [x] Người review đã xác nhận phase 00 đạt chốt chặn.

## Verification

```powershell
rg --files docs_legacy
rg -n "docs_legacy" docs AGENTS.md
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]+\|[^|]+\|[^|]+\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
$legacy = rg --files docs_legacy | ForEach-Object { $_ -replace '\\','/' }
$matrixPaths = Get-Content docs/plans/migrate_new_docs/migration_matrix.md |
  Where-Object { $_ -match '^\|' -and $_ -notmatch '^\|\s*(-|legacy_path)' } |
  ForEach-Object {
    $cols = $_ -split '\|'
    $cols[1].Trim().Trim('`')
  } |
  Where-Object { $_ -like 'docs_legacy/*' }
$missing = $legacy | Where-Object { $_ -notin $matrixPaths }
$missing
if ($missing) { throw "Missing legacy files in migration_matrix.md" }
```

Kết quả `docs_legacy` trong `docs/` chưa cần rỗng ở phase này, nhưng mỗi match phải có lý do tồn tại.
