# MUI-17 — Production atomic cutover

## Mục tiêu

Deploy đúng SHA đã pass, thay duy nhất service UI trên port `8001` sang Next.js và hoàn tất production smoke/HG-08 mà không mở dual UI.

## Artifact mục tiêu

- Production chạy exact release SHA của MUI-16A.
- `task-transportor-admin-ui` chạy Next trên port `8001`; API giữ port `3001`.
- Deployment/service/listener/log evidence và HG-08 confirmation.
- Fresh SQLite backup path/evidence theo operation runbook; không thay đổi hoặc migrate business schema.
- Accepted gap `BE-PROJECT-SCOPE-01/02` vẫn open: Dashboard nav/direct route disabled và không fetch; release không claim project-scoped Dashboard hoặc server isolation. Phase BE sau MUI-17 mới đóng debt.

## Điều kiện mở phase

- MUI-16A pass và HG-07A được xác nhận; tracked updates đã commit và working tree/release checkout sạch.
- Production Node/npm đạt locked versions; API health pass.
- User/operator xác nhận maintenance window và account smoke.
- Current `.env`, SQLite và runtime storage paths được inventory theo canonical tracked `docs/app/09-operation/README.md`, không dựa riêng vào ignored `server.md`.
- Backup destination writable và đủ dung lượng theo current operation runbook.

## Công việc

### Prepare

- Capture `RELEASE_SHA`, checkout/verify đúng SHA trong release directory.
- Cài root/frontend build dependencies, build với server-only API origin và prune production dependencies sau build.
- Chạy temporary foreground smoke trên loopback port riêng, ví dụ `127.0.0.1:18001`; không bind public port, không tạo systemd service thứ hai và phải cleanup PID/listener trước cutover.
- Ghi previous release pointer và current UI unit/environment để recovery khi cutover fail; không chạy previous/new UI song song trên public port.

### Cutover

- Trong maintenance window, dừng current UI và API/internal worker để quiesce SQLite writer; tạo fresh backup vào `storage/backups/cis-YYYYMMDD-HHMMSS.sqlite` và ghi path/checksum.
- Swap release pointer. Không chạy database migration vì plan này không đổi schema.
- Start lại API với nguyên business/runtime config để activate removal của Express legacy `/admin` static mount, rồi start Next UI.
- Cập nhật cùng UI unit: WorkingDirectory `apps/admin-web`, Next start trên `0.0.0.0:8001`, `NODE_ENV=production`, server-only `CIS_API_ORIGIN`.
- Chạy `systemctl daemon-reload`, read back unit, start API/health rồi start UI.
- Xác nhận duy nhất một UI listener trên `8001`.

### Smoke và stop trigger

- Smoke root, login → Projects selection gate, `enabled=false` block, protected deep-link, Dashboard disabled state không phát summary/alerts request, Backlog filter-options/candidate read flow, một CIS Issue read flow và `/api/v1/auth/me` qua rewrite.
- `/admin` và `/admin/app.js` trả 404, không legacy marker.
- Nếu start/health/rewrite/login/critical read/legacy-404/HG-08 fail: stop release mới, restore previous release pointer/unit, daemon-reload và verify service; không hot-fix production.
- Chỉ Complete sau HG-08.

## Checklist nghiệm thu

- [ ] Deploy/build đúng captured `RELEASE_SHA` và locked dependency artifacts.
- [ ] Temporary pre-cutover smoke dùng loopback port riêng và cleanup hoàn toàn.
- [ ] Fresh SQLite backup tồn tại, đọc được và có path/checksum evidence trước release swap.
- [ ] Unit readback/daemon-reload/environment/start command đúng.
- [ ] API `3001` và duy nhất Next listener `8001` healthy.
- [ ] Root/login/Project selection/disabled Project/protected/API rewrite/Dashboard disabled-no-fetch/Backlog read/Issue read smoke pass.
- [ ] Legacy URLs 404; không fallback/alias/dual UI.
- [ ] Service/log/listener/deployed-commit evidence đã ghi.
- [ ] Stop/recovery path sẵn sàng và không hot-fix production.
- [ ] HG-08 được user xác nhận.
- [ ] Manual check (Người review tại HG-08).
- [ ] Unit test check (Agent).

## Kết quả thực hiện
