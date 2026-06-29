# Phase 04 - Translation review

## Mục tiêu

Dịch Nhật -> Việt bằng `codex_exec`, đưa bản dịch vào queue và buộc human review trước khi sync Jira.

## Làm trong phase này

- Tạo module `Translation`.
- Tạo provider `codex_exec`.
- Tạo manual fallback.
- Tạo worker xử lý translation queue.
- Thiết kế prompt giữ nguyên code block, link, issue key, key kỹ thuật.
- Parse output thành draft và metadata.
- Tạo API list/detail translation queue.
- Tạo API approve/reject/retranslate/manual-edit.
- Cập nhật state issue theo queue review.
- Ghi journal/audit cho translate và review action.
- Tạo anomaly `translation_low_conf` nếu confidence thấp hoặc provider báo không chắc.

## Contract `codex_exec`

`codex_exec` là external command adapter, chỉ được gọi từ worker. API request không gọi trực tiếp command này.

Input truyền vào command qua `stdin` dạng JSON:

```json
{
  "source_language": "ja",
  "target_language": "vi",
  "content_type": "issue_summary",
  "source_text": "...",
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

## Deliverables

- Module `Translation` với API boundary.
- Provider adapter `codex_exec`.
- Fake `codex_exec` command/script để test tự động.
- Handler `translate` đăng ký vào worker phase 02.
- Prompt builder và output parser.
- API translation queue list/detail/approve/reject/retranslate/manual-edit.
- Audit/journal cho translate và review.
- Test script tự động cho success, timeout, parse error và manual edit.

## Chốt chặn

Phase này đạt khi nội dung từ Backlog được dịch bằng `codex_exec`, admin có thể duyệt/sửa/từ chối, và chỉ bản dịch approved/edited mới được xem là đủ điều kiện đi tiếp.

Không đi phase 05 nếu:

- API request trực tiếp gọi `codex_exec` và bị block lâu.
- Không có timeout cho `codex_exec`.
- Lỗi `codex_exec` không retry/fail rõ.
- Code block bị dịch hỏng trong test mẫu.
- Admin approve/edit không ghi audit.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] Test script tự động của phase 04 pass với fake `codex_exec`, ví dụ `npm run verify:phase04`.
- [ ] Test translation job pending được worker xử lý thành `ai_draft`.
- [ ] Test draft lưu `provider = codex_exec`.
- [ ] Test draft có metadata command/profile/confidence nếu có.
- [ ] Test admin approve draft chuyển review status sang `approved`.
- [ ] Test admin manual-edit chuyển review status sang `edited`.
- [ ] Test admin reject rồi retranslate tạo draft mới.
- [ ] Test issue chỉ chuyển `approved` khi các translation bắt buộc đã `approved` hoặc `edited`.
- [ ] Test `codex_exec` timeout tạo retry/fail đúng policy.
- [ ] Test output JSON lỗi tạo retry/fail đúng policy.

### Manual check (Người review)

- [ ] Chạy worker với fake hoặc command `codex_exec` local và thấy draft được tạo.
- [ ] Approve translation từ API và thấy trạng thái `approved`.
- [ ] Manual-edit translation từ API và thấy trạng thái `edited`.
- [ ] Reject rồi retranslate từ API và thấy draft mới.
- [ ] Kiểm tra journal/audit cho translate và review action.

## Ghi chú thiết kế

- `openai_api` chỉ là optional/fallback, không phải đường mặc định của Lite.
- Không dịch attachment text.
- Comment ngắn vẫn cần review, có thể có quick approve nhưng không auto-approve.
