# Hướng dẫn demo Lite

## Chuẩn bị

1. Cài dependency:

```bash
npm install
```

2. Tạo `.env` local với các biến tối thiểu:

```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=storage/db/cis.sqlite
STORAGE_ROOT=storage
ATTACHMENT_STORAGE_PATH=storage/attachments
JWT_SECRET=local-development-jwt-secret
ADMIN_EMAIL=admin@example.test
ADMIN_PASSWORD=change-me-local
```

3. Chạy migrate và bootstrap admin:

```bash
npm run migrate
npm run admin:create
```

4. Start API server:

```bash
npm start
```

API chạy tại:

```text
http://localhost:3000
```

5. Start FE Admin UI ở terminal khác:

```bash
npm run fe:start
```

Admin UI chạy tại:

```text
http://localhost:8000/admin/
```

## Luồng demo end-to-end

1. Login bằng admin bootstrap.
2. Vào `Projects`, tạo hoặc chỉnh project config. Chỉ lưu tên biến môi trường credential, không nhập secret thật.
3. Bật `sync_enabled` nếu muốn worker xử lý outbound.
4. Dùng `Pull issue` để enqueue job Backlog -> CIS. `Pull whole project` trong Project Config đang disable ở FE.
5. Chạy worker một lượt nếu không bật worker nền:

```bash
npm run sync:worker-once
```

6. Vào `Issues`, mở issue vừa pull. Nút `Open` đi thẳng vào `Issue Editor`.
7. Nếu cần translation, bấm `Translations` trong Issue Editor. Modal cho phép translate/retranslate, edit text, `Approve + save` và reject cho `Summary translation`/`Description translation`.
8. Vào `Mappings`, tạo và approve mapping bắt buộc: `issue_type`, `status`, `priority`.
9. Quay lại Issue Editor, bấm `Jira sync`. Modal tự chạy dry-run, hiển thị `can_sync`, warnings và payload preview.
10. Nếu cần, sửa payload trong modal. Khi dry-run pass, bấm `Sync Jira`.
11. Vào `Sync Jobs` và `Journal` để kiểm tra job, retry/cancel khi cần.
12. Vào `Anomalies` để resolve/ignore anomaly đã xử lý.
13. Đối chiếu `Dashboard` với dữ liệu hiện có: review queue nếu bật translation, pending mapping, failed jobs, open anomalies.

## Verify tự động phase 07

```bash
npm run verify:phase07
```

Lệnh này smoke Admin UI static, login, project config API, issue list/editor, translation modal, Jira sync modal, jobs/journal/anomaly và dashboard counts bằng fixture SQLite tạm.
