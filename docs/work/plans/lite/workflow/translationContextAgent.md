# Workflow - Translation Context Agent

## Mục tiêu

Định nghĩa một chức năng `collectTranslationContext()` cho module `Translation` trước khi gọi model dịch.

**Scope hiện tại:**

- chỉ cần `rule_based`
- chưa dùng LLM để lấy context
- chưa cần planner/ranker bằng model

Về sau, chức năng này có thể mở rộng theo hướng agent-assisted nếu thật sự cần. Nhưng ở bước này, nhiệm vụ chính của nó **không phải dịch**, mà là:

- lấy đúng context cần thiết
- chuẩn hóa context đó
- đưa context vào translation input

Phần shape chuẩn của input dịch được tách riêng ở:

- [translationStandardInput.md](./translationStandardInput.md)

---

## Vì sao cần `collectTranslationContext()`

Hiện tại translation flow còn yếu ở chỗ:

- source text thường được dịch gần như đơn lẻ
- comment có thể lẫn Nhật, Việt, English, log, code
- thiếu issue summary/description làm nền
- thiếu comment lân cận
- thiếu translation memory và glossary

Nếu không có lớp thu thập context, provider dịch sẽ phải làm việc với quá ít tín hiệu.

---

## Vai trò của `collectTranslationContext()`

`collectTranslationContext()` nhận một translation queue item hoặc request dịch, rồi:

1. phân tích loại item
2. quyết định cần lấy context nào
3. dùng tool để đọc context
4. chuẩn hóa kết quả thành `context_bundle`
5. trả lại cho bước build translation input

Flow:

```text
translation_queue item
  -> collectTranslationContext()
  -> context_bundle
  -> Standard Translation Input
  -> Translation Provider
```

---

## Chế độ hoạt động hiện tại

## Rule-based

Đây là mode duy nhất cần làm ở bước hiện tại.

Đặc điểm:

- không cần LLM để quyết định
- dùng rule cố định để lấy context
- deterministic
- nhanh
- rẻ

Ví dụ rule:

- nếu `target_type = comment` thì lấy 3 comment trước và 1 comment sau
- nếu `source_text` ngắn và chứa tiếng Nhật ngắn gọn thì lấy thêm translation memory gần nhất
- nếu text có nhiều identifier thì tăng preservation rules

## Agent-assisted trong tương lai

Đây chỉ là hướng mở rộng về sau, chưa cần implement bây giờ.

Nếu sau này bật mode này, model nhỏ sẽ chỉ làm:

- planner
- selector
- ranker

và vẫn không trực tiếp làm bước dịch.

---

## Boundary của `collectTranslationContext()`

## Được phép

- đọc dữ liệu DB local
- đọc issue/revision/comment/translation history
- đọc project glossary/instruction snippets
- tính heuristics/signal

## Không được phép

- ghi DB
- sửa translation queue
- enqueue job mới
- gọi sync
- gọi Backlog/Jira live chỉ để lấy thêm context
- search filesystem toàn repo không giới hạn

## Có thể mở sau

- retrieval theo embedding
- đọc instruction files trong scope project
- language classification tool
- LLM planner/selective collector

---

## Tool contract đề xuất

Dù chưa dùng LLM, nên vẫn định nghĩa tool boundary rõ ràng cho `collectTranslationContext()`.

Ở bước hiện tại, các "tool" này có thể chỉ là hàm/read adapter nội bộ read-only.

## DB read tools

- `get_issue_bundle(issue_id)`
- `get_neighbor_comments(issue_id, comment_id, before, after)`
- `get_recent_approved_translations(project_id, limit, target_type)`
- `get_project_glossary(project_id)`
- `get_project_instruction_snippets(project_id, limit)`

## Text analysis tools

- `detect_text_signals(source_text)`
- `extract_preserved_blocks(source_text)`
- `score_mixed_language(source_text)`

## Retrieval tools optional

- `search_translation_memory(project_id, query, limit)`
- `search_glossary(project_id, query, limit)`

## Không nên cho

- write DB
- external side effects
- unrestricted shell/file tools

---

## Context sources nên thu thập

## 1. Queue item hiện tại

Luôn có:

- `source_text`
- `target_type`
- `source_language`
- `target_language`
- `issue_id`
- `comment_id`

## 2. Issue context

Từ CIS:

- `backlog_issue_key`
- `jira_issue_key`
- issue lifecycle state
- latest summary
- latest description
- effective canonical fields nếu cần

## 3. Neighbor comments

Đặc biệt quan trọng cho comment translation.

Nên lấy:

- 1 đến 3 comment trước
- 0 đến 2 comment sau
- author/source_system

## 4. Translation memory

Từ cùng project:

- các item `approved`
- các item `edited`
- ưu tiên cùng terminology hoặc cùng issue

## 5. Glossary

Ví dụ:

```json
[
  { "source": "予約", "target": "đặt chỗ" },
  { "source": "管理画面", "target": "màn hình quản trị" }
]
```

Glossary phải được coi là **config riêng theo project**, không phải danh sách dùng chung toàn hệ thống.

Lý do:

- cùng một từ tiếng Nhật có thể cần cách dịch khác nhau theo domain/project,
- tránh việc LLM drift thuật ngữ qua cách hiểu phổ thông nhưng sai với business,
- giữ consistency giữa issue, comment và translation history trong cùng project.

Ở bước hiện tại, `collectTranslationContext()` phải luôn cố gắng nạp glossary của project vào `context_bundle.glossary` nếu project có cấu hình.

