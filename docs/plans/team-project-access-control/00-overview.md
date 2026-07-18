# Overview: Team và Project access

## Quyết định chức năng

- Mỗi Project có đúng một Team; Team đó chỉ thuộc Project này.
- Một user có thể thuộc nhiều Team.
- Team role chỉ có `lead` và `member`.
- Mọi authenticated enabled user được tạo Project.
- Project creator là `owner_user_id` và có membership `lead`.
- Team member enabled được list/open/làm việc với Project.
- Team lead được add/remove member và đổi `member`/`lead`.
- Project owner được sửa config hoặc disable/delete Project.
- System role không tự cấp Project access; kể cả `system_admin` vẫn phải là Team member.
- Owner không được remove/demote trong scope này. Owner transfer để phase sau khi có yêu cầu.
- Plan Auth hiện không thêm user-disable mutation; nếu bổ sung disable sau này thì phải thiết kế owner transfer/recovery cùng lúc.

## Data tối thiểu

```text
teams
  id
  name
  created_at
  updated_at

team_members
  team_id
  user_id
  role CHECK(lead|member)
  PRIMARY KEY(team_id, user_id)

projects
  team_id UNIQUE NOT NULL
  owner_user_id NOT NULL
```

Projects module sở hữu Team state vì create Project + Team + owner + lead cần cùng transaction. Không tạo module Teams riêng trong scope hiện tại.

## Permission matrix

| Action | Member | Lead | Owner |
| --- | :---: | :---: | :---: |
| List/open/workspace | Có | Có | Có |
| Xem Team | Có | Có | Có |
| Add/remove/change member role | Không | Có | Có |
| Project config/lifecycle | Không | Không | Có |

Outsider nhận `404 PROJECT_NOT_FOUND` để không lộ Project. Member thiếu quyền quản lý nhận `403 PROJECT_PERMISSION_REQUIRED`.

## Project creation

Trong một transaction:

1. Tạo Team `<Project name> Team`.
2. Thêm creator làm `lead`.
3. Tạo Project với creator là owner và gán Team.
4. Rollback tất cả nếu một bước lỗi.

Request body không được truyền `team_id` hoặc `owner_user_id`; HTTP actor lấy từ `req.user`. CLI/import bắt buộc nhận `creator_email` của existing enabled user, không chọn user ngầm.

## Legacy backfill

- Tạo một Team cho mỗi Project hiện tại.
- Chọn enabled user có ID thấp nhất làm owner.
- Thêm mọi enabled user hiện tại làm lead để không mất quyền đang có.
- Dừng migration nếu có Project nhưng không có enabled user.

## API mục tiêu

```http
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:projectId
PATCH  /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId

GET    /api/v1/projects/:projectId/team
POST   /api/v1/projects/:projectId/team/members
PATCH  /api/v1/projects/:projectId/team/members/:userId
DELETE /api/v1/projects/:projectId/team/members/:userId
```

- Project list được filter theo membership.
- `POST .../team/members` nhận `{ email }`, resolve exact enabled user qua `AuthApi.resolveEnabledUserByEmail`; không expose global user search cho lead.
- Mọi public route dưới `/api/v1/projects/:projectId/**` dùng shared workspace membership middleware, gồm Project actions/config, Dashboard, Backlog/attachment, Jira, issue, mapping, anomaly, translation, sync và journal.
- Delete Project xóa dedicated Team và memberships trong cùng transaction, không để orphan.
- Worker/internal flow tiếp tục dùng trusted service path, không giả user.
- Member lookup dùng public Auth API, không import Auth repository.

## Admin UI mục tiêu

- Project list chỉ hiển thị Project user được phép mở.
- Create Project giải thích Team được tạo tự động và creator là owner/lead.
- Project Config có Team panel; member read-only, lead có member controls.
- Lead thêm member bằng exact email; UI không cần global user directory.
- Outsider/access-lost được đưa về Project list, không refresh loop.

## Acceptance chính

- Create atomic và migration/backfill có test.
- Outsider không đọc/ghi hoặc tạo side effect.
- Member removal có hiệu lực ở request tiếp theo.
- Owner/lead invariant được bảo vệ.
- Route inventory chứng minh không còn Project-scoped public route thiếu membership middleware.
- HTTP/CLI/import creation đều gắn đúng creator; Project delete không để Team orphan.
- Worker regression pass.
