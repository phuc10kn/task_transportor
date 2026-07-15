# MUI-16 — Legacy removal và release docs

## Mục tiêu

Sau HG-07, xóa UI legacy trong source, chuyển quality gate sang Next behavior hoàn toàn và đồng bộ tracked docs/runbook; chưa deploy production.

## Artifact mục tiêu

- `public/admin`, `scripts/serve-admin-ui.js` và Express `/admin` static mount bị xóa.
- Root frontend scripts chỉ trỏ `apps/admin-web`; phase07 không còn legacy source regex.
- `docs/app/03-interface`, `06-technical`, `07-implementation`, `08-quality`, `09-operation` mô tả topology thật; `docs/app/09-operation/README.md` là deployment runbook canonical được track.
- Clean release-ready tree và full gate evidence.

## Điều kiện mở phase

- HG-07 được xác nhận rõ.
- Target branch/deploy scope/release mechanism xác nhận; không có unrelated dirty changes trong cleanup scope.
- Production runtime vẫn đạt locked versions.

## Công việc

- Xóa `public/admin`, `scripts/serve-admin-ui.js`, Express static `/admin` mount và unused imports.
- Thay `fe:start`/`admin:ui` bằng Next commands; không giữ fallback/alias/compatibility server.
- Xóa source-regex legacy acceptance; giữ API regression và Next Playwright behavior tests.
- Search application/runtime/test và `docs/app`; `/admin`, `/admin/app.js`, `serve-admin-ui`, `public/admin` references phải bằng 0. `docs/plans/**` bị loại khỏi lệnh search vì chỉ là planning history.
- Cập nhật tracked interface/technical/implementation/quality/operation docs và frontend install/build/start commands. Nếu ignored `server.md` tồn tại trong workspace, bắt buộc sync nó thành local mirror có link về canonical tracked runbook; file này không được là release evidence duy nhất.
- Recheck exact Next/React security status.
- Clean environment chạy root/frontend install, tests, docs verify, boundary search và `git diff --check`.
- Local production start smoke: root/login/protected/API rewrite pass; legacy URLs 404.
- Không sửa business API/module/schema trong cleanup.

## Checklist nghiệm thu

- [x] Legacy files/static mount/server và source-regex acceptance đã bị xóa.
- [x] Runtime/test legacy references bằng 0.
- [x] Tracked docs/runbook mô tả đủ Next topology và commands.
- [x] `docs/app/09-operation/README.md` chứa deploy/cutover commands canonical; ignored `server.md` không phải evidence duy nhất.
- [x] `server.md` local đã được sync về topology Next hiện tại nếu file tồn tại; không còn hướng dẫn static `/admin` cũ.
- [x] Clean full automated gate pass sau cleanup.
- [x] Local root/login/protected/API rewrite pass; legacy URLs 404.
- [x] Tree release-ready sạch; chưa deploy production.
- [x] Unit test check (Agent).

## Kết quả thực hiện

Fix tối thiểu: MUI-16 - xóa `public/admin`, static Express mount và static server; root chỉ còn command Next. `verify:phase07`, `npm test`, `admin:ci`, `verify:admin-ui-e2e` (39/39), `verify:docs`, `verify:pr-change-manifest`, `git diff --check` và clean root/frontend install độc lập đều pass. Local production `next start` smoke pass root/login/protected/API rewrite; static UI cũ trả 404. `server.md` ignored đã sync làm local mirror của runbook tracked. Chưa tick release-ready: migration đang là working tree chưa commit/clean checkout, nên MUI-17 không được mở và production chưa bị thay đổi.