## 6. Preservation rules

Ví dụ:

```json
{
  "translate_japanese_only": true,
  "keep_target_language_segments": true,
  "preserve_identifiers": true,
  "preserve_code_blocks": true
}
```

## 7. Signals

Rule engine nên trả ra:

- `contains_vietnamese`
- `contains_japanese`
- `contains_english`
- `contains_code_block`
- `contains_stack_trace`
- `contains_many_identifiers`
- `is_short_ack_comment`
- `is_mixed_language`

---

## Output của `collectTranslationContext()`

Output chuẩn hóa của hàm này là `context_bundle`.

Ví dụ:

```json
{
  "issue_keys": {
    "backlog_issue_key": "18DMP-1",
    "jira_issue_key": null
  },
  "project_profile": {
    "name": "18DMP"
  },
  "issue_context": {
    "summary": "Lỗi login trên màn hình xác nhận",
    "description": "Issue liên quan đến flow xác nhận..."
  },
  "neighbor_comments": [
    {
      "source_system": "backlog",
      "author": "Tanaka",
      "text": "前回の修正後に再確認しました。"
    }
  ],
  "translation_memory": [
    {
      "source_text": "確認しました",
      "reviewed_text": "Đã xác nhận"
    }
  ],
  "glossary": [
    {
      "source": "管理画面",
      "target": "màn hình quản trị"
    }
  ],
  "preservation_rules": {
    "translate_japanese_only": true,
    "keep_target_language_segments": true,
    "preserve_identifiers": true
  },
  "signals": {
    "contains_vietnamese": true,
    "contains_japanese": true,
    "is_mixed_language": true
  }
}
```

Output này sẽ được gắn vào `Translation Standard Input`.

---

## Cách dùng với `codex_exec`

`collectTranslationContext()` không phụ thuộc provider.

Flow với `codex_exec`:

1. queue item
2. `collectTranslationContext()` lấy `context_bundle`
3. app build `Standard Translation Input`
4. adapter `codex_exec` serialize input đó vào prompt

---

## Cách dùng với `openai_api`

Tương tự:

1. queue item
2. `collectTranslationContext()` lấy `context_bundle`
3. app build `Standard Translation Input`
4. provider `openai_api` nhét object đó vào `messages` hoặc `input`

Điểm chính:

- Context Agent tạo context nội bộ cho app
- không phụ thuộc transport của OpenAI

---

## Vị trí module đề xuất

```text
src/modules/Translation/
  application/
    collectTranslationContext.js
  infrastructure/
    TranslationContextCollector.js
  support/
    detectTextSignals.js
    selectNeighborComments.js
```

Khuyến nghị:

- `collectTranslationContext.js` là use case
- `TranslationContextCollector.js` orchestration rule-based
- chưa cần `TranslationContextAgent.js` ở bước hiện tại

---

## Flow mới trong translate job

```text
translate job
  -> load translation queue item
  -> collectTranslationContext()
  -> buildStandardTranslationInput()
  -> provider.translate()
  -> save ai_draft
  -> journal
```

Chi tiết:

1. Load queue item
2. Load issue core
3. `collectTranslationContext()` thu thập context
4. Build standardized input
5. Gọi provider
6. Save output
7. Journal context summary

---

## Journal/audit nên bổ sung

Ngoài metadata dịch hiện có, nên ghi thêm:

- `context_policy`
- `context_mode`
- `context_sources_used`
- `neighbor_comments_count`
- `translation_memory_count`
- `glossary_count`
- `signals`
- hash của `context_bundle`

Không nên log full raw context nếu có dữ liệu nhạy cảm.

---

## Khống chế độ lớn context

Để tránh prompt phình to:

1. giới hạn neighbor comments
2. giới hạn translation memory
3. chỉ lấy glossary relevant
4. summarize context khi cần
5. hard limit số token cho `context_bundle`

---

## Rủi ro và khóa an toàn

## 1. Rule-based collector lấy context chưa đủ

Khóa:

- rule-based là default
- context sources phải có ranking rõ

## 2. Context bundle quá lớn

Khóa:

- context limit
- selection theo rule
- không dump toàn bộ history

## 3. Collector đọc quá rộng

Khóa:

- tool set read-only
- scope theo issue/project

## 4. Dữ liệu nhạy cảm bị log

Khóa:

- log hash thay vì full raw context
- redact field nhạy cảm

---

## Ảnh hưởng tới docs/work

Nếu implement thật, các doc cần cập nhật:

### Bắt buộc

1. `docs/work/plans/lite/implement_plans/04-translation-review.md`
2. `docs/work/05-translation-pipeline.md`

### Nên cập nhật

3. `docs/work/plans/lite/implement_context.md`
4. `docs/work/11-api-contract.md` nếu mở debug API

---

## Kết luận

Ở giai đoạn hiện tại, thứ mình cần là một capability riêng tên `collectTranslationContext()`, tập trung vào việc **lấy và chuẩn hóa context** bằng rule-based logic, không ôm luôn phần contract input dịch.

Khuyến nghị thực tế:

- tách riêng `Standard Translation Input`
- triển khai `collectTranslationContext()` ngay
- chưa dùng LLM cho bước lấy context
- để `agent_assisted` là optional phase sau

File này hiện chốt phần **lấy context** trước. Ý tưởng "agent/tool" chỉ được giữ như hướng mở rộng tương lai.

Phần **input dịch chuẩn hóa** nằm ở:

- [translationStandardInput.md](./translationStandardInput.md)
