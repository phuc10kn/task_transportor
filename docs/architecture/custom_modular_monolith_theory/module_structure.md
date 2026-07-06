# Module Structure

Chuẩn module generic:

```text
src/modules/<Domain>/
  <Domain>Api.js
  application/
  domain/
  infrastructure/
  support/
  http/
```

## Ý nghĩa

- `<Domain>Api.js`: public boundary.
- `application/`: use case nghiệp vụ.
- `domain/`: rule thuần hoặc model domain nếu đủ phức tạp.
- `infrastructure/`: repository, client, adapter riêng domain.
- `support/`: helper nội bộ của domain.
- `http/`: controller, request, resource của module.

## Quy ước chung

- Module khác không import sâu sang `application/`, `infrastructure/` hoặc `support`.
- Hạ tầng kỹ thuật dùng chung để ở `src/infrastructure`.
- Utility thuần không thuộc domain nào để ở `src/shared`.

Module map cụ thể của từng repo phải nằm trong architecture guide của repo đó.
