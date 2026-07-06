# Use Case - Issue Preparation

## Mục tiêu

Chuẩn bị issue trong CIS ở trạng thái đủ rõ để có thể preview hoặc sync ra Jira.

## Bao gồm

- Tạo và review bản dịch.
- Review và approve mapping.
- Xem và xử lý anomaly.
- Chỉnh canonical issue trong CIS.

## Actor chính

- `Admin vận hành`

## Đầu vào nghiệp vụ

- Issue đã có mặt trong CIS.
- Có thể còn translation draft, missing mapping hoặc anomaly open.

## Kết quả thành công

- Dữ liệu issue đã được chuẩn hóa.
- Các block như missing mapping hoặc anomaly đã có quyết định rõ.

## Điều kiện hoàn tất

- Canonical issue đủ rõ để build preview Jira.
- Những quyết định review cần thiết đã được thực hiện.

## Điểm cần lưu ý

- Chuẩn bị issue là một use case trung gian quan trọng.
- Đây là nơi business quality được quyết định trước outbound.
- Không phải mọi issue đều cần translation, nhưng mọi issue cần đủ rõ về mặt canonical data.

## Workflow liên quan

- [../workflows/translation-review.md](../workflows/translation-review.md)
- [../workflows/mapping-approval.md](../workflows/mapping-approval.md)
- [../workflows/anomaly-handling.md](../workflows/anomaly-handling.md)
- [../workflows/issue-preparation-for-jira.md](../workflows/issue-preparation-for-jira.md)
