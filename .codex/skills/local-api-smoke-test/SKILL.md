---
name: local-api-smoke-test
description: Kiểm thử endpoint API local của task_transportor bằng HTTP request thật thay vì test in-process. Dùng khi user yêu cầu gọi, curl, smoke test, manual verify, hoặc kiểm checklist endpoint local như health check theo phase, 404/error envelope, correlation ID, auth route, hoặc API contract khác trên localhost/127.0.0.1.
---

# Local API Smoke Test

## Workflow

Dùng HTTP thật để gọi server local của `task_transportor`. Khi user yêu cầu kiểm tra kiểu local/manual/curl, không thay bằng import trực tiếp, supertest hoặc gọi handler in-process.

1. Dùng repo root làm working directory.
2. Dùng `http://127.0.0.1:3000` làm base URL mặc định, trừ khi user đưa port khác.
3. Kiểm tra server đã listen chưa trước khi start server mới.
4. Nếu chưa có server listen, start `node src/server.js` ở background và chỉ stop process do skill này tự start.
5. Gọi endpoint bằng HTTP thật.
6. Kiểm tra status code, cấu trúc response body và header quan trọng.
7. Báo lại URL chính xác, status, header liên quan và response body.
8. Không tick item `Manual check` nếu user chưa yêu cầu cập nhật checklist sau khi xem kết quả thật.

## Script

Chạy script đi kèm để kiểm tra HTTP local lặp lại được:

```bash
node .codex/skills/local-api-smoke-test/scripts/local_api_smoke_test.js
```

Check mặc định:

- `GET /api/v1/health` trả `200` với `data.status = "ok"`.
- `GET /api/v1/not-found-check` trả `404` với `error.correlation_id`.
- Header `x-correlation-id` khớp với `error.correlation_id` trong response 404.

Option thường dùng:

```bash
node .codex/skills/local-api-smoke-test/scripts/local_api_smoke_test.js \
  --base-url http://127.0.0.1:3000 \
  --start-command "node src/server.js" \
  --health-path /api/v1/health \
  --missing-path /api/v1/not-found-check
```

## Reporting

Báo kết quả ngắn gọn:

```text
GET http://127.0.0.1:3000/api/v1/health -> 200
Body: {"data":{"status":"ok",...}}

GET http://127.0.0.1:3000/api/v1/not-found-check -> 404
x-correlation-id: req_xxx
Body: {"error":{"code":"NOT_FOUND",...,"correlation_id":"req_xxx"}}
```

Nếu local server có tồn tại nhưng request fail, báo lỗi đó ra. Không âm thầm chuyển sang test in-process.
