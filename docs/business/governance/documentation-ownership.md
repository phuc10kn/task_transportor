# Documentation Ownership

## Mục tiêu

Tài liệu business chỉ hữu ích khi mỗi lớp nội dung có người chịu trách nhiệm cập nhật sau mỗi thay đổi sản phẩm hoặc vận hành.

File này mô tả ownership theo lớp tài liệu, không gắn cứng vào tên người cụ thể. Mỗi repo có thể điền owner thật sau.

## Bảng ownership đề xuất

| Lớp tài liệu | Nội dung quản lý | Owner chính đề xuất | Reviewer thường gặp | Khi nào bắt buộc cập nhật |
| --- | --- | --- | --- | --- |
| `overview/` | phạm vi sản phẩm, actor, mô hình vận hành | product owner hoặc business lead | tech lead, ops lead | đổi scope MVP, đổi actor, đổi hướng sản phẩm |
| `usecases/` | outcome business theo nhóm tác vụ | product owner | ops lead, tech lead | thêm use case mới, bỏ use case cũ, đổi kỳ vọng đầu ra |
| `workflows/` | quy trình vận hành hiện tại | ops lead | product owner, tech lead | đổi bước thao tác, đổi cổng approve, đổi người xử lý |
| `rules/` | điều kiện block, retry, exception | ops lead hoặc policy owner | tech lead | đổi policy duyệt, đổi rule retry, đổi ngưỡng anomaly |
| `states/` | lifecycle của issue, translation, sync job | tech lead hoặc domain owner | ops lead | thêm trạng thái mới, đổi nghĩa trạng thái |
| `entities/` | object business và dữ liệu cần quản lý | domain owner | product owner, tech lead | đổi object vận hành, đổi dữ liệu tối thiểu cần theo dõi |
| `integrations/` | vai trò business của Backlog, Jira, CIS | integration owner | tech lead, product owner | đổi phạm vi tích hợp, đổi contract vận hành |
| `decisions/` | quyết định business đã chốt | product owner | tech lead, ops lead | có quyết định mới ảnh hưởng hành vi hoặc policy |
| `examples/` | ví dụ chuẩn để onboarding và review | ops lead | product owner | xuất hiện case mới tiêu biểu hoặc case cũ không còn đúng |
| `governance/` | cách quản lý bộ docs | doc owner hoặc repo maintainer | product owner, tech lead | đổi quy trình review docs hoặc ownership |

## Cách áp dụng cho repo hiện tại

- Repo hiện tại nên xem `docs/business/*` là source of truth ở tầng nghiệp vụ.
- Khi cập nhật `docs/work/*` hoặc `docs/architecture/*` làm thay đổi hành vi vận hành, cần kiểm tra xem có file business nào bị cũ theo hay không.
- Nếu một thay đổi ảnh hưởng actor, workflow và rule cùng lúc, nên cập nhật cả ba lớp trong cùng một lượt để tránh lệch nghĩa.

## Bảng kiểm nhanh theo pull request

| Tình huống thay đổi | Cần rà soát docs business nào |
| --- | --- |
| thêm nguồn ingest mới | `overview/`, `usecases/`, `workflows/`, `integrations/`, `rules/` |
| đổi cổng duyệt translation hoặc mapping | `usecases/`, `workflows/`, `rules/`, `states/` |
| thêm outbound target mới | `overview/`, `usecases/`, `integrations/`, `examples/` |
| đổi lifecycle issue hoặc sync job | `states/`, `entities/`, `workflows/` |
| đổi màn hình vận hành nhưng không đổi business outcome | chủ yếu `workflows/`, có thể `examples/` |
