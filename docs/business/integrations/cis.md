# Integration - CIS

CIS là lõi vận hành trung tâm, không chỉ là nơi cache dữ liệu.

Business dùng CIS để:

- review issue;
- giữ canonical data;
- ra quyết định trước khi sync;
- lưu audit, anomaly, mapping và job state.

## Vai trò business

- CIS là nơi đổi dữ liệu nguồn thành dữ liệu vận hành có kiểm soát.
- CIS là nơi đội vận hành thực sự làm việc với issue.
- CIS là nơi kết nối giữa review, preview, publish và recovery.

## Điều cần lưu ý

- Nếu không có CIS, nhiều rule business như dry-run, anomaly handling, retry trace hoặc canonical edit sẽ bị tản mát hoặc khó kiểm soát.
