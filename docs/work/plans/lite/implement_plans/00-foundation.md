# Phase 00 - Foundation

## Mục tiêu

Dựng nền ứng dụng Lite chạy được trước khi có nghiệp vụ: Express CommonJS, config/env, SQLite, migration, storage, error envelope và correlation id.

## Làm trong phase này

- Tạo app skeleton `src/app.js`, `src/server.js`.
- Tạo config loader đọc `.env`, validate core env.
- Tạo SQLite connection bằng `better-sqlite3`.
- Tạo migration runner và command `npm run migrate`.
- Tạo storage bootstrap cho `storage/db`, `storage/attachments`, `storage/backups`, `storage/logs`.
- Tạo middleware correlation id.
- Tạo response/error envelope thống nhất.
- Tạo endpoint health tối thiểu.

## Deliverables

- App entrypoint `src/app.js` và `src/server.js`.
- Config loader và env validation.
- SQLite connection, migration runner và bảng `schema_migrations`.
- Storage bootstrap.
- Middleware correlation id.
- Error/response envelope helper.
- Health endpoint.
- Test script tự động theo capability cho migrate, health và error envelope.

## Chốt chặn

Phase này đạt khi app start được trên máy local, migration chạy idempotent, thiếu env core thì fail fast rõ ràng, và mọi lỗi API trả đúng envelope có `correlation_id`.

Không đi phase 01 nếu:

- App start cần thao tác thủ công ngoài `npm run dev` hoặc `npm start`.
- Migration chạy lần hai bị lỗi.
- Storage không tự tạo.
- Error response chưa theo contract.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] Test script tự động của phase 00 pass, ví dụ `npm run verify:phase00` (alias tới `npm run verify:foundation`).
- [x] Test migrate tạo được SQLite DB và bảng `schema_migrations`.
- [x] Test migrate chạy lần hai vẫn idempotent.
- [x] Test health endpoint trả success envelope.
- [x] Test endpoint không tồn tại trả error envelope có `correlation_id`.
- [x] Test production mode thiếu `JWT_SECRET` thì app fail fast rõ ràng.
- [x] Test storage bootstrap tự tạo đủ thư mục cần thiết.

### Manual check (Người review)

- [x] `npm install` chạy được.
- [x] `npm run migrate` chạy được trên máy local.
- [x] `npm run dev` hoặc `npm start` start server.
- [x] Gọi health endpoint bằng curl/Postman thấy success envelope.
- [x] Gọi endpoint không tồn tại bằng curl/Postman thấy error envelope có `correlation_id`.

## Ghi chú thiết kế

- Chưa tạo business module sâu ở phase này.
- Chưa cần Admin UI.
- Không log secret từ env.
