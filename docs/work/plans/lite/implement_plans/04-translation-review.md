# Phase 04 - Translation review

## Mục tiêu

Dịch Nhật -> Việt bằng provider mặc định `deepseek` như một capability tùy chọn sau khi dữ liệu đã vào CIS. Với Issue Editor hiện tại, bản dịch issue đã human review được apply vào canonical `fields_json.<target_field>.cis`; issue canonical sync Jira không còn bị chặn trực tiếp bởi translation queue/review. Comment sync vẫn cần bản dịch reviewed nếu comment cần dịch.

## Làm trong phase này

- Tạo module `Translation`.
- Tạo provider `deepseek` OpenAI-compatible và giữ provider `codex_exec` để tương thích/fallback.
- Tạo manual-edit review action; không tạo provider `manual`.
- Tạo worker xử lý translation queue.
- Thiết kế prompt giữ nguyên code block, link, issue key, key kỹ thuật.
- Parse output thành draft và metadata.
- Tạo API list/detail translation queue.
- Tạo API approve/reject/retranslate/manual-edit.
- Cập nhật state issue theo queue review.
- Ghi journal/audit cho translate và review action.
- Tạo anomaly `translation_low_conf` nếu confidence thấp hoặc provider báo không chắc.

## Contract provider

Provider mặc định mới:

- `translation_ai_provider = "deepseek"`
- `translation_ai_transport = "openai_compatible"` hoáº·c `"anthropic_compatible"`
- `translation_ai_model = "deepseek-v4-flash"`
- Model API tương ứng: `deepseek-v4-flash`
- Mode mặc định: non-thinking, `thinking = disabled`
- Secret: `DEEPSEEK_API_KEY`
- Ghi chÃº cáº­p nháº­t: mode canonical hiá»‡n táº¡i lÃ  `thinking = disabled`, khÃ´ng gá»­i `reasoning_effort` khi thinking táº¯t. DeepSeek cÃ³ OpenAI-compatible base URL `https://api.deepseek.com` vÃ  Anthropic-compatible base URL `https://api.deepseek.com/anthropic`.
- Base URL mặc định: `https://api.deepseek.com`

UI Project Config hiện list các model DeepSeek: `deepseek-v4-flash`, `deepseek-v4-pro`, `deepseek-chat`. `deepseek-chat` phải hiển thị warning deprecated soon.

UI Project Config canonical hiá»‡n list cÃ¡c model DeepSeek: `deepseek-v4-flash`, `deepseek-v4-pro`, `deepseek-chat`. `deepseek-chat` pháº£i hiá»ƒn thá»‹ warning deprecated soon.

## Contract `codex_exec`

`codex_exec` là external command adapter. Worker `translate` vẫn dùng adapter này cho queue flow chung; riêng Issue Editor có endpoint direct translate gọi provider ngay trong request hiện tại để tạo `ai_draft`, không enqueue `sync_jobs`.

Input truyền vào command qua `stdin` dạng JSON chuẩn hóa:

```json
{
  "request_id": "trreq_xxx",
  "queue_id": 123,
  "project_id": "project_id",
  "issue_id": "issue_id",
  "comment_id": null,
  "direction": {
    "source_language": "ja",
    "target_language": "vi"
  },
  "source_language": "ja",
  "target_language": "vi",
  "content_type": "issue",
  "source_text": "...",
  "source_text_hash": "sha256...",
  "requested_provider": "codex_exec",
  "context_policy": "default_translation",
  "context_bundle": {
    "issue_keys": {
      "backlog_issue_key": "WEC-123",
      "jira_issue_key": null
    },
    "issue_context": {},
    "neighbor_comments": [],
    "translation_memory": [],
    "glossary": [],
    "preservation_rules": {},
    "signals": {}
  },
  "context": {
    "project_id": "project_id",
    "issue_id": "issue_id",
    "backlog_issue_key": "WEC-123"
  },
  "instructions": [
    "Giữ nguyên code block, link, issue key và key kỹ thuật.",
    "Chỉ trả JSON hợp lệ qua stdout."
  ]
}
```

Output bắt buộc trả qua `stdout` dạng JSON:

```json
{
  "translated_text": "...",
  "confidence": 0.82,
  "warnings": [],
  "preserved_blocks": true
}
```

Quy tắc lỗi:

- Exit code khác `0`: retry/fail theo job policy.
- Timeout: retry/fail với code `CODEX_EXEC_TIMEOUT`.
- Output không parse được JSON: retry/fail với code `CODEX_EXEC_PARSE_ERROR`.
- Output thiếu `translated_text`: retry/fail với code `CODEX_EXEC_INVALID_OUTPUT`.
- Không log full prompt/output; chỉ log hash, duration, exit code và error code.
- `context_bundle.glossary` lấy từ config riêng của từng project.
- `collectTranslationContext()` hiện chạy rule-based, chưa dùng LLM để lấy context.

