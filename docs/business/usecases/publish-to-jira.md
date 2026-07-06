# Use Case - Publish To Jira

## Mục tiêu

Preview và đẩy issue từ CIS sang Jira theo một đường outbound có kiểm soát.

## Bao gồm

- Xem trước sync Jira.
- Sync issue sang Jira.

## Actor chính

- `Admin vận hành`

## Đầu vào nghiệp vụ

- Issue đã được chuẩn bị trong CIS.
- Dry-run có thể chạy.
- Điều kiện sync không còn bị block.

## Kết quả thành công

- Admin biết issue đã đủ điều kiện sync chưa.
- Jira nhận issue create hoặc update thành công khi publish thật.

## Điều kiện hoàn tất

- Preview phản ánh đúng dữ liệu sẽ publish.
- Nếu sync thật được thực hiện, CIS ghi nhận được kết quả mới nhất.

## Điểm cần lưu ý

- Preview và publish là hai use case liên quan nhưng không đồng nhất.
- Không được xem preview pass là tự động publish luôn.
- Sync thành công phải được phản ánh ngược về CIS để business còn theo dõi được.

## Workflow liên quan

- [../workflows/jira-sync-preview.md](../workflows/jira-sync-preview.md)
- [../workflows/jira-sync-publish.md](../workflows/jira-sync-publish.md)
