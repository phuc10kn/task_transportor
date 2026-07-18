# Điều phối plan Team và Project access

## Trạng thái

Đã triển khai đủ scope TEAM-01 đến TEAM-04. `npm test`, `npm run admin:ci` và `npm run verify:admin-ui-e2e` đã pass ngày 2026-07-18.

## Dependency

- Chỉ bắt đầu TEAM-01 sau khi plan Auth đã có `users`, `req.user` và system role ổn định.
- Team plan không sửa password, Google login hoặc JWT semantics.
- Projects module dùng public Auth API để lookup user.

## Thứ tự

1. TEAM-01: schema/backfill.
2. TEAM-02: Project creation và Team management.
3. TEAM-03: authorization mọi Project path.
4. TEAM-04: UI, regression và docs.

## Điểm cần user review khi hoàn tất

- Create Project tự tạo Team; creator là owner + lead.
- Mọi enabled user tạo được Project; CLI/import cũng phải chỉ rõ creator.
- Lead add/remove/change member được.
- Member làm việc được; outsider và system-admin-nonmember bị từ chối.
- Project list và direct URL đều không lộ Project ngoài Team.

## Quy tắc mở rộng scope

Shared Team, owner transfer, invitation, custom role hoặc organization hierarchy chỉ được thêm bằng yêu cầu/decision mới.
