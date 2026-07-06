# Business Guide

Folder `docs/business` mô tả dự án theo góc nhìn nghiệp vụ và vận hành.

Đây không phải là nơi chốt module, boundary hay flow kỹ thuật. Các nội dung đó nằm ở `docs/architecture/*`.

## Mục tiêu của lớp tài liệu này

- Diễn tả hệ thống bằng ngôn ngữ business.
- Giải thích người vận hành đang làm gì, vì sao làm và kết quả nghiệp vụ là gì.
- Tách riêng business workflow khỏi workflow kỹ thuật.
- Tạo một cấu trúc docs ổn định để quản lý thay đổi lâu dài.

## Thứ tự đọc

1. [overview/README.md](overview/README.md) - bức tranh tổng thể của sản phẩm theo góc nhìn business.
2. [glossary/README.md](glossary/README.md) - từ vựng và ngôn ngữ canonical.
3. [usecases/README.md](usecases/README.md) - các use case nghiệp vụ chính.
4. [workflows/README.md](workflows/README.md) - các workflow vận hành hiện tại.
5. [rules/README.md](rules/README.md) - rule business cho approve, block, retry và exception.
6. [states/README.md](states/README.md) - lifecycle của issue, translation, sync job và anomaly.
7. [entities/README.md](entities/README.md) - các thực thể business chính.
8. [integrations/README.md](integrations/README.md) - vai trò nghiệp vụ của Backlog, Jira và CIS.
9. [decisions/README.md](decisions/README.md) - các quyết định business đã chốt.
10. [governance/README.md](governance/README.md) - cách quản lý, cập nhật và review bộ docs business.
11. [examples/README.md](examples/README.md) - các ví dụ nghiệp vụ tiêu biểu.

## Cấu trúc thư mục

```text
docs/business/
  overview/
  glossary/
  usecases/
  workflows/
  rules/
  states/
  entities/
  integrations/
  decisions/
  governance/
  examples/
```

## Cách dùng bộ docs này để quản lý lâu dài

- `overview/` trả lời sản phẩm này tồn tại để làm gì và ai sử dụng.
- `usecases/` trả lời hệ thống hỗ trợ những outcome business nào.
- `workflows/` trả lời từng actor vận hành theo chuỗi bước nào ở repo hiện tại.
- `rules/` trả lời vì sao một bước được cho qua, bị chặn hoặc cần escalate.
- `states/` trả lời object đang ở đâu trong vòng đời vận hành.
- `entities/` trả lời đội vận hành đang quản lý đối tượng nào và cần quan tâm trường hợp gì.
- `integrations/` trả lời từng hệ thống ngoài đóng vai trò business gì.
- `decisions/` giữ các quyết định đã chốt để không bị trôi vào chat hoặc note tạm.
- `governance/` giữ luật cập nhật docs để repo sau này vẫn dùng cấu trúc này ổn định.

## Quy tắc đặt nội dung vào đúng chỗ

- Nếu nội dung nói về outcome, actor, giá trị hoặc phạm vi sản phẩm, đặt ở `overview/` hoặc `usecases/`.
- Nếu nội dung nói về trình tự thao tác thật của người vận hành ở dự án hiện tại, đặt ở `workflows/`.
- Nếu nội dung nói về điều kiện duyệt, block, retry hoặc exception, đặt ở `rules/`.
- Nếu nội dung nói về lifecycle và trạng thái, đặt ở `states/`.
- Nếu nội dung nói về object vận hành như issue, mapping, anomaly, đặt ở `entities/`.
- Nếu nội dung nói về cách giữ bộ docs luôn đúng, đặt ở `governance/`.

## Ghi chú

- `docs/business/*`: góc nhìn nghiệp vụ.
- `docs/architecture/*`: góc nhìn kiến trúc và implementation.
- `docs/work/*`: spec, phase plan và working notes chi tiết.
- Nếu một nội dung nói về actor, outcome, policy hoặc lifecycle vận hành, ưu tiên đặt ở `docs/business/*`.
