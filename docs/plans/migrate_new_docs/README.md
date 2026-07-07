# Kế hoạch migrate docs mới

## Mục tiêu

Plan này đưa toàn bộ nguồn tài liệu còn sống từ `docs_legacy/` về hệ `docs/` mới theo hướng B:

- không bê nguyên cây cũ vào cây mới;
- chỉ hấp thụ phần còn là source of truth;
- đặt mỗi nội dung vào đúng vùng `app/`, `theories/`, `meta/`, `app_technical/` hoặc `AGENT_SKILLS/`;
- sau khi hoàn tất, `docs_legacy/` đã bị xóa mà không làm mất tri thức đang dùng.

Kết quả mong muốn:

```text
docs/
→ source of truth duy nhất cho tài liệu sống

docs_legacy/
→ đã bị xóa ở Phase 07; provenance còn trong docs/plans/migrate_new_docs/
```

## Nguyên tắc

- Migrate theo vai trò tri thức, không theo folder cũ.
- Không tạo lại `docs/work` hoặc `docs/architecture` như bản sao của legacy nếu nội dung đã có home tốt hơn trong `docs/app`.
- Không copy nguyên file legacy nếu file đó trộn nhiều lớp knowledge.
- Nội dung principle lặp lại được đi vào `docs/theories`.
- Nội dung app-specific đi vào `docs/app`.
- Nội dung rule cấu trúc tài liệu đi vào `docs/meta`.
- Nội dung template kỹ thuật reusable đi vào `docs/app_technical`.
- Quyết định, trade-off, lý do chọn hướng đi vào `docs/app/10-decisions`.
- Historical migration note chỉ giữ khi nó giúp hiểu vì sao docs hiện tại có hình dạng như vậy.

## Nguồn cần xử lý

| Legacy area | Vai trò hiện tại | Cách xử lý mặc định |
| --- | --- | --- |
| `docs_legacy/work/` | Product truth, Lite scope, implementation plan, API/runtime/config notes | Tách vào `app/01-business`, `app/02-product`, `app/06-technical`, `app/08-quality`, `app/09-operation`, `app/10-decisions` |
| `docs_legacy/architecture/` | Architecture truth cũ, boundary rules, workflow architecture | Hấp thụ vào `app/05-architecture`, `app_technical/custom_modular_monolith`, `theories/modular-architecture`, `theories/governance` |
| `docs_legacy/business/` | Business workflow, rules, states, glossary | Hấp thụ vào `app/01-business`, `app/04-domain`, `app/10-decisions` |
| `docs_legacy/explain/` | Synthesis, reasoning, missing theory analysis | Chuyển phần còn giá trị thành theory governance, decision hoặc archive note trong `app/10-decisions` |
| `docs_legacy/plan/import_theories/` | Migration history cho theory import | Giữ tạm làm historical source, sau đó summarize vào `docs/plans/migrate_new_docs` hoặc `theories/governance` |
| `docs_legacy/explain_b2j/` | Bối cảnh legacy `backlog2jira` | Mặc định bỏ, trừ khi có quyết định migration rõ |
| `docs_legacy/server/` | Server notes cũ | Chỉ migrate nếu còn dùng trong runtime/operation hiện tại |

## Phase map

1. [00 - Kiểm kê và chính sách migration](phases/00-inventory-and-policy.md)
2. [01 - Sự thật sản phẩm](phases/01-product-truth.md)
3. [02 - Sự thật kiến trúc](phases/02-architecture-truth.md)
4. [03 - Thực thể nghiệp vụ và luồng công việc](phases/03-business-and-workflow-entities.md)
5. [04 - Kỹ thuật, vận hành và chất lượng](phases/04-technical-operation-quality.md)
6. [05 - Quyết định, quản trị và nguồn gốc](phases/05-decisions-governance-provenance.md)
7. [06 - Sửa tham chiếu và kiểm chứng](phases/06-reference-rewrite-and-validation.md)
8. [07 - Xóa docs_legacy](phases/07-legacy-removal.md)

## Điều phối

Xem [coordination.md](coordination.md) để biết luật chạy phase, checkpoint, cách ghi migration matrix và điều kiện được phép xóa `docs_legacy/`.

Artifact bắt buộc:

- [migration_matrix.md](migration_matrix.md) - sổ cái cấp file/cụm cho toàn bộ nội dung trong `docs_legacy/`.
- [final_migration_report.md](final_migration_report.md) - báo cáo cuối và record cutover sau khi xóa `docs_legacy/`.

Không được coi phase 00 là hoàn tất nếu `migration_matrix.md` chưa có dòng cho mọi file trong `docs_legacy/`.

Không được xóa `docs_legacy/` nếu `final_migration_report.md` chưa được cập nhật từ kết quả thật của phase 00-06.

## Điều kiện hoàn tất

Plan hoàn tất khi:

- `rg "docs_legacy" docs` chỉ còn các reference được phép trong migration plan hoặc final removal record;
- `AGENTS.md` không còn yêu cầu đọc `docs_legacy` cho công việc thường ngày;
- mọi source-of-truth còn sống trong legacy đã có home trong `docs/`;
- mọi file legacy còn lại đã có quyết định trong `migration_matrix.md`;
- `migration_matrix.md` không còn dòng có cột `status` bằng `migrate`, `merge`, `defer`, hoặc `keep-temporary`;
- `final_migration_report.md` đã ghi rõ nhóm nào migrated, merged, superseded, discarded và bằng chứng verification;
- người đọc có thể bắt đầu từ `docs/README.md` và làm việc mà không cần mở `docs_legacy/`;
- `docs_legacy/` đã bị xóa ở Phase 07 sau khi các migration gate pass.
