# Lite - Translation review

## Trạng thái triển khai hiện tại

- Translation là option sau ingest, nhưng trong Issue Editor admin có thể bấm `Translate` để dịch ngay target đang mở. Request này gọi provider trực tiếp trong API hiện tại, không enqueue `sync_jobs`; kết quả vẫn lưu vào `translation_queue`.
- Worker `translate` vẫn tồn tại cho queue flow chung và dùng cùng provider contract.
- Issue-level translation chỉ áp dụng cho hai `target_field`: `summary` và `description`.
- Source text của issue translation lấy từ Backlog branch hiện tại: `fields_json.<target_field>.backlog`. Không fallback sang CIS, revision, hoặc queue cũ.
- Nếu source Backlog hiện tại rỗng, item không được translate và UI phải hiển thị source rỗng.
- Khi có nhiều queue item cùng target, Issue Editor dùng item mới nhất còn khớp source Backlog hiện tại. Item stale không được dùng để fill `Translated text`.
- Nút review trong Issue Editor là `Approve + save`: vừa lưu reviewed text, vừa apply vào `fields_json.<target_field>.cis`.
- Vì apply vào canonical đi qua cùng rule manual edit, nếu field thay đổi thật và issue đang `approved`/`synced` thì issue có thể chuyển sang `update_pending`.
- Reject translation không apply vào canonical.
- Queue issue-level thiếu `target_field` là legacy invalid data; logic refresh status sẽ loại bỏ/không tính các job đó.

## Provider

Translation là option sau khi dữ liệu đã vào CIS. Nếu bật AI translation, đường chính là chạy qua `codex_exec` thay vì gọi Platform API trực tiếp để tiết kiệm chi phí.

Provider mặc định:

- `codex_exec` là provider chính cho Lite.
- `manual` là fallback nếu AI lỗi hoặc môi trường chưa cấu hình được `codex_exec`.
- `openai_api` chỉ là provider optional/fallback, không phải đường mặc định của Lite.

## `codex_exec`

`codex_exec` là adapter nội bộ để gọi Codex CLI/exec từ worker dịch. Worker truyền prompt dịch, nhận kết quả dạng text/JSON, rồi lưu draft vào `translation_queue`.

Yêu cầu triển khai tối thiểu:

- Chạy được từ worker job, không chặn API request.
- Có timeout và retry theo chính sách job chung.
- Prompt phải yêu cầu giữ nguyên code block, link, key kỹ thuật, issue key và định dạng quan trọng.
- Output phải parse được thành draft dịch và metadata tối thiểu như provider, model/command, confidence nếu có.
- Không ghi prompt/output chứa secret vào log debug.
- Nếu `codex_exec` lỗi, job chuyển sang retry hoặc để admin manual-edit theo trạng thái lỗi rõ ràng.

## Ngôn ngữ và field dịch

Ngôn ngữ:

- Source: Nhật (`ja`).
- Target: Việt (`vi`).

Field dịch trong Lite:

- Issue summary.
- Issue description.
- Backlog comment.

Không dịch nội dung attachment.

## Translation flow

Issue flow:

```text
ingested -> pending_translate -> pending_review -> approved
```

Queue flow:

```text
pending -> ai_draft -> approved
pending -> ai_draft -> edited
pending -> ai_draft -> rejected -> ai_draft
pending -> ai_draft -> rejected -> manual/edited
```

Triển khai Lite hiện tại:

