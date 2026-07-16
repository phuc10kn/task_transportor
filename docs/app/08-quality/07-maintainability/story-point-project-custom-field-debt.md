# Nợ kỹ thuật — Story Point phải là Project Custom Field

> Ngày ghi nhận: 2026-07-16  
> Trạng thái: Accepted technical debt — chưa triển khai  
> Phạm vi tương lai: CIS data model + Jira field discovery + Mappings Backend/Frontend

## Hiện trạng tạo ra nợ

Implementation hiện tại đang coi `story_point` là một canonical field cố định của CIS, có default `1`, tham gia canonical hash và map trực tiếp WEC1 Task sang Jira `customfield_10038`.

Mô hình này không đúng với target domain vì Story Point là Jira custom field phụ thuộc từng Project, không phải canonical field chung cho mọi CIS issue/project.

## Target cần triển khai sau

- Story Point phải được biểu diễn bằng custom-field definition/value thuộc từng CIS Project, không nằm trong danh sách canonical field cố định.
- Màn Mappings phải hiển thị và cho map custom field của CIS với custom field tương ứng bên Jira.
- Action `Pull Jira fields` phải dùng Jira GET metadata để pull thêm custom fields áp dụng cho Project/issue type, tối thiểu gồm `id`, `name`, schema/type, required state, allowed operation và applicability.
- Snapshot custom field đã pull phải được lưu theo Project; outbound Jira resolve field ID từ snapshot/mapping này, không hard-code `customfield_10038` hoặc site/project cụ thể trong business flow.
- Default `1`, nếu vẫn cần, phải là default value của Project custom-field configuration/mapping, không phải global canonical default.
- Cần migration/compatibility plan cho dữ liệu `fields_json.story_point` hiện có trước khi xóa canonical implementation.

## Acceptance cho lần xử lý nợ

- `Pull Jira fields` của WEC1 discover được `customfield_10038` — `Story Points` và lưu vào Project field catalog.
- Mappings UI hiển thị custom field này và lưu mapping tại đúng row, không reload màn hoặc ảnh hưởng draft row khác.
- Jira dry-run/worker lấy field ID từ Project mapping/catalog và gửi đúng numeric value.
- Project không có field hoặc issue type không áp dụng field sẽ không nhận Story Point trong Jira payload và có evidence rõ trên dry-run.
- Canonical field list/hash/editor không còn hard-code `story_point` sau khi migration hoàn tất.

## Ngoài lượt ghi nhận này

Không thay đổi code, schema, API, UI, test hoặc dữ liệu Jira trong lượt này.
