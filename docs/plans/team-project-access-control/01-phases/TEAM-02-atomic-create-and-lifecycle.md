# TEAM-02 - Project create và Team management

## Mục tiêu

- Tạo Project/Team/owner/lead atomically và cung cấp member management tối thiểu.

## Artifact mục tiêu

- `src/modules/Projects/application/`
- `src/modules/Projects/infrastructure/ProjectRepository.js`
- `src/modules/Projects/ProjectsApi.js`
- Project/Team lifecycle tests

## Điều kiện mở phase

- TEAM-01 pass.
- Auth public API lookup user đã sẵn sàng.

## Công việc

- Mọi enabled user được tạo Project. HTTP lấy actor từ `req.user`; CLI/import bắt buộc truyền `creator_email` của existing enabled user.
- Trong cùng transaction tạo Team, lead membership và Project owner.
- Rollback sạch nếu bất kỳ bước nào lỗi.
- Thêm Team show, add member bằng exact email, remove member và change `lead`/`member`.
- Lookup enabled user qua public Auth API, không query Auth repository trực tiếp.
- Không cho remove/demote Project owner.
- Delete Project và dedicated Team/members trong cùng transaction.

## Checklist nghiệm thu

- [x] Creator trở thành owner + lead và không có orphan row.
- [x] Add/remove/change role hoạt động đúng cho lead.
- [x] Duplicate member và invalid user trả lỗi rõ.
- [x] Owner không thể bị remove/demote.
- [x] HTTP/CLI/import đều yêu cầu creator; delete không để Team/member orphan.
- [x] Auth boundary và transaction rollback tests pass.

## Kết quả thực hiện
