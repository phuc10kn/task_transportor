# Phase index

> [← Plan index](../README.md) · [Overview](../00-overview/README.md)

| Phase | Mục tiêu | Điều kiện trước |
| --- | --- | --- |
| BIS-00 | [Khóa baseline, contract và persistence preflight](./BIS-00-baseline-contract-preflight/README.md) | Plan accepted |
| BIS-01 | [Public lookup contract và CIS identity integrity](./BIS-01-public-lookup-and-identity-integrity/README.md) | BIS-00 |
| BIS-02 | [CIS manual create và external identity linking](./BIS-02-manual-create-and-external-linking/README.md) | BIS-01 |
| BIS-03 | [Backlog candidate browse và candidate Sync to CIS](./BIS-03-backlog-candidate-browse-and-sync/README.md) | BIS-02 |
| BIS-04 | [Admin UI integration](./BIS-04-admin-ui-integration/README.md) | BIS-03 |
| BIS-05 | [Documentation, full verification và handoff](./BIS-05-documentation-verification-handoff/README.md) | BIS-04 |

## Execution rule

- Thực thi đúng thứ tự BIS-00 → BIS-05. Phase kế tiếp được mở khi các automated/required gate của phase trước pass thật.
- Mỗi executor đọc toàn bộ phase file, capability contract liên quan và source bắt buộc trong `AGENTS.md`.
- Không tick checklist dựa trên dự đoán.
- `Manual check (Người review)` mặc định là acceptance non-blocking: luôn giữ unchecked khi user chưa xác nhận nhưng không chặn mở phase kế tiếp hoặc hoàn tất implementation. Chỉ blocking khi user/coordinator đánh dấu rõ phase đó cần manual gate trước khi tiếp tục.
- Kết quả canonical ghi tại section `Kết quả thực hiện` của chính phase, sau đó cập nhật [handoff](../02-coordination/01-handoff-and-resume.md).
