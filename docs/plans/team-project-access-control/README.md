# Plan: Team và Project access control

## Mục tiêu

Mỗi Project có một Team; creator là Project owner và Team lead; chỉ user thuộc Team mới được làm việc với Project.

## Trong scope

- Team role `lead`, `member`.
- Mỗi Project thuộc đúng một Team và có một owner.
- Mọi enabled user được tạo Project; hệ thống tự tạo Team và creator đồng thời là owner + lead.
- Lead thêm existing user bằng exact email và quản lý thành viên; owner quản lý Project.
- Project list/workspace chỉ cho enabled Team member.
- Migration Project hiện tại, Admin UI, tests và docs.

## Ngoài scope

- Team dùng chung cho nhiều Project hoặc chọn Team khi tạo Project.
- Invitation/pending member, custom role và organization hierarchy.
- Owner transfer, system-admin bypass và tự hủy job khi user rời Team.
- Production rollout/runbook riêng.

Identity, password/Google login và system role thuộc plan prerequisite [google-oauth-user-login](../google-oauth-user-login/README.md).

## Baseline trước triển khai

- `projects` chưa có Team hoặc owner.
- Authenticated user hiện có thể list/open mọi Project.
- Project creation chưa nhận actor và chưa tạo access state.

Chi tiết contract nằm tại [00-overview.md](./00-overview.md).

## Phase triển khai

| Thứ tự | Phase | Kết quả |
| ---: | --- | --- |
| 1 | [TEAM-01 - Schema và backfill](./01-phases/TEAM-01-schema-and-backfill.md) | Team/membership/owner state tồn tại |
| 2 | [TEAM-02 - Project create và Team management](./01-phases/TEAM-02-atomic-create-and-lifecycle.md) | Creator thành owner/lead; lead quản lý member |
| 3 | [TEAM-03 - Project authorization](./01-phases/TEAM-03-project-authorization.md) | List/workspace enforce membership |
| 4 | [TEAM-04 - Admin UI, test và docs](./01-phases/TEAM-04-admin-ui.md) | Team UI và regression hoàn chỉnh |

## Checklist hoàn thành

- [x] Mỗi Project có đúng một Team và owner.
- [x] Creator là owner + lead trong cùng transaction.
- [x] HTTP/CLI/import tạo Project đều có creator rõ ràng.
- [x] Member làm việc được; outsider không thấy hoặc thao tác Project.
- [x] System admin không tự bypass Team membership.
- [x] Legacy Project được backfill không orphan.
- [x] API/UI/tests/docs pass.

## Điều phối

Trạng thái và bằng chứng verify nằm tại [02-coordination.md](./02-coordination.md).
