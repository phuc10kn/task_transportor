# First Doc Change

Đổi docs đầu tiên dùng Luồng tổng, không dùng checklist song song.

## Nhánh docs thuần

1. [read-for-task.md](../workflows/read-for-task.md) — xác định canonical home và unit type.
2. [write-docs.md](../workflows/write-docs.md) — sửa file hiện có trước khi tạo file mới; emit `write-docs result` (short hoặc full theo ceremony matrix).
3. [trace-impact.md](../workflows/trace-impact.md) — nếu có entity, relation hoặc impact cross-layer.
4. [validate-after-change.md](../workflows/validate-after-change.md) — terminal gate trước handoff/review.

## Nhánh code / product behavior

1. [read-for-task.md](../workflows/read-for-task.md).
2. [sync-product-change.md](../workflows/sync-product-change.md) — behavior delta, evidence, conflict gate.
3. Chỉ khi sync trả `ready_for_write`: [write-docs.md](../workflows/write-docs.md); emit `write-docs result` full form và reference sync result.
4. [trace-impact.md](../workflows/trace-impact.md) nếu sync gắn cờ cần trace.
5. [validate-after-change.md](../workflows/validate-after-change.md).

Nếu sync trả `blocked`, làm rõ authority/decision trước; không sửa docs để hợp thức hóa code.

Nếu chưa xác định được canonical home và project đã kích hoạt Workbench, chuyển [use-workbench.md](../workflows/use-workbench.md). Không đưa thẳng vào app/theory/meta.

## Ví dụ phân loại home

Muốn làm rõ external write phải qua pre-check trước khi ghi thật:

| Câu hỏi | Trả lời |
| --- | --- |
| Đây là gì? | App-specific product/architecture/quality rule. |
| Canonical home? | `docs/app/<layer>/` tương ứng mức mô tả (ví dụ product, architecture, quality). |
| Có decision liên quan? | `docs/app/10-decisions/` nếu project đã có decision phù hợp. |
| Có theory liên quan? | `TH-...` nếu project đã có theory phù hợp. |

Không đặt rule này vào `docs/theories/` vì nó nhắc external write cụ thể, tức là app-specific.
