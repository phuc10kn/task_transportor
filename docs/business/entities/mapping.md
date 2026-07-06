# Entity - Mapping

## Vai trò

Mapping là lớp rule chuyển giá trị giữa source, canonical CIS và target Jira. Đây là nền tảng để CIS biến dữ liệu nguồn thành dữ liệu outbound nhất quán.

## Business quan tâm điều gì ở Mapping

- Mapping đã được approve hay mới chỉ là gợi ý.
- Mapping thiếu ở cấp field hay ở cấp value cụ thể.
- Mapping có đủ để cho issue đi preview hoặc publish thật chưa.
- Mapping cũ có còn đúng sau khi source thay đổi workflow hoặc taxonomy hay không.

## Tình huống thường gặp

- Source thêm priority mới chưa có mapping.
- Một trạng thái Backlog tương ứng nhiều trạng thái Jira nên cần quyết định business.
- Mapping đủ cho hầu hết issue nhưng fail ở một project đặc thù.

## Liên kết liên quan

- Use case: [../usecases/issue-preparation.md](../usecases/issue-preparation.md)
- Workflow: [../workflows/mapping-approval.md](../workflows/mapping-approval.md)
- Rule: [../rules/sync-gates.md](../rules/sync-gates.md)
