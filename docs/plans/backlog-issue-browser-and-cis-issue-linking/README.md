# Kế hoạch Backlog Issues, CIS Issue thủ công và external identity linking

> Trạng thái: Implemented — automated verification pass; manual acceptance bằng credential/browser thật còn pending.
>
> Phạm vi phiên bản: Lite.
>
> Mã phase ổn định: BIS = Backlog Issue Screen and CIS identity linking.

## Cấu trúc tài liệu

| Khu vực | Nội dung |
| --- | --- |
| [Overview](./00-overview/README.md) | Mục tiêu, scope, quyết định đã chốt, baseline, source of truth và thiết kế mục tiêu. |
| [Phases](./01-phases/README.md) | Thứ tự triển khai BIS-00 đến BIS-05, target artifacts, task và checklist từng phase. |
| [Điều phối](./02-coordination/README.md) | Handoff, resume rules, accepted gaps, deferred work, risk và điều kiện hoàn thành. |
| [Prompts dùng chung](../prompts/coordinator.md) | Coordinator/executor/planner prompts của workspace. |

## Thứ tự đọc và thực thi

1. Đọc [Overview](./00-overview/README.md) và toàn bộ capability contract liên quan.
2. Mở đúng phase trong [Phase index](./01-phases/README.md); không nhảy phase.
3. Sau mỗi phase, cập nhật result/handoff theo [Điều phối](./02-coordination/README.md).
4. Checklist chỉ được tick khi có evidence thực tế; Manual check chỉ tick sau user xác nhận.

## Precedence nội bộ plan

- Quyết định product/contract nằm trong Overview.
- Scope triển khai và acceptance cụ thể nằm trong phase tương ứng.
- Trạng thái thực thi, blocker và resume rule nằm trong Điều phối.
- Nếu nội dung plan mâu thuẫn với `docs/app` hoặc `AGENTS.md`, áp dụng precedence đã quy định trong `AGENTS.md` và quay lại planner trước khi code.
