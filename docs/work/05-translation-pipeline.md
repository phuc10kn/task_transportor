# Translation Pipeline - AI Translate + Review

## Trạng thái triển khai hiện tại

- Translation của issue được thao tác trực tiếp trong Issue Editor qua modal `Translations`.
- Màn chính Issue Editor chỉ có nút `Translations`; không còn modal/view status riêng cho translation.
- Mỗi issue translation phải có `target_field` rõ ràng: `summary` hoặc `description`. UI hiển thị là `Summary translation` và `Description translation`, không dùng nhãn kiểu `Issue translation #id`.
- Source text của issue translation là Backlog source hiện tại trong `fields_json.<target_field>.backlog`. Không fallback sang CIS, revision, hoặc queue cũ.
- `Translated text` lấy từ translation item mới nhất còn khớp Backlog source hiện tại. Nếu item stale hoặc source Backlog rỗng thì không fill bằng dữ liệu cũ.
- Trong Issue Editor, nút `Translate` gọi provider ngay trong request hiện tại và lưu draft vào `translation_queue`; không cần chờ worker queue.
- `Approve + save` lưu reviewed text và apply vào canonical `fields_json.<target_field>.cis`.
- Reject không apply canonical và không chặn admin retranslate sau đó.
- Queue issue-level thiếu `target_field` là legacy invalid data và không được tính vào trạng thái translation của issue.

## Vị trí trong luồng tổng thể

```text
Backlog issue
  -> ingest
  -> optional translation request
  -> translation_queue.pending
  -> translate job
  -> ai_draft
  -> review
  -> approved/edited
  -> sync lên Jira
```

## Mục tiêu Lite hiện tại

- Dịch Nhật -> Việt bằng `codex_exec` khi project/issue bật translation option.
- Chỉ tạo draft trong `translation_queue` khi có translation request.
- Human review vẫn bắt buộc cho comment sync nếu comment cần dịch. Với issue canonical sync từ Issue Editor, translation queue/review không còn là gate trực tiếp kiểu `TRANSLATION_REVIEW_REQUIRED`; bản dịch đã approve/edit chỉ là một cách cập nhật `fields_json.summary.cis` hoặc `fields_json.description.cis`. Riêng `issues.sync_status = 'pending_translate'` vẫn bị chặn bởi sync-state gate hiện tại.
- Context dịch được thu thập theo kiểu `rule_based`, chưa dùng LLM cho bước lấy context.

## Khi nào AI translate?

| Tình huống | Auto-translate? | Ghi chú |
| --- | --- | --- |
| Issue mới từ Backlog | Không trong inbound | Translation là option riêng sau khi dữ liệu đã vào CIS. |
| Comment mới từ Backlog | Không trong inbound | Nếu comment cần sync Jira và cần dịch, vẫn cần human review trước khi sync comment. |
| Dev comment từ Jira cần về Backlog | Chưa trong Lite | Dành cho Medium/Jira inbound đầy đủ. |
| Issue content thay đổi | Không ghi đè bản dịch cũ | Tạo revision/queue mới theo chính sách update. |
| Issue đã có bản dịch cũ | Không tự dịch lại | Admin dùng retranslate khi cần. |

## Standard translation input

Worker `translate` không còn chỉ đưa `source_text` trần cho provider. Trước khi gọi provider, app build một contract nội bộ chuẩn hóa:

```json
{
  "request_id": "trreq_xxx",
  "queue_id": 123,
  "project_id": "3",
  "issue_id": "uuid",
  "comment_id": null,
  "direction": {
    "source_language": "ja",
    "target_language": "vi"
  },
  "target_type": "issue",
  "content_type": "issue",
  "source_text": "...",
  "source_text_hash": "sha256...",
  "requested_provider": "codex_exec",
  "context_policy": "default_translation",
  "context_bundle": {},
  "instructions": [],
  "output_schema": {
    "translated_text": "string",
    "confidence": "number",
    "warnings": ["string"],
    "preserved_blocks": ["string"]
  }
}
```

## `collectTranslationContext()`

Trước khi build request chuẩn hóa, worker gọi `collectTranslationContext()` để gom context read-only từ CIS:

- issue keys
- project profile
- latest revision summary/description
- neighbor comments
- translation memory đã `approved` hoặc `edited`
- glossary riêng theo project
- text signals
- preservation rules

Output chính là `context_bundle`.

## Project glossary

Mỗi project có `translation_glossary_json` riêng trong project config.

Mục đích:

- giữ ổn định thuật ngữ domain tiếng Nhật
- tránh LLM drift giữa các project
- ưu tiên cách dịch đã chốt của business

Provider phải xem glossary như ưu tiên cao hơn suy đoán ngôn ngữ chung của model khi term khớp.

## Translation memory

Translation memory hiện lấy từ `translation_queue` cùng project với các item:

- `review_status = approved`
- `review_status = edited`

Memory này chỉ là hint giữ consistency, không phải nguồn để copy máy móc.

## Learning từ review history

Khi admin approve/edit bản dịch, CIS giữ lại `source_text`, `ai_draft`, `reviewed_text`, `review_status` và metadata provider trong `translation_queue`.

Lite hiện chỉ dùng các bản `approved` hoặc `edited` gần nhất làm translation memory. Medium/Full có thể học sâu hơn từ review history để đề xuất glossary, few-shot examples hoặc scoring.

## Rule-based context policy

Hiện tại app gán policy theo heuristics đơn giản:

- `default_translation`
- `high_context_comment`
- `comment_mixed_language`

Ví dụ:

- comment mixed Japanese + Vietnamese -> bật `translate_japanese_only`
- text có code block -> bật `preserve_code_blocks`
- text có nhiều identifier/log -> bật `preserve_identifiers`

## Journal / audit

Khi tạo draft dịch, `sync_journal` nên ghi thêm:

- `context_policy`
- `neighbor_comments_count`
- `translation_memory_count`
- `glossary_count`
- `signals`
- `context_bundle_hash`

Không log full context raw nếu không thật sự cần.

## Review flow

```text
translation_queue.pending
  -> ai_draft
  -> approved | rejected | edited
```

- `approved`: lấy `ai_draft` làm `reviewed_text`
- `edited`: lấy text do người review sửa
- `rejected`: có thể enqueue lại để retranslate

## Xử lý đặc biệt

Confidence thấp:

- Nếu confidence thấp hơn ngưỡng, tạo anomaly `translation_low_conf`.
- Anomaly này ưu tiên review nhưng không block sau khi human approve/edit.

Comment ngắn:

- Comment ngắn vẫn tạo draft nếu có text cần dịch.
- Không auto-approve trong Lite.

Code/log/technical text:

- Code block, URL, issue key, ID, command, path và technical key phải được giữ nguyên.
- Nếu text gần như chỉ là log/config/stack trace, provider nên giữ nguyên và hạ confidence nếu cần.

Mixed-language:

- Nếu text đã có tiếng Việt tự nhiên, giữ nguyên phần đó.
- Nếu text lẫn Nhật + Việt/English, chỉ dịch phần tiếng Nhật cần dịch.

## Ghi chú triển khai

- `openai_api` vẫn là optional/fallback cho Lite.
- Provider transport có thể khác nhau, nhưng app chỉ nên truyền cùng một standardized input.
- Context collector hiện không gọi Backlog/Jira live, không có side effect, không ghi DB.
