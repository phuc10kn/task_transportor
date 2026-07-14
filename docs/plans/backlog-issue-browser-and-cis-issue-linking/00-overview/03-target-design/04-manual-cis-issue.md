# 5. Tạo CIS issue thủ công

> [← Thiết kế mục tiêu](./README.md) · [Overview](../README.md) · [Plan index](../../README.md)

Endpoint mới:

~~~text
POST /api/v1/issues
~~~

Request:

~~~json
{
  "project_id": 12,
  "summary": "Nội dung cần xử lý",
  "description": "Tùy chọn",
  "issue_type": "task",
  "priority": "normal",
  "status": "open",
  "assignee": "",
  "due_date": ""
}
~~~

Behavior:

1. Validate project tồn tại; project disabled vẫn được tạo draft CIS issue nhưng outbound gate tiếp tục block. Trim summary và reject khi rỗng. Optional select/user/date field rỗng được normalize thành null và không materialize branch rỗng; description giữ nguyên string, due_date phải YYYY-MM-DD khi có value.
2. Mở một SQLite transaction cho toàn owner action.
3. CIS repository tạo issues row với source_system = manual, sync_status = ingested, không có backlog_issue_key/jira_issue_key và fields_json chỉ có branch cis.
4. Trong cùng transaction, tạo issue_revisions revision = 1 với source_system = manual.
5. Trong chính transaction đó, gọi `SyncApi.writeJournalInTransaction({ db, input })` để insert sync_journal action = issue_manual_created, direction_from = cis, direction_to = cis, trigger = manual, actor/correlation id từ request. Capability phải dùng cùng connection, không mở connection mới; journal failure rollback cả issue và revision.
6. Commit và trả HTTP 201.

Success response:

~~~json
{
  "data": {
    "outcome": "created",
    "issue": {
      "id": "cis-uuid",
      "project_id": 12,
      "source_system": "manual",
      "sync_status": "ingested",
      "current_revision": 1,
      "backlog_issue_key": null,
      "jira_issue_key": null
    }
  }
}
~~~

Validation response dùng envelope chuẩn: `PROJECT_NOT_FOUND` = 404; `VALIDATION_ERROR` = 422 với field errors an toàn cho project_id/summary/due_date; `DATABASE_BUSY` = 503 sau khi bounded retry cạn và tạo zero partial row. Không tạo Backlog/Jira source snapshot giả. Issue manual chỉ trở thành syncable khi canonical data, mapping, anomaly và dry-run Jira đều pass như issue khác.

UI project selection cho Create CIS issue:

- Nếu CIS Issues đang filter một project cụ thể, form preselect project đó nhưng vẫn hiển thị rõ project owner.
- Nếu filter đang là All projects, form bắt buộc chọn project; không tự lấy project đầu tiên và submit bị disable khi chưa chọn.
- Project disabled vẫn xuất hiện với badge/warning và được phép tạo draft theo server contract; UI không tự mở outbound action.
