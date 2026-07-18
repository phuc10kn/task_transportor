# TEAM-01 - Schema và backfill

## Mục tiêu

- Tạo Team/membership/owner state và migrate Project hiện tại an toàn.

## Artifact mục tiêu

- Migration mới dưới `src/db/migrations/`
- Projects repositories cho Team/membership
- Fresh/upgraded DB tests

## Điều kiện mở phase

- Plan Auth đã hoàn thành user foundation.
- Đã inventory schema/foreign key liên quan Project.

## Công việc

- Thêm `teams`, `team_members`, `projects.team_id`, `projects.owner_user_id` và constraints.
- Backfill một Team cho mỗi Project, enabled user ID thấp nhất làm owner, mọi enabled user làm lead.
- Dừng trước mutation nếu có Project nhưng không có enabled user.
- Bảo đảm owner là lead của đúng Team và không để Project/Team orphan.
- Rehearse fresh DB, upgraded DB và `PRAGMA foreign_key_check`.

## Checklist nghiệm thu

- [x] Fresh/upgraded migration pass và foreign key sạch.
- [x] Mỗi legacy Project có đúng một Team và owner.
- [x] Owner là lead; disabled user không được backfill.
- [x] Invalid legacy state fail trước mutation.

## Kết quả thực hiện
