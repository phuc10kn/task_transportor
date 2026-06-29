# Lite - Translation review

## Provider

Lite dùng AI translation thật, nhưng đường chính là chạy qua `codex_exec` thay vì gọi Platform API trực tiếp để tiết kiệm chi phí.

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

## Yêu cầu review

- Human review bắt buộc trước khi sync Jira.
- Admin có thể approve draft.
- Admin có thể edit/manual-edit rồi approve.
- Admin có thể reject và retranslate.
- Comment ngắn vẫn cần review; có thể hỗ trợ quick approve nhưng không auto-approve.
- Code block trong comment phải được giữ nguyên, chỉ dịch text xung quanh.
- AI confidence thấp tạo warning/anomaly `translation_low_conf`, ưu tiên review queue nhưng không block sau khi human review.
- Khi issue content thay đổi, không tự động ghi đè bản dịch đã duyệt; tạo revision mới và đưa issue về `update_pending`.

## Audit

Các action sau phải ghi `sync_journal` hoặc audit tương đương:

- AI translate.
- Approve translation.
- Reject translation.
- Retranslate.
- Manual edit.

Nếu admin sửa bản dịch, cần lưu được old/new text hoặc đủ metadata để sau này Medium/Full học từ review history.
