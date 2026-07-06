# Implement Rules

File này là checklist generic khi sửa hoặc thêm code liên quan đến modular monolith.

## Luật bắt buộc

1. Module khác chỉ gọi nhau qua `<Domain>Api.js`.
2. Không import `application/`, `infrastructure/` hoặc `support/` của module khác.
3. Controller chỉ gọi API hoặc use case của module chủ quản route.
4. `<Domain>Api.js` không được thành proxy cho use case thuộc module khác.
5. Cross-module write mặc định bị cấm; phải gọi owner API.
6. Cross-module read chỉ hợp lệ nếu có tier hoặc allowlist rõ.
7. `support/` là private nội bộ module.
8. Không copy business rule sang module khác để né boundary.
9. Pure utility thật sự chung đặt ở `src/shared`.
10. Technical infrastructure dùng chung đặt ở `src/infrastructure`.

## Decision tree

### Đây là use case nghiệp vụ?

Đặt vào:

```text
src/modules/<OwnerDomain>/application/
```

Expose qua:

```text
src/modules/<OwnerDomain>/<OwnerDomain>Api.js
```

### Đây là repository hoặc client riêng domain?

Đặt vào:

```text
src/modules/<OwnerDomain>/infrastructure/
```

### Đây là technical client dùng chung?

Đặt vào:

```text
src/infrastructure/
```

### Đây là helper thuần không thuộc domain?

Đặt vào:

```text
src/shared/
```

## Audit generic

Import boundary:

```powershell
rg -n 'require\("\.\./\.\./[A-Za-z]+/(application|infrastructure|support)|require\("\.\./\.\./\.\./modules/[A-Za-z]+/(application|infrastructure|support)' src\modules -g '*.js'
```

Kết quả phải rỗng.

## Ghi chú

Audit SQL, allowlist thật và naming rule riêng của từng repo phải nằm ở architecture guide của repo đó.
