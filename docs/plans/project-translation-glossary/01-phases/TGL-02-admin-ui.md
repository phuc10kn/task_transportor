# TGL-02 — Admin UI Translation Glossary

## Mục tiêu

Tạo một màn Translation Glossary làm UI duy nhất cho glossary; Project Config không còn editor hoặc payload glossary.

## Artifact mục tiêu

- `public/admin/app.js`.
- `public/admin/styles.css`.
- `scripts/verify/admin-ui-acceptance.js`.
- `package.json` — verify-only; `verify:phase07` tiếp tục gọi Admin UI acceptance hiện có.

Không tạo fixture UI mới; verifier hiện tại tự dựng Project/API fixture theo pattern đang có.

## Điều kiện mở phase

- TGL-01 pass đầy đủ, gồm `npm test`; không có checkpoint backend trung gian đang mở.
- `npm run verify:phase01` và `npm run verify:phase04` pass sau cutover.
- API/error contract đã ổn định.

## Công việc

1. Thêm nav/screen `Translation Glossary`; giữ `Translations` cho queue review.
2. Bắt buộc chọn Project; chỉ gọi glossary API khi operator vào màn hoặc đổi Project, không preload lúc boot Admin UI.
3. Render compact table với Group, Concept key, Languages, Note, Actions.
4. Thêm filter Group, search và loading/empty/error/retry state.
5. Add/Edit/View bằng modal tái sử dụng pattern `modal-backdrop`/`modal-panel` hiện có; mỗi term dùng text input `language_code` và `term`, cho phép thêm/xóa dòng động.
6. Normalize language code thành normal text lowercase; chỉ chặn rỗng/trùng và giữ input khi API trả `422`/`409`.
7. Delete có confirm và feedback rõ; toast không hiển thị số lượng item.
8. Đảm bảo Project Config không hiển thị hoặc gửi glossary.
9. Mở rộng verifier hiện tại cho navigation, load timing, CRUD, errors, empty/retry và viewport hẹp.

## Checklist nghiệm thu

- [x] Chỉ có một UI quản lý glossary: Translation Glossary.
- [x] Translation Queue vẫn hoạt động độc lập.
- [x] Không gọi glossary API trước khi operator vào màn; đổi Project tải đúng scope.
- [x] Table/filter/search hiển thị đúng Project đã chọn.
- [x] Add/Edit hỗ trợ `ja`, `vi`, `en` và language code động, không hard-code cột ngôn ngữ.
- [x] Add/Edit/View dùng modal hiện có; không triển khai drawer hoặc thêm layout thứ hai.
- [x] Validation/conflict hiển thị rõ và không làm mất form input.
- [x] Delete yêu cầu xác nhận và cập nhật list đúng.
- [x] Project Config không hiển thị/gửi glossary.
- [x] Loading, empty, error, retry và viewport hẹp có automated acceptance.
- [x] `npm run verify:phase07` pass.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Kết quả thực hiện

Fix tối thiểu: `public/admin/app.js`, `public/admin/styles.css`, `scripts/verify/admin-ui-acceptance.js` — thêm màn Translation Glossary lazy-load với project/group/search filter, table, modal CRUD đa ngôn ngữ, validation/error/retry/delete feedback; giữ Translation Queue và Project Config hiện có; `npm run verify:phase07` và `npm test` pass.
