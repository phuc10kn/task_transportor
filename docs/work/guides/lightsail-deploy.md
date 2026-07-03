# Deploy Lite lên AWS Lightsail

## Mục tiêu

Chạy `task_transportor` trên Lightsail tách khỏi app/repo khác trong cùng instance:

- API: `http://<public-ip>:3001`
- Admin UI: `http://<public-ip>:8001/admin/`
- Thư mục app: `/var/www/task_transportor/app`
- Runtime data: `/var/www/task_transportor/storage`

Không dùng chung thư mục, process manager, deploy script hoặc nginx config của app khác trên server.

## Biến môi trường chính

File production `.env` nằm tại:

```text
/var/www/task_transportor/app/.env
```

Các port bắt buộc cho cấu hình này:

```env
NODE_ENV=production
PORT=3001
API_PORT=3001
FE_PORT=8001
DATABASE_PATH=/var/www/task_transportor/storage/db/cis.sqlite
STORAGE_ROOT=/var/www/task_transportor/storage
ATTACHMENT_STORAGE_PATH=/var/www/task_transportor/storage/attachments
```

`JWT_SECRET`, `ADMIN_PASSWORD`, Backlog/Jira token và credential thật không được commit. Admin bootstrap credential trên server nên lưu file riêng quyền `600`, ví dụ:

```text
/home/ubuntu/task_transportor-admin-login.txt
```

## systemd services

Hai service riêng:

```text
task-transportor-api.service
task-transportor-admin-ui.service
```

Lệnh vận hành:

```bash
sudo systemctl status task-transportor-api task-transportor-admin-ui
sudo systemctl restart task-transportor-api task-transportor-admin-ui
journalctl -u task-transportor-api -n 100 --no-pager
journalctl -u task-transportor-admin-ui -n 100 --no-pager
```

## Smoke test

Chạy từ trong instance:

```bash
curl -fsS http://127.0.0.1:3001/api/v1/health
curl -fsSI http://127.0.0.1:8001/admin/
```

Nếu test nội bộ pass nhưng truy cập public IP bị timeout, kiểm tra Lightsail Networking firewall và mở TCP `3001`, `8001`.
