# Architecture — Central Sync Hub

## Tổng quan

Hub trung gian thay thế mô hình "Codex gọi từng lệnh CLI" hiện tại bằng một **Central Issue Store (CIS)** làm single source of truth, với AI xử lý ở giữa.

```
  ┌──────────┐    ┌──────────┐
  │ Backlog  │    │  Jira    │
  │ (Nguồn)  │    │ (Chính)  │
  └────┬─────┘    └────┬─────┘
       │               │
       ▼               ▼
  ┌─────────────────────────────────────┐
  │         Webhook Layer               │
  │  (Backlog Webhook + Jira Webhook)   │
  └──────────────┬──────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────┐
  │         Central Issue Store         │
  │  ┌────────┐ ┌────────┐ ┌─────────┐ │
  │  │ issues │ │ queue  │ │ journal │ │
  │  └────────┘ └────────┘ └─────────┘ │
  │  ┌────────┐ ┌────────┐             │
  │  │ rules  │ │ drafts │             │
  │  └────────┘ └────────┘             │
  └──────────────┬──────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
  ┌──────────┐    ┌──────────┐
  │ AI Layer │    │ Manual   │
  │ translate│    │ review   │
  │ suggest  │    │ approve  │
  │ detect   │    │ override  │
  └──────────┘    └──────────┘
```

## Nguyên tắc

1. **Jira là nơi làm việc chính** — Dev thao tác trên Jira. Backlog là nguồn yêu cầu từ khách hàng.
2. **Mọi thứ qua CIS** — Backlog và Jira không nói chuyện trực tiếp. CIS là trung gian duy nhất.
3. **Nội dung gốc bất biến** — Backlog content (tiếng Nhật) giữ nguyên trong CIS. Bản dịch là field riêng.
4. **Sync không phá dữ liệu** — Mỗi lần sync là một transaction. Rollback được nếu fail.
5. **AI propose, human decide** — AI dịch khi project bật translation option, suggest mapping, detect bất thường. Quyết định cuối cùng thuộc về người dùng.
6. **System -> CIS -> System** — Mọi dữ liệu đi vào CIS trước bằng webhook hoặc manual pull; translation/review là bước tùy chọn sau ingest, rồi dữ liệu đủ điều kiện mới push ra hệ thống đích.

## 4 luồng chính

| Luồng | Hướng | Trigger | Mô tả |
|-------|-------|---------|-------|
| Backlog → CIS | Inbound | Webhook hoặc manual pull | Issue/comment/attachment mới hoặc cập nhật từ khách hàng Nhật |
| Jira → CIS | Inbound | Webhook hoặc manual pull | Dev thay đổi status, comment, field, attachment |
| CIS → Jira | Outbound | AI review done, manual sync, retry | Issue/comment/attachment đã xử lý + duyệt → push lên Jira |
| CIS → Backlog | Outbound | Manual hoặc rule | Khi cần thông báo lại cho khách hàng |

Trong MVP, ưu tiên 3 luồng: **Backlog → CIS**, **Jira → CIS**, **CIS → Jira**. Luồng **CIS → Backlog** giữ trong thiết kế nhưng để sau MVP.

## So sánh với thiết kế hiện tại

| Khía cạnh | Hiện tại (backlog2jira) | Hub trung gian |
|-----------|------------------------|----------------|
| Hướng | Một chiều B → J | Hai chiều B ↔ J |
| Xử lý | CLI + Codex thủ công | Webhook auto + AI + review |
| State | Mapping log (4 tables) | Issue store (full content) |
| Translation | Trong đầu Codex | CIS giữ bản gốc + bản dịch + review trail |
| Mapping | Config tĩnh | Học dần từ dữ liệu |
| Safety | Guardrails trong CLI | Anomaly detection + approval queue |
