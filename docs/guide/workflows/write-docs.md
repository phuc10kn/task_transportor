# Write Docs

## Bước 1: phân loại knowledge

| Knowledge | Home |
| --- | --- |
| App-specific behavior/scope/rule | `docs/app/` |
| Documentation schema/rule/convention | `docs/meta/` |
| Reusable reasoning principle | `docs/theories/` |
| Reusable technical taxonomy/template | `docs/app_technical/` |
| Long-term choice/trade-off | `docs/app/10-decisions/` |
| Candidate/chưa chắc | `docs/backlog-theories/` |

Sau khi xác định home là `docs/app/`, chọn layer, concern và entity type theo:

```text
docs/guide/reference/folder-structure.md
```

Không dùng tên concern rút gọn nếu đang viết path. Path chuẩn có prefix số như `01-business/04-behavior/01-processes/`.

## Bước 2: sửa file hiện có trước

Không tạo file mới nếu nội dung vẫn cùng chủ đề với file hiện có.

Ví dụ:

```text
Dry-run Jira requirement
```

thường nên cập nhật `docs/app/02-product`, `docs/app/05-architecture`, hoặc `docs/app/08-quality`, không tạo một file lẻ nếu chưa có entity rõ.

## Bước 3: kiểm tra boundary

Không đưa:

- code/schema/API detail vào business layer;
- app-specific detail vào pure theory;
- candidate relation vào app docs như relation canonical;
- decision rationale dài vào implementation file.

## Bước 4: ghi uncertainty rõ

Nếu chưa chắc:

```text
NOTE-OPEN
NOTE-CANDIDATE
NOTE-CONFLICT
NOTE-DECISION
NOTE-THEORY
```

Hoặc đưa vào `docs/backlog-theories/`.
