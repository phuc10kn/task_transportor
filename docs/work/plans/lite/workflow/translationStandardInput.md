# Workflow - Translation Standard Input

## Mục tiêu

Chuẩn hóa đầu vào dịch của module `Translation` để mọi provider dùng cùng một contract nội bộ, bất kể provider thực thi là:

- `codex_exec`
- `openai_api`

File này chỉ tập trung vào:

- shape chuẩn của input dịch
- nguyên tắc build input
- ý nghĩa từng field
- cách mapping từ dữ liệu CIS sang input dịch

Phần thu thập context kiểu agent được tách riêng ở:

- [translationContextAgent.md](./translationContextAgent.md)

---

## Bối cảnh hiện tại

Input dịch hiện tại còn khá mỏng:

```json
{
  "source_language": "ja",
  "target_language": "vi",
  "content_type": "issue" | "comment",
  "source_text": "...",
  "context": {
    "project_id": "3",
    "issue_id": "uuid",
    "backlog_issue_key": "WEC-123",
    "comment_id": "501"
  },
  "instructions": [
    "Giữ nguyên code block, link, issue key và key kỹ thuật.",
    "Chỉ trả JSON hợp lệ qua stdout."
  ]
}
```

Input này đủ cho Lite cơ bản, nhưng chưa đủ tốt cho:

- comment mixed-language
- issue/comment nhiều thuật ngữ domain
- consistency giữa nhiều lần dịch
- provider nâng cao qua OpenAI API

---

## Nguyên tắc chuẩn hóa

## 1. Input chuẩn hóa là contract nội bộ của app

Object chuẩn hóa này:

- không phải body native của OpenAI API
- không phải prompt text thuần
- không phải output DB row raw

Nó là **translation contract nội bộ** giữa:

- queue item / context collector
- translation provider

## 2. Một contract dùng chung cho mọi provider

Provider nào cũng phải nhận cùng một shape:

- `codex_exec`
- `openai_api`
- provider khác trong tương lai

Khác biệt chỉ nằm ở adapter transport.

## 3. Source text luôn là trung tâm

`source_text` vẫn là dữ liệu chính để dịch.

Mọi context khác chỉ đóng vai trò:

- hỗ trợ hiểu nghĩa
- giữ consistency
- tránh dịch sai
- tránh dịch quá tay

## 4. Context phải có shape rõ ràng

Context không nên là một blob prose dài khó kiểm soát.

Nó nên là các group có cấu trúc:

- `issue_context`
- `neighbor_comments`
- `translation_memory`
- `glossary`
- `signals`
- `preservation_rules`

---

## Shape chuẩn đề xuất

```json
{
  "request_id": "trreq_xxx",
  "queue_id": 123,
  "project_id": "3",
  "issue_id": "ee9f33ca-15b3-4fc8-811a-b065f143e057",
  "comment_id": "501",
  "direction": {
    "source_language": "ja",
    "target_language": "vi"
  },
  "target_type": "comment",
  "source_text": "確認しました。Lỗi này đã fix ở bản mới。",
  "source_text_hash": "sha256...",
  "requested_provider": "codex_exec",
  "context_policy": "default_translation",
  "context_bundle": {
    "issue_keys": {
      "backlog_issue_key": "18DMP-1",
      "jira_issue_key": null
    },
    "project_profile": {},
    "issue_context": {},
    "neighbor_comments": [],
    "translation_memory": [],
    "glossary": [],
    "preservation_rules": {},
    "signals": {}
  },
  "instructions": [],
  "output_schema": {
    "translated_text": "string",
    "confidence": "number",
    "warnings": ["string"],
    "preserved_blocks": ["string"]
  }
}
```

---

## Giải thích từng nhóm field

## 1. Identification

```json
{
  "request_id": "trreq_xxx",
  "queue_id": 123,
  "project_id": "3",
  "issue_id": "uuid",
  "comment_id": "501"
}
```

Mục đích:

- trace request
- audit/journal
- correlate với translation queue và issue/comment trong CIS

## 2. Direction

```json
{
  "direction": {
    "source_language": "ja",
    "target_language": "vi"
  }
}
```

Không nên để rời rạc như hai field top-level độc lập nữa nếu muốn contract rõ hơn.

## 3. Target type

Ví dụ:

- `issue_summary`
- `issue_description`
- `comment`

Nếu chưa muốn tách kỹ ở Lite, có thể giữ:

- `issue`
- `comment`

Nhưng hướng lâu dài nên chi tiết hơn.

## 4. Source text

```json
{
  "source_text": "...",
  "source_text_hash": "sha256..."
}
```

`source_text_hash` giúp:

- audit
- dedupe/debug
- cache trong tương lai nếu cần

## 5. Provider preference

```json
{
  "requested_provider": "codex_exec"
}
```

Field này thể hiện preference của queue/project tại thời điểm dịch.

## 6. Context policy

```json
{
  "context_policy": "default_translation"
}
```

Dùng để biết request này đang chạy theo policy nào:

