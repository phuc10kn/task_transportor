# Promote Backlog

## Khi nào promote

Promote khi candidate đã có:

- meaning rõ;
- target canonical home rõ;
- không conflict với docs hiện tại;
- đủ ổn định để người/agent dùng lại;
- nếu là decision thì có rationale/trade-off.

## Workflow

```text
1. Đọc backlog note.
2. Chia nội dung thành: promote now / heuristic / keep backlog / reject.
3. Với phần promote, xác định canonical home.
4. Sửa canonical docs bằng nội dung ngắn gọn.
5. Không copy toàn bộ analysis nếu chỉ cần rule.
6. Cập nhật backlog note: promoted, kept, rejected hoặc superseded.
7. Xóa file backlog nếu toàn bộ nội dung đã hấp thụ và không cần provenance.
```

## Promotion target

| Nội dung | Home |
| --- | --- |
| Entity/relation/validation/convention | `docs/meta/` |
| App truth | `docs/app/` |
| Reusable principle | `docs/theories/` |
| Reusable technical taxonomy | `docs/app_technical/` |
| Rationale/trade-off | `docs/app/10-decisions/` |

## Example

A former unstructured context note:

- relation model được promote vào `docs/meta`;
- trace workflow được promote vào validation convention;
- external references giữ trong `docs/backlog-theories` vì cần verify lại.
