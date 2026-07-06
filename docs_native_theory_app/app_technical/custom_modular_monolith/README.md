# Custom Modular Monolith App Templates

Folder này chứa template entity-type riêng cho app dùng pattern `custom_modular_monolith`.

Nó không thay thế:

- `meta/01-entity-types/` là meta canonical chung của nền tài liệu;
- `app/*` là app docs thật của từng dự án;
- `theories/*` là pure theory.

Vai trò của folder này là:

- đề xuất entity-type thực dụng cho các layer `05-architecture` đến `09-operation`;
- giúp một app theo `custom_modular_monolith` có điểm bắt đầu rõ ràng khi `app/*` chưa có entity-type riêng;
- tách riêng template app-specific khỏi meta chung của toàn nền.

## Cách dùng

1. Đọc entity-type definition phù hợp trong folder này.
2. Chọn entity type thật sự cần cho app hiện tại.
3. Tạo folder entity type tương ứng trong `app/*` của app đó.
4. Tạo entity instance thật bằng `README.md`.
5. Chỉ đưa vào app các entity type có giá trị knowledge thật, không copy toàn bộ template nếu app không cần.

## Phạm vi

Folder này hiện bao phủ:

- `05-architecture`
- `06-technical`
- `07-implementation`
- `08-quality`
- `09-operation`

## Ghi chú

- Đây là template riêng cho pattern `custom_modular_monolith`, không phải rule bắt buộc cho mọi app.
- Tên folder vẫn dùng `kebab-case`.
- File entity type dùng định dạng giống `meta/01-entity-types/*`.