## Deliverables

- Module `Translation` theo [module_structure.md](../../../../architecture/custom_modular_monolith_theory/module_structure.md) và [implement_rules.md](../../../../architecture/custom_modular_monolith_theory/implement_rules.md).
- Provider adapter `codex_exec`.
- Fake `codex_exec` command/script để test tự động.
- Handler `translate` đăng ký vào worker phase 02.
- Prompt builder và output parser.
- Rule-based context collector và standardized translation input builder.
- API translation queue list/detail/approve/reject/retranslate/manual-edit.
- Audit/journal cho translate và review.
- Test script tự động cho success, timeout, parse error và manual edit.

## Chốt chặn

Phase này đạt khi translation option có thể dịch nội dung từ CIS bằng `codex_exec`, admin có thể duyệt/sửa/từ chối, và issue translation approved/edited được apply vào canonical CIS. Với comment, chỉ bản dịch approved/edited mới đủ điều kiện để sync comment sang Jira.

Không đi phase 05 nếu:

- API direct translate trong Issue Editor không có loading/error rõ hoặc làm mất audit trong `translation_queue`.
- Không có timeout cho `codex_exec`.
- Lỗi `codex_exec` không retry/fail rõ.
- Code block bị dịch hỏng trong test mẫu.
- Admin approve/edit không ghi audit.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] Test script tự động của phase 04 pass với fake `codex_exec`, ví dụ `npm run verify:phase04`.
- [x] Test translation job pending được worker xử lý thành `ai_draft`.
- [x] Test draft lưu `provider = codex_exec`.
- [x] Test draft có metadata command/profile/confidence nếu có.
- [x] Test admin approve draft chuyển review status sang `approved`.
- [x] Test admin manual-edit chuyển review status sang `edited`.
- [x] Test admin reject rồi retranslate tạo draft mới.
- [x] Test issue chỉ chuyển `approved` khi các translation bắt buộc đã `approved` hoặc `edited`.
- [x] Test `codex_exec` timeout tạo retry/fail đúng policy.
- [x] Test output JSON lỗi tạo retry/fail đúng policy.
- [x] Test standardized translation input vẫn giữ `source_text` top-level để tương thích provider hiện tại.
- [x] Test `collectTranslationContext()` nạp glossary riêng của project vào `context_bundle.glossary`.
- [x] Test journal `translation_ai_draft` ghi context summary như `context_policy`, `glossary_count`, `translation_memory_count` và `signals`.

### Manual check (Người review)

- [ ] Chạy worker với fake hoặc command `codex_exec` local và thấy draft được tạo.
- [ ] Approve translation từ API và thấy trạng thái `approved`.
- [ ] Manual-edit translation từ API và thấy trạng thái `edited`.
- [ ] Reject rồi retranslate từ API và thấy draft mới.
- [ ] Kiểm tra journal/audit cho translate và review action.
- [ ] Kiểm tra một project có glossary riêng và draft dịch ưu tiên đúng thuật ngữ đã cấu hình.

## Ghi chú thiết kế

- DeepSeek đang được gọi qua OpenAI-compatible Chat Completions API; Lite hiện chưa expose provider `openai_api` riêng.
- Không dịch attachment text.
- Comment ngắn vẫn cần review, có thể có quick approve nhưng không auto-approve.
- Phase 03 không tạo `translation_queue` và không enqueue job `translate`; translation không tham gia quá trình `System -> CIS`.
- Khi bật translation cho một project/issue, queue dịch và job `translate` phải chạy theo đường riêng `cis -> cis`.
- API review đổi trạng thái queue, ghi journal và với issue translation sẽ apply reviewed text vào `fields_json.<target_field>.cis`.
- `translate` job dùng `CODEX_EXEC_COMMAND`, timeout bằng `CODEX_EXEC_TIMEOUT_SECONDS`, và ghi lỗi provider vào `translation_queue.provider_error`.
- Adapter Codex CLI thật nằm trong `src/infrastructure/ai/codexCliAdapter.js`; `.env` local có thể trỏ `CODEX_EXEC_COMMAND=node src/infrastructure/ai/codexCliAdapter.js`.
- Adapter này vẫn gọi `codex exec --sandbox read-only` thật, nhưng chuẩn hóa output theo `codexTranslationOutput.schema.json` để worker luôn nhận JSON contract ổn định.
- Job dịch, nếu được tạo bởi option riêng, có priority thấp hơn job pull để worker ưu tiên hoàn tất inbound pull trước.
- Unit test đã pass bằng `scripts/verify/translation-review.js`; manual checklist vẫn cần người review xác nhận qua API/local worker.
