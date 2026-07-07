# Phase 07 - Xóa docs_legacy

## Mục tiêu

Phase này xóa `docs_legacy/` sau khi docs mới đã tự đứng được.

Đây là phase cuối, nên phải chạy như cleanup có kiểm soát. Không dùng phase này để migrate nốt nội dung lớn. Nếu còn nội dung lớn, quay lại phase tương ứng.

## Inputs bắt buộc

- Kết quả phase 00-06
- Migration matrix cuối cùng
- Reference report từ phase 06
- `docs/plans/migrate_new_docs/final_migration_report.md`
- `AGENTS.md`
- `docs/README.md`
- xác nhận review của người phụ trách docs trước hoặc ngay sau cutover

## Điều kiện trước khi xóa

- Không còn dòng matrix có cột `status` bằng `migrate`.
- Không còn dòng matrix có cột `status` bằng `merge`.
- Không còn dòng matrix có cột `status` bằng `defer`.
- Không còn dòng matrix có cột `status` bằng `keep-temporary`.
- `AGENTS.md` không còn yêu cầu đọc `docs_legacy`.
- `docs/README.md` không còn dùng `docs_legacy` như reading path thường ngày.
- `final_migration_report.md` đã được cập nhật bằng kết quả thật.
- `docs/` không còn reference `docs_legacy` ngoài migration plan/final migration report.
- Người review xác nhận không cần khôi phục legacy tree vào repo sau cutover.

## Việc cần làm

1. Chạy lại verification của phase 06.
2. Kiểm tra migration matrix cuối.
3. Cập nhật `AGENTS.md` sang source docs chính là `docs/`.
4. Cập nhật `docs/README.md` để bỏ historical reading path nếu không còn cần.
5. Cập nhật final migration report bắt buộc.
6. Xóa `docs_legacy/`.
7. Chạy search sau xóa.
8. Review git diff để đảm bảo chỉ xóa legacy và cập nhật reference liên quan.

## Verification commands

```powershell
Test-Path docs_legacy
rg -n "docs_legacy|docs_native_theory_app|docs/work|docs/architecture" . -g "!docs/plans/migrate_new_docs/**"
rg -n "docs/plan/import_theories|docs/meta/relation-types|docs/meta/rules" docs AGENTS.md -g "!docs/plans/migrate_new_docs/**"
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]+\|[^|]+\|[^|]+\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
Select-String -Path docs/plans/migrate_new_docs/final_migration_report.md,docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|.*__UNRESOLVED__.*\|'
```

Sau khi xóa, `Test-Path docs_legacy` phải là `False`.

Các lệnh kiểm tra cột `status` và dòng bảng chứa `__UNRESOLVED__` phải không có output.

## Deliverables

- `docs_legacy/` bị xóa.
- `docs/` là source of truth duy nhất.
- `AGENTS.md` và root docs không còn nhắc legacy như dependency.
- Final migration report ghi rõ nhóm legacy nào đã migrate, merge, discard, superseded và evidence.
- Không còn path chết do rename hoặc xóa legacy.

## Câu hỏi review

- Có cần giữ archive ngoài repo không?
- Final migration report có đủ để hiểu vì sao xóa legacy không?
- `AGENTS.md` đã đủ cho agent code/review sau khi legacy biến mất chưa?
- Có external script/tool nào đang hard-code `docs_legacy` không?

## Chốt chặn

Phase đạt khi:

- repo không còn cần `docs_legacy/` để implement, review, hoặc vận hành docs;
- người mới vào repo có thể đọc từ `docs/README.md` và `AGENTS.md`;
- không mất product direction, architecture rule, workflow, acceptance, operation note còn sống;
- search không còn reference legacy không chủ đích.

## Không coi là xong nếu

- xóa legacy trước khi `AGENTS.md` đổi xong;
- vẫn còn reference `docs_legacy` trong docs mới;
- chưa có final migration report hoàn chỉnh;
- người review chưa xác nhận legacy tree không còn cần giữ hoặc không cần khôi phục sau cutover.

## Checklist nghiệm thu

- [x] Migration matrix không còn dòng có cột `status` bằng `migrate`.
- [x] Migration matrix không còn dòng có cột `status` bằng `merge`.
- [x] Migration matrix không còn dòng có cột `status` bằng `defer`.
- [x] Migration matrix không còn dòng có cột `status` bằng `keep-temporary`.
- [x] `migration_matrix.md` và `final_migration_report.md` không còn dòng bảng chứa `__UNRESOLVED__`.
- [x] `AGENTS.md` đã dùng `docs/` làm source docs chính.
- [x] `docs/README.md` không còn hướng người đọc mở `docs_legacy`.
- [x] Final migration report đã được cập nhật đầy đủ bằng kết quả thật.
- [x] Người review đã xác nhận sau cutover rằng không cần khôi phục `docs_legacy/`.
- [x] `docs_legacy/` đã bị xóa trong phase này.
- [x] Đã chạy verification sau xóa và không còn reference legacy không chủ đích.

## Rollback rule

Nếu sau khi xóa phát hiện mất source of truth:

- không khôi phục toàn bộ legacy tree mặc định;
- khôi phục đúng file hoặc cụm file cần thiết từ git;
- migrate nội dung thiếu vào đúng home trong `docs/`;
- ghi decision hoặc migration note để tránh lặp lại lỗi.
