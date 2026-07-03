# Hướng dẫn thao tác server Lightsail

## Mục tiêu

Tài liệu này dành cho Codex khi cần thao tác server AWS Lightsail đang chạy `task_transportor`.

Nguyên tắc quan trọng nhất: server này đã có app/repo khác. Không được làm ảnh hưởng app cũ.

## Thông tin server

- Public IPv4: `13.212.200.234`
- SSH user: `ubuntu`
- SSH key local: `storage/LightsailDefaultKey-ap-southeast-1.pem`
- App `task_transportor`: `/var/www/task_transportor/app`
- Runtime data `task_transportor`: `/var/www/task_transportor/storage`
- App cũ cần tránh đụng: `/var/www/hahahaa`

Kết nối SSH:

```bash
ssh -i ./storage/LightsailDefaultKey-ap-southeast-1.pem ubuntu@13.212.200.234
```

## Port và URL

- API: `http://13.212.200.234:3001`
- API health: `http://13.212.200.234:3001/api/v1/health`
- Admin UI: `http://13.212.200.234:8001/admin/`

Lightsail firewall phải mở TCP `3001` và `8001`.

## Service riêng của task_transportor

Chỉ thao tác các service này khi làm việc với `task_transportor`:

```bash
sudo systemctl status task-transportor-api task-transportor-admin-ui
sudo systemctl restart task-transportor-api task-transportor-admin-ui
sudo systemctl stop task-transportor-api task-transportor-admin-ui
sudo systemctl start task-transportor-api task-transportor-admin-ui
```

Log:

```bash
journalctl -u task-transportor-api -n 100 --no-pager
journalctl -u task-transportor-admin-ui -n 100 --no-pager
```

Không restart/reload các service của app cũ nếu user không yêu cầu rõ:

- `nginx`
- `php8.4-fpm`
- `supervisor`
- `hahahaa-worker:*`

## Quy tắc an toàn

- Không chạy deploy script `/home/ubuntu/deploy-hahahaa.sh`.
- Không chạy `git reset --hard`, `git pull`, `composer`, `php artisan`, `npm`, hoặc migration trong `/var/www/hahahaa`.
- Không sửa nginx config đang phục vụ app cũ nếu chưa có yêu cầu rõ.
- Không in nội dung `.env`, token, password hoặc API key ra phản hồi.
- Không copy `.env` local nguyên xi lên server vì có đường dẫn Windows.
- Khi deploy lại, chỉ dùng thư mục `/var/www/task_transportor`.
- Trước khi đổi port hoặc service, kiểm tra port đang dùng bằng `sudo ss -ltnp`.

## Smoke test

Từ máy local:

```bash
curl http://13.212.200.234:3001/api/v1/health
curl -I http://13.212.200.234:8001/admin/
```

Từ trong server:

```bash
curl -fsS http://127.0.0.1:3001/api/v1/health
curl -fsSI http://127.0.0.1:8001/admin/
```

Kỳ vọng API health:

```json
{"data":{"status":"ok","service":"task_transportor","environment":"production"}}
```

## Admin login

Credential bootstrap admin được lưu riêng trên server:

```bash
cat /home/ubuntu/task_transportor-admin-login.txt
```

File này phải giữ quyền `600`. Không commit, không copy vào docs, không in password trong câu trả lời.

## Cấu hình production

File env production:

```text
/var/www/task_transportor/app/.env
```

Các biến port chính:

```env
NODE_ENV=production
PORT=3001
API_PORT=3001
FE_PORT=8001
DATABASE_PATH=/var/www/task_transportor/storage/db/cis.sqlite
STORAGE_ROOT=/var/www/task_transportor/storage
ATTACHMENT_STORAGE_PATH=/var/www/task_transportor/storage/attachments
```

Nếu cần sửa `.env`, backup trước:

```bash
cp /var/www/task_transportor/app/.env /var/www/task_transportor/app/.env.bak.$(date +%Y%m%d%H%M%S)
chmod 600 /var/www/task_transportor/app/.env
sudo systemctl restart task-transportor-api task-transportor-admin-ui
```

## Deploy lại an toàn

Từ local, tạo archive không chứa secret/runtime data:

```bash
tar -czf task_transportor-deploy.tar.gz \
  --exclude=.git \
  --exclude=node_modules \
  --exclude='./storage' \
  --exclude='./storage/**' \
  --exclude=backlog2jira \
  --exclude=.env \
  --exclude='.codex' \
  .
```

Copy lên server:

```bash
scp -i ./storage/LightsailDefaultKey-ap-southeast-1.pem task_transportor-deploy.tar.gz ubuntu@13.212.200.234:/tmp/task_transportor-deploy.tar.gz
```

Trên server, triển khai vào app mới rồi swap:

```bash
set -euo pipefail
APP_ROOT=/var/www/task_transportor
APP_DIR=$APP_ROOT/app
NEW_DIR=$APP_ROOT/app.new
BACKUP_DIR=$APP_ROOT/app.previous.$(date +%Y%m%d%H%M%S)

rm -rf "$NEW_DIR"
mkdir -p "$NEW_DIR"
tar -xzf /tmp/task_transportor-deploy.tar.gz -C "$NEW_DIR"
cp "$APP_DIR/.env" "$NEW_DIR/.env"
chmod 600 "$NEW_DIR/.env"

cd "$NEW_DIR"
npm ci --omit=dev

mv "$APP_DIR" "$BACKUP_DIR"
mv "$NEW_DIR" "$APP_DIR"

cd "$APP_DIR"
npm run migrate
sudo systemctl restart task-transportor-api task-transportor-admin-ui
```

Sau deploy luôn chạy smoke test.

## Backup dữ liệu

SQLite chính:

```text
/var/www/task_transportor/storage/db/cis.sqlite
```

Backup nhanh:

```bash
mkdir -p /var/www/task_transportor/storage/backups
sqlite3 /var/www/task_transportor/storage/db/cis.sqlite ".backup '/var/www/task_transportor/storage/backups/cis.$(date +%Y%m%d%H%M%S).sqlite'"
```

Nếu `sqlite3` chưa có, dùng bản copy sau khi dừng service API:

```bash
sudo systemctl stop task-transportor-api task-transportor-admin-ui
cp /var/www/task_transportor/storage/db/cis.sqlite /var/www/task_transportor/storage/backups/cis.$(date +%Y%m%d%H%M%S).sqlite
sudo systemctl start task-transportor-api task-transportor-admin-ui
```

## Ghi chú hiện trạng

- Node.js trên server đã có sẵn.
- `pm2` chưa cài và hiện không dùng.
- `task_transportor` đang dùng systemd.
- API và FE đã được verify public sau khi mở firewall.
- Translation provider `codex_exec` cần Codex CLI khả dụng trên server nếu muốn chạy dịch thật bằng Codex.
