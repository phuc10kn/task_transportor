# First Doc Change

Workflow an toàn cho thay đổi docs đầu tiên:

```text
1. Xác định nội dung là app truth, meta rule, theory hoặc decision.
2. Mở canonical home tương ứng.
3. Sửa file hiện có trước khi tạo file mới.
4. Nếu thay đổi cross-layer, kiểm tra theory_basis, decision_basis và relation/reference.
5. Nếu chưa xác định được canonical home, dừng và làm theo lifecycle local của project.
6. Chạy git diff --check cho file đã sửa.
```

## Ví dụ

Muốn làm rõ external write phải qua pre-check trước khi ghi thật:

| Câu hỏi | Trả lời |
| --- | --- |
| Đây là gì? | App-specific product/architecture/quality rule. |
| Canonical home? | `docs/app/02-product`, `docs/app/05-architecture`, `docs/app/08-quality` tùy mức mô tả. |
| Có decision liên quan? | `docs/app/10-decisions/README.md` có decision phù hợp. |
| Có theory liên quan? | `TH-...` nếu project đã có theory phù hợp. |

Không đặt rule này vào `docs/theories/` vì nó nhắc external write cụ thể, tức là app-specific.