- Phase 03 ingest không tạo `translation_queue` và không enqueue job `translate`.
- Translation queue/job chỉ được tạo bởi option riêng sau ingest và chạy hướng `cis -> cis`. Global queue flow dùng worker `translate`; riêng Issue Editor direct translate gọi provider ngay trong request hiện tại rồi vẫn lưu draft/audit vào `translation_queue`.
- Worker `translate` gọi `collectTranslationContext()` trước khi gọi provider để gom context read-only từ CIS.
- Worker build standardized translation input, trong đó `source_text` vẫn là dữ liệu chính và `context_bundle` chỉ là context hỗ trợ.
- `context_bundle` hiện gồm issue keys, project profile, issue context, neighbor comments, translation memory, glossary riêng theo project, preservation rules và text signals.
- Worker `translate` gọi command từ `CODEX_EXEC_COMMAND` qua stdin JSON chuẩn hóa, có timeout bằng `CODEX_EXEC_TIMEOUT_SECONDS`, rồi lưu `ai_draft`, `provider`, `model_or_command`, `provider_request_id`, `confidence`.
- Với Codex CLI thật, dùng adapter module `src/modules/Translation/infrastructure/codexCliAdapter.js` và cấu hình `CODEX_EXEC_COMMAND=node src/modules/Translation/infrastructure/codexCliAdapter.js`.
- Adapter Codex CLI đọc thêm `CODEX_CLI_COMMAND`, `CODEX_CLI_MODEL`, `CODEX_CLI_PROFILE`, `CODEX_CLI_SANDBOX` và `CODEX_CLI_CD`. Muốn chọn model cho `codex exec` thì cấu hình `CODEX_CLI_MODEL`, không cần nhét model vào `CODEX_EXEC_COMMAND`.
- Adapter gọi `codex exec --sandbox read-only --output-schema ... --output-last-message ...` để chuẩn hóa output về JSON contract.
- Nếu `codex_exec` timeout, exit lỗi, output JSON lỗi hoặc thiếu `translated_text`, job retry/fail theo policy chung và ghi `translation_queue.provider_error`.
- API review hiện có: `GET /api/v1/translation-queue`, `GET /api/v1/translation-queue/:queueId`, `POST /approve`, `POST /reject`, `POST /retranslate`, `POST /manual-edit`.
- `require_translation_review` không được dry-run/sync issue kiểm tra trực tiếp. Tuy nhiên code Lite hiện tại vẫn dùng `issues.sync_status` làm gate: `pending_translate` chưa sync được, còn `pending_review`, `approved`, `ingested`, `update_pending`, `synced` thuộc nhóm được evaluate tiếp.
- Confidence thấp tạo anomaly `translation_low_conf` nhưng không block sau khi người review approve/edit.

## Yêu cầu review

- Human review vẫn bắt buộc cho comment cần dịch trước khi sync comment sang Jira. Với issue canonical sync từ Issue Editor, translation queue/review không còn là gate trực tiếp; bản dịch đã approve/edit được apply vào canonical CIS. Nếu issue vẫn ở `pending_translate`, sync Jira vẫn bị chặn bởi sync-state gate.
- Admin có thể approve draft.
- Admin có thể edit/manual-edit rồi approve.
- Admin có thể reject và retranslate.
- Comment ngắn vẫn cần review; có thể hỗ trợ quick approve nhưng không auto-approve.
- Code block trong comment phải được giữ nguyên, chỉ dịch text xung quanh.
- Nếu source text mixed-language, provider chỉ dịch phần tiếng Nhật cần dịch và giữ nguyên segment đã là tiếng Việt tự nhiên.
- Nếu project có `translation_glossary_json`, provider phải ưu tiên glossary đó hơn suy đoán thuật ngữ chung của model.
- AI confidence thấp tạo warning/anomaly `translation_low_conf`, ưu tiên review queue nhưng không block sau khi human review.
- Khi issue content thay đổi, không tự động ghi đè bản dịch đã duyệt; tạo revision mới và đưa issue về `update_pending`.

## Audit

Các action sau phải ghi `sync_journal` hoặc audit tương đương:

- AI translate.
- Approve translation.
- Reject translation.
- Retranslate.
- Manual edit.
- Context summary của AI translate: `context_policy`, `neighbor_comments_count`, `translation_memory_count`, `glossary_count`, `signals`, `context_bundle_hash`.

Nếu admin sửa bản dịch, cần lưu được old/new text hoặc đủ metadata để sau này Medium/Full học từ review history.
