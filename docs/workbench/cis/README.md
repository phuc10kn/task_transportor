# CIS Workbench

> STATUS: CHƯA ĐƯỢC ĐI VÀO HOẠT ĐỘNG.

`docs/workbench/cis/` là khu vực dự kiến để làm việc với ý tưởng và quan sát liên quan đến Central Issue Store/Central Sync Hub trước khi chúng được chuyển thành entity/relation canonical.

Hiện tại folder này chỉ ghi **ý định thiết kế**. Không tạo work item thật, không lưu app truth và không dùng làm input cho implementation.

## Mục Tiêu Dự Kiến

Sau khi `docs/guide` có harness đầy đủ, CIS workbench có thể dùng để model hóa candidate quanh:

- canonical issue;
- source snapshot;
- sync job;
- sync journal;
- translation review;
- mapping approval;
- anomaly;
- Jira dry-run preview;
- project integration config;
- attachment lifecycle.

## Ranh Giới

| Nội dung | Home đúng |
| --- | --- |
| Truth hiện hành của CIS | `docs/app/` |
| Entity type/relation/schema canonical | `docs/meta/` |
| Cách dùng workbench | `docs/guide/` sau khi harness được kích hoạt |
| Candidate tạm thời | Chưa có home đang hoạt động trong docs |

## Planned Lifecycle

```text
intake
-> modeling
-> review
-> promoted | rejected
```

Lifecycle này **chưa có hiệu lực**. Khi cần ghi uncertainty trước khi workbench được kích hoạt, dùng `NOTE-OPEN` trong file canonical gần nhất hoặc giữ ngoài docs cho tới khi đủ điều kiện promote.
