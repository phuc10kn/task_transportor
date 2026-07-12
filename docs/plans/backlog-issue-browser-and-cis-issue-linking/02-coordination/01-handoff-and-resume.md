# Handoff và resume

> [← Điều phối](./README.md) · [Phase index](../01-phases/README.md)

## Handoff hiện tại

~~~text
Current phase: BIS-05 automated complete; Manual check pending
Done: BIS-00 đến BIS-05 đã implement; npm test và Type Contract Gate pass; docs/app đã đồng bộ.
Next: Người review chạy manual browser với Backlog/Jira credential thật và xác nhận các Manual check còn trống.
Prompt tiếp theo: docs/plans/prompts/coordinator.md
~~~

## Trạng thái blocked

~~~text
None
~~~

## Quy tắc resume

- Coordinator chỉ mở phase kế tiếp khi automated/required gate của phase trước đã pass thật; không nhảy từ BIS-00 sang BIS-02. Manual check còn unchecked không chặn progression trừ khi user/coordinator đã đánh dấu rõ đó là blocking gate.
- Executor phải đọc toàn bộ plan, source of truth của phase và target artifacts trước khi sửa.
- Chỉ tick checklist khi có evidence thực tế.
- Nếu bị ngắt giữa phase, ghi đúng format: In-progress: <phase id> - <đã xong> | Next: <việc tiếp theo>.
- Review-only/verify-only dùng: No-change: <path> - <lý do ngắn>.
- Sửa tối thiểu dùng: Fix tối thiểu: <path> - <phạm vi ngắn>.
- Không thêm generic system browser, Jira browser, bulk sync hoặc link mutation trong lúc thực thi phase này.
