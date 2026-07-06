# Integration - Jira

Jira hiện là đích outbound chính.

Business dùng Jira để:

- preview payload target;
- create hoặc update issue sau khi đã review trong CIS;
- theo dõi kết quả publish ra hệ đích.

## Vai trò business

- Là nơi nhận dữ liệu đã được chuẩn bị và kiểm soát trong CIS.
- Là target quan trọng cần được bảo vệ bằng sync gate, dry-run và anomaly handling.

## Điều cần lưu ý

- Jira không nên bị ghi dữ liệu “thử vận may”.
- Preview pass là điều kiện gần cần thiết, nhưng publish thật vẫn là một quyết định riêng.
