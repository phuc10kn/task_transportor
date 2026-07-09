# Promote Candidate

## Khi nào promote

Promote khi candidate đã có:

- meaning rõ;
- target canonical home rõ;
- không conflict với docs hiện tại;
- đủ ổn định để người/agent dùng lại;
- nếu là decision thì có rationale/trade-off.

## Workflow

```text
1. Đọc candidate trong ngữ cảnh gần nhất.
2. Chia nội dung thành: promote now / heuristic / reject / keep outside docs.
3. Với phần promote, xác định canonical home.
4. Sửa canonical docs bằng nội dung ngắn gọn.
5. Không copy toàn bộ analysis nếu chỉ cần rule.
6. Nếu chưa đủ chín, dùng NOTE-OPEN hoặc giữ ngoài docs cho tới khi có home đang hoạt động.
```

## Promotion target

| Nội dung | Home |
| --- | --- |
| Entity/relation/validation/convention | `docs/meta/` |
| App truth | `docs/app/` |
| Reusable principle | `docs/theories/` |
| Universal app model / generic taxonomy | `docs/app_variants/raw_app_original/` |
| Methodology-specific template | `docs/app_variants/custom_modular_monolith/` |
| Rationale/trade-off | `docs/app/10-decisions/` |

## Workbench note

`docs/workbench/` chưa được đi vào hoạt động. Không promote từ workbench và không tạo workbench item thật cho tới khi `docs/guide` có activation gate rõ ràng.
