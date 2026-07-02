# Phase IE-04 - History, docs và nghiệm thu

## Mục tiêu

Hoàn thiện audit/history cho Issue Editor và cập nhật docs/acceptance khi capability này được đưa vào scope Lite chính thức.

## History response

```json
{
  "data": {
    "issue_id": "issue_123",
    "revisions": [
      {
        "revision": 3,
        "source_system": "manual",
        "summary": "Login error",
        "description": "Plain text description",
        "issue_type": "Task",
        "priority": "High",
        "assignee": "user@example.test",
        "created_at": "2026-07-01T10:00:00.000Z"
      }
    ],
    "manual_edits": [
      {
        "id": 99,
        "action": "issue_manual_edit_saved",
        "executed_by": 1,
        "correlation_id": "req_xxx",
        "details_json": {
          "changed_fields": ["summary", "priority"],
          "before": {},
          "after": {},
          "reason": "Chuẩn hóa trước khi sync Jira",
          "canonical_hash_before": "sha256:old",
          "canonical_hash_after": "sha256:new"
        },
        "created_at": "2026-07-01T10:00:00.000Z"
      }
    ],
    "worklog_events": []
  }
}
```

`worklog_events` có thể rỗng trong v1. Nếu sau này create/update worklogs, audit worklog phải tách khỏi manual edit canonical issue.

## Docs cần cập nhật khi implement thật

Bắt buộc:

- `docs/work/plans/lite/08-api-admin-ui.md`
- `docs/work/plans/lite/implement_plans/07-admin-ui-acceptance.md`
- `docs/work/plans/lite/09-acceptance.md`
- `docs/work/11-api-contract.md`

Nên cập nhật:

- `docs/work/02-central-issue-store.md`
- `docs/work/10-state-machine.md`
- `docs/work/plans/lite/implement_context.md`

Chỉ cập nhật các docs trên khi endpoint/code thật đã tồn tại hoặc khi user chốt đưa Issue Editor vào scope Lite chính thức.

## Definition of Done

Issue Editor đạt yêu cầu khi:

1. Admin xem được canonical effective value và source của từng field.
2. Admin sửa được `summary`, `description`, `issue_type`, `priority`, business `status`, `assignee`, `due_date`.
3. Source Backlog/Jira không bị ghi đè.
4. `description` vào editor là `plain_text`, không phải raw ADF.
5. `assignee_meta` giữ được Jira account id tối thiểu.
6. `labels`, `components`, `fix_versions` không bị expose trong editor v1.
7. Worklogs có summary/list read-only hoặc contract rỗng có chủ đích.
8. Manual edit tạo journal có diff, actor, reason, correlation id.
9. Manual edit tạo revision khi sửa content/canonical field chính.
10. Edit sau `approved/synced` đưa issue về `update_pending`.
11. Dry-run Jira dùng canonical value mới nhất.
12. Sync Jira thật block nếu dry-run stale.
13. UI tách rõ Issue Editor với Translation Review.
14. History hiển thị được revision/journal manual edit.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] `npm run verify:issue-editor` pass.
- [ ] History trả revision manual.
- [ ] History trả journal manual edit.
- [ ] History không trộn worklog event vào canonical edit nếu worklogs có flow riêng.
- [ ] Docs/API contract được cập nhật sau khi endpoint thật tồn tại.
- [ ] Acceptance checklist Issue Editor được bổ sung.

### Manual check (Người review)

- [ ] Sửa một issue từ UI.
- [ ] Xem history thấy before/after và actor.
- [ ] Đối chiếu DB/API xác nhận Backlog/Jira source không đổi.
- [ ] Chạy dry-run sau edit và xác nhận payload dùng canonical value.
- [ ] Xác nhận sync bị block nếu dry-run stale.
- [ ] Xem worklogs không bị hiểu nhầm là field canonical editable.