- `default_translation`
- `comment_mixed_language`
- `high_context_comment`
- `issue_summary_fast_path`

## 7. Context bundle

Đây là phần lớn nhất và quan trọng nhất.

### `issue_keys`

```json
{
  "issue_keys": {
    "backlog_issue_key": "18DMP-1",
    "jira_issue_key": "DMP-17"
  }
}
```

### `project_profile`

Nơi chứa:

- project name
- domain summary ngắn
- source/target defaults
- project translation preferences nếu có

### `issue_context`

Nơi chứa:

- effective summary
- effective description
- current issue status
- source system info nếu hữu ích

### `neighbor_comments`

Chứa một số comment lân cận nếu target là comment.

### `translation_memory`

Một số cặp:

- source_text
- reviewed_text

đã approved/edited từ cùng project.

### `glossary`

Danh sách thuật ngữ ưu tiên.

`glossary` này phải là glossary **riêng theo project**.

Không nên dùng một vocabulary global duy nhất cho toàn hệ thống, vì như vậy rất dễ làm lệch cách dịch các thuật ngữ domain tiếng Nhật giữa các project khác nhau.

Khuyến nghị:

- glossary nằm trong project config,
- `collectTranslationContext()` đọc glossary đó và gắn vào `context_bundle.glossary`,
- provider dịch phải ưu tiên glossary của project hơn cách dịch phỏng đoán của model.

### `preservation_rules`

Ví dụ:

```json
{
  "translate_japanese_only": true,
  "keep_target_language_segments": true,
  "preserve_identifiers": true
}
```

### `signals`

Ví dụ:

```json
{
  "contains_vietnamese": true,
  "contains_japanese": true,
  "contains_english": false,
  "contains_code_block": false,
  "is_mixed_language": true,
  "is_short_ack_comment": false
}
```

## 8. Instructions

Đây là lớp instruction nội bộ đã được normalize, không nên nhồi quá dài.

Ví dụ:

```json
[
  "Giữ nguyên code block, link, issue key và key kỹ thuật.",
  "Nếu text đã là tiếng Việt tự nhiên thì giữ nguyên.",
  "Nếu mixed-language thì chỉ dịch phần tiếng Nhật."
]
```

## 9. Output schema

Nên mô tả output expected của provider một cách ổn định.

Ví dụ:

```json
{
  "translated_text": "string",
  "confidence": "number",
  "warnings": ["string"],
  "preserved_blocks": ["string"]
}
```

---

## Mapping từ CIS sang Standard Input

## 1. Từ `translation_queue`

Lấy:

- `id -> queue_id`
- `project_id`
- `issue_id`
- `comment_id`
- `source_language`
- `target_language`
- `target_type`
- `source_text`
- `provider`

## 2. Từ `issues`

Lấy:

- `backlog_issue_key`
- `jira_issue_key`
- issue lifecycle state nếu cần

## 3. Từ `issue_revisions`

Lấy:

- summary/description hiện tại

## 4. Từ các nguồn context khác

Các nguồn này không bắt buộc build trực tiếp ở file này; chúng được gom vào `context_bundle` bởi context collector.

---

## Cách dùng với `codex_exec`

Flow:

1. build `Standard Translation Input`
2. serialize thành JSON
3. nhét JSON vào prompt adapter
4. `codex_exec` trả JSON output theo schema

Điểm chính:

- provider thấy standardized input
- không phải chỉ thấy text trần

---

## Cách dùng với `openai_api`

Flow:

1. build `Standard Translation Input`
2. serialize thành text JSON
3. đưa JSON đó vào `messages` hoặc `input`
4. model trả output JSON theo schema

Lưu ý:

- standardized input là contract nội bộ của app
- request body thật của OpenAI chỉ là lớp transport

---

## Các mức rollout khuyến nghị

## Bước 1

- giữ provider cũ
- chỉ thay `buildTranslationRequest()` thành `buildStandardTranslationInput()`

## Bước 2

- thêm `signals`
- thêm `preservation_rules`
- thêm `issue_context`

## Bước 3

- nối với context collector đầy đủ

---

## Ảnh hưởng tới docs/work

Nếu implement thật, các doc cần cập nhật:

### Bắt buộc

1. `docs/work/plans/lite/implement_plans/04-translation-review.md`
2. `docs/work/05-translation-pipeline.md`

### Nên cập nhật

3. `docs/work/plans/lite/implement_context.md`
4. `docs/work/11-api-contract.md` nếu mở endpoint debug/context

---

## Kết luận

`Translation Standard Input` nên được tách thành một contract nội bộ rõ ràng, độc lập với provider.

Lợi ích:

- dễ nâng cấp prompt/provider
- dễ thêm OpenAI API
- dễ thêm context collector
- dễ audit/debug hơn

File này chỉ chốt phần **input chuẩn hóa**.

Phần **lấy context kiểu agent/tool** được mô tả riêng ở:

- [translationContextAgent.md](./translationContextAgent.md)
