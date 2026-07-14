# Coordination — Translation Glossary Term Variants

## Quy ước điều phối

### Handoff hiện tại

Current phase: `TGV-02 - Admin UI, docs và handoff`  
Done: TGV-00, TGV-01 và TGV-02 automated gates pass; migration 016, aggregate API, runtime variants/canonical, adapter instructions, Admin UI và docs đã triển khai  
Next: manual acceptance bởi người review; không tự tick manual checklist  
Prompt tiếp theo: `executor.md`

### Trạng thái blocked

None

### Accepted gaps

- Không có `target_translate_languages` trên concept.
- Không có fuzzy matching, morphology, regex custom hoặc AI synonym matching.
- Không có glossary global/shared, import/export, bulk edit, version history hoặc auto-retranslate.
- Không có multi-direction Project configuration trong plan này.

### Quy tắc resume

1. Đọc file này, root README, overview, phase table và current phase file.
2. Automated gate là toàn bộ checklist automated của phase trước, gồm `Unit test check (Agent)`; không bao gồm `Manual check (Người review)`.
3. Chỉ executor được tick checklist hoặc ghi `Kết quả thực hiện` sau evidence thật.
4. Coordinator overwrite handoff snapshot khi phase đổi; manual check luôn để trống đến khi user xác nhận.
5. Schema/API/runtime contract đổi phải quay về `planner.md`.
6. Không mở TGV-01 nếu preflight target chưa pass automated gate; `Manual check (Người review)` của TGV-00 được giữ trống và không chặn TGV-01.
7. Không mở TGV-02 nếu TGV-01 chưa pass automated gate gồm `npm test`; `Manual check (Người review)` của TGV-01 được giữ trống và không chặn TGV-02.

## Risk triggers

| Trigger | Hành động bắt buộc |
| --- | --- |
| Database target không được chỉ định bằng absolute path, không mở read-only hoặc migration 016 đã có trong ledger | Block TGV-00; không chạy migration 016. |
| Target SQLite không hỗ trợ generated column hoặc standard connection không đăng ký primitive deterministic generic | Block TGV-00; sửa contract/migration strategy qua planner. |
| Preflight thấy normalized cross-concept collision, baseline không phải một term/language hoặc FK/count không sạch | Block TGV-00; không chạy migration 016. |
| Migration verifier không chứng minh upgrade 015 -> 016 preserve hoặc collision failure rollback | Block TGV-01; sửa verifier trước. |
| Trigger term insert/update không chặn normalized collision, concept project vẫn đổi được hoặc API map nhầm conflict | Block TGV-01; sửa schema/API verifier trước. |
| Runtime không chọn span không chồng lấn, không dedupe/sort trước cap 40 hoặc đưa target variant vào context | Block TGV-01; sửa repository/preprocessing. |
| Chat prompt, process stdin hoặc bundled `codex_exec` prompt không có hard instruction canonical | Block TGV-01; sửa request/prompt verifier trước. |
| UI cần target language field trên concept | Quay lại planner; direction ownership thay đổi scope. |
| Matching cần fuzzy/regex/tokenizer | Deferred; không lén mở rộng exact substring scope. |

## Automated acceptance tổng

1. TGV-00 preflight read-only pass trên database target được chỉ định và evidence không có blocker.
2. TGV-01 migration/API/runtime/review verifiers cover canonical/variant, normalized conflict, upgrade rollback, span selection, deterministic cap và hard prompt cho chat/process; `verify:phase04` và `npm test` pass.
3. TGV-02 Admin UI acceptance, `verify:docs`, `verify:docs-contract`, toàn bộ architecture gates được liệt kê trong TGV-02 và `npm test` pass.

## Manual acceptance

Người review:

1. Tạo concept với nhiều ja variants và một vi canonical.
2. Promote một ja variant thành canonical, lưu rồi mở lại để xác nhận canonical cũ thành variant.
3. Dịch source chứa từng ja variant và text overlap; xác nhận context luôn dùng đúng vi canonical và span dài nhất.
4. Thử bỏ canonical, tạo hai canonical, nhập normalized duplicate và xác nhận UI/API báo lỗi rõ.
5. Kiểm tra edit/delete variant, Project Config và Translation Queue.

## Điều kiện release

- Không còn blocked state.
- TGV-00 đến TGV-02 có automated evidence thực tế.
- `npm test` pass.
- User xác nhận manual acceptance.
