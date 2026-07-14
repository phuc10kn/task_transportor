# Coordination — Project Translation Glossary

## Quy ước điều phối

### Handoff hiện tại

Current phase: `TGL-03 - Docs, verification and handoff (automated complete)`  
Done: TGL-00 đến TGL-03 automated acceptance pass; docs/app đã đồng bộ, `SO-007` thuộc `MOD-003`, baseline 43 instances/128 edges, `npm test` pass  
Next: người review thực hiện manual acceptance Translation Glossary, Project Config và Translation Queue; sau xác nhận mới đóng plan  
Prompt tiếp theo: `executor.md`

### Trạng thái blocked

None

### Accepted gaps

- Không có glossary global/shared.
- Không có import/export hoặc bulk edit.
- Không có version history/restore riêng.
- Không có enable/disable concept hoặc chọn group theo job.
- Không tự động retranslate khi glossary đổi.
- Không có split-pane/data grid, fuzzy matching hoặc AI tự học term.

Compatibility với `translation_glossary_json`, UI cũ, fallback và dual source không phải accepted gap; chúng bị loại bỏ có chủ ý.

### Quy tắc resume

1. Đọc file này, root README, overview, phase table trong root và current phase file.
2. Chỉ thực hiện current phase; phase sau chỉ mở khi phase trước có automated evidence pass.
3. Executor chỉ tick checklist và ghi `Kết quả thực hiện` của current phase.
4. Coordinator overwrite snapshot handoff khi chuyển phase; executor chỉ cập nhật handoff khi bị ngắt hoặc blocked.
5. Blocked state chỉ dùng `None`, `Blocked: <phase id> - <blocker>` hoặc `Resolved: <phase id> - <lý do>`.
6. `Manual check (Người review)` để trống đến khi user xác nhận.
7. Thay đổi schema, ownership, cutover contract hoặc dependency phải quay lại `planner.md`.

## Risk triggers

| Trigger | Hành động bắt buộc |
| --- | --- |
| JSON malformed, thiếu language hoặc same-language có hai term khác nhau | Block TGL-00; báo data debt, không silent skip/fallback. |
| SQLite không hỗ trợ direct `DROP COLUMN` an toàn | TGL-00 khóa table-rebuild trước khi mở TGL-01. |
| Có caller ngoài repo vẫn gửi Project JSON legacy | Ghi consumer/evidence và phối hợp contract cutover; không silently accept. |
| TGL-01 mới hoàn tất migration/API/runtime một phần hoặc chưa chạy `npm test` | Không release và không mở TGL-02; tiếp tục cùng phase hoặc ghi `In-progress`. |
| CRUD cần deep import xuyên module | Block và expose public surface tối thiểu qua owner API. |
| Runtime đổi prompt shape hoặc giới hạn 40 ngoài contract | Thu nhỏ diff về source-term preprocessing; không đưa toàn bộ glossary vào context. |
| API projection lộ Project credential | Block release và sửa trong TGL-01. |
| UI đưa glossary trở lại Project Config | Scope violation; loại bỏ trong TGL-02. |
| SO-007 được nối `shared_via DF-002` | Relation sai; chỉ giữ `MOD-003 --owns--> SO-007`. |
| Tạo SO-007 nhưng architecture summary/state index/clean baseline/verifier chưa cùng lên 43 instances/128 edges | Block TGL-03; cập nhật đủ baseline artifacts trước khi chạy architecture gates. |

## Automated acceptance tổng

1. Migration fresh/upgrade/atomic-failure/cascade/unique pass và JSON column biến mất.
2. Project CRUD, glossary API và runtime cutover pass trong cùng TGL-01; `npm test` pass trước khi mở TGL-02.
3. `verify:translation-glossary` được gọi bởi `verify:phase04`, nên `npm test` bao phủ regression mới.
4. Admin UI navigation/load timing/CRUD/error/responsive acceptance pass.
5. SO-007 và MOD-003 relation pass entity/relations/references gates; architecture baseline chốt 43 instances/128 edges và trace từ MOD-003 trả ownership edge.
6. `npm test` pass sau toàn bộ phase.

## Manual acceptance

Người review thực hiện sau TGL-03:

1. Mở Translation Glossary, xác nhận không preload trước khi vào màn.
2. Chọn Project; tạo/edit/search/delete concept `default` với `ja`, `vi`, `en`.
3. Xác nhận Project Config không còn glossary và Translation Queue vẫn hoạt động.
4. Tạo/retranslate draft và xác nhận context dùng đúng cặp term.
5. Kiểm tra loading, empty, validation/conflict, error/retry và viewport hẹp.

Manual checklist không được tick bởi agent nếu user chưa xác nhận.

## Điều kiện release

- Không còn blocked state.
- Mọi automated acceptance có evidence thực tế.
- Mỗi phase có kết quả canonical và checklist đúng.
- User xác nhận manual acceptance; trước xác nhận plan chưa được đánh dấu complete.
