# Knowledge Boundary

File này định nghĩa ranh giới tri thức của folder `custom_modular_monolith_theory`.

## Những gì thuộc folder này

### 1. Lý thuyết kiến trúc

- Vì sao chọn custom modular monolith.
- Vì sao chưa tách microservice.
- Khi nào strict hơn, khi nào pragmatic hơn.

### 2. Ngôn ngữ module

- Module là gì.
- Public API là gì.
- Owner API là gì.
- `application`, `domain`, `infrastructure`, `support`, `shared` khác nhau thế nào.

### 3. Boundary rules tổng quát

- Import boundary.
- Controller ownership.
- Public API ownership.
- Cross-module write ownership.
- Read tier và allowlist.
- Transaction và error boundary.

### 4. Template và checklist

- Template module.
- Template flow.
- Checklist review hoặc self-audit generic.

## Những gì không thuộc folder này

### 1. Product model riêng của một repo

Ví dụ:

- tên sản phẩm cụ thể;
- tên canonical store cụ thể;
- tên system tích hợp cụ thể;
- phase hoặc roadmap riêng của một repo.

### 2. Module map riêng của một repo

Ví dụ:

- danh sách module thật của repo;
- ownership bảng thật của repo;
- read allowlist thật của repo.

### 3. Endpoint, schema, route compatibility cụ thể

Folder này chỉ nêu pattern. API contract, schema column và compatibility wrapper cụ thể phải sống ở tài liệu kiến trúc của repo đó.

### 4. Cleanup backlog hoặc work item của một repo

Refactor tích hợp, TODO migration hoặc cleanup plan cụ thể phải đặt ở guide kiến trúc của repo đó, không giữ tại đây.

## Nguyên tắc cập nhật

Nếu một thay đổi làm đổi cách hiểu pattern nói chung, cập nhật folder này.

Nếu một thay đổi chỉ nói về cách một repo áp dụng pattern, cập nhật tài liệu kiến trúc của repo đó.
