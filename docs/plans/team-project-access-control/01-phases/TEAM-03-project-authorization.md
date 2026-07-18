# TEAM-03 - Project authorization

## Mục tiêu

- Chỉ Team member được list/open/làm việc với Project.

## Artifact mục tiêu

- Project application use cases và controllers
- Project workspace middleware trong `src/app.js`
- Project isolation tests

## Điều kiện mở phase

- TEAM-02 pass.
- Permission matrix trong overview chưa thay đổi.

## Công việc

- Filter Project list theo current-user membership.
- Project show/workspace trả 404 cho outsider.
- Member được dùng data-plane; lead quản lý Team; owner quản lý Project config/lifecycle.
- Inventory và áp shared membership middleware cho mọi `/api/v1/projects/:projectId/**` route: Project actions/config, Dashboard, Backlog/attachment, Jira, issue, mapping, anomaly, translation, sync và journal.
- Giữ worker/internal integration trên trusted service path riêng.

## Checklist nghiệm thu

- [x] Outsider và system-admin-nonmember không thấy Project hoặc tạo side effect.
- [x] Member làm việc được nhưng không sửa Project config.
- [x] Lead/owner permissions đúng matrix.
- [x] Direct URL/API không bypass membership.
- [x] Static route inventory không còn Project-scoped public router thiếu shared membership middleware.
- [x] Worker regression pass mà không giả user.

## Kết quả thực hiện
