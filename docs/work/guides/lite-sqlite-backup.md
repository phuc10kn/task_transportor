# Backup SQLite Lite

Lite dùng SQLite tại đường dẫn `DATABASE_PATH`, mặc định:

```text
storage/db/cis.sqlite
```

## Backup thủ công an toàn

1. Dừng server hoặc đảm bảo không có worker/API đang ghi dữ liệu.
2. Tạo thư mục backup nếu chưa có:

```bash
mkdir -p storage/backups
```

3. Copy file database sang backup có timestamp:

```bash
cp storage/db/cis.sqlite storage/backups/cis-YYYYMMDD-HHMMSS.sqlite
```

Trên Windows PowerShell:

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item storage/db/cis.sqlite "storage/backups/cis-$stamp.sqlite"
```

4. Nếu cần backup attachments, copy thêm:

```text
storage/attachments/
```

## Restore

1. Dừng server/worker.
2. Đổi tên database hiện tại để giữ lại bản cũ.
3. Copy file backup về đúng `DATABASE_PATH`.
4. Start server và kiểm tra `/health`, `/admin/`, dashboard counts.

Không commit file backup SQLite hoặc attachment thật vào repository.
