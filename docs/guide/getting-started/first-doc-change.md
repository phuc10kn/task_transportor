# First Doc Change

Workflow an toàn cho thay đổi docs đầu tiên:

```text
1. Xác định nội dung là app truth, meta rule, theory, decision hay backlog.
2. Mở canonical home tương ứng.
3. Sửa file hiện có trước khi tạo file mới.
4. Nếu thay đổi cross-layer, kiểm tra theory_basis, decision_basis và relation/reference.
5. Nếu chưa chắc, dùng NOTE-OPEN hoặc đưa vào backlog-theories.
6. Chạy git diff --check cho file đã sửa.
```

## Ví dụ

Muốn làm rõ Jira dry-run là bắt buộc trước sync thật:

| Câu hỏi | Trả lời |
| --- | --- |
| Đây là gì? | App-specific product/architecture/quality rule. |
| Canonical home? | `docs/app/02-product`, `docs/app/05-architecture`, `docs/app/08-quality` tùy mức mô tả. |
| Có decision liên quan? | `docs/app/10-decisions/README.md` có dry-run decision accepted. |
| Có theory liên quan? | `TH-SYNC-SAFE`. |

Không đặt rule này vào `docs/theories/` vì nó nhắc Jira cụ thể, tức là app-specific.

