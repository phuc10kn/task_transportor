# P2 cleanup plan - Pragmatic Hybrid

File này mô tả kế hoạch P2 cleanup boundary theo custom modular monolith.

Mục tiêu:

- Không refactor toàn bộ sang strict "mọi read qua API".
- Có sửa mọi cross-module write.
- Có tách presentation leakage.
- Có document read allowlist.

## Baseline đã xong

| Hạng mục | Trạng thái |
| --- | --- |
| Import chéo `application/infrastructure/support` | 0 vi phạm |
| `CisApi` proxy `TranslationApi` | Đã gỡ pattern mới |
| Route canonical Translation | `/api/v1/translations/issues/...` |
| Compat CIS routes | Gọi `TranslationApi` + TODO |
| AI Translation boundary | AI transport ở `src/infrastructure/ai` |

## Việc còn lại

| ID | Vấn đề | Tier | Hướng xử lý |
| --- | --- | --- | --- |
| P2-T0-JIRA | Jira infra `UPDATE issues` | T0 | Thêm method trên `CisApi`, Jira gọi CIS để persist |
| P2-T0-TRANS-SYNC | Translation `DELETE sync_jobs`, read `issues` | T0/T1 | Delete qua `SyncApi`, read issue qua `CisApi` |
| P2-T4-EDITOR | CIS chứa decoration Translation trong Issue Editor | T4 | Di chuyển view/decorate sang `TranslationApi` |
| P2-T1-CTX | Translation context SELECT CIS/Projects | T1 | Thêm `CisApi.getIssueTranslationContext`, dùng `ProjectsApi` |
| P2-T3-JIRA-READ | Jira dry-run/sync read bundle SQL | T3 | Giữ SQL read-only + comment allowlist |
| P2-T2-DASH | Dashboard cross-table counts | T2 | Giữ SQL read-only + comment allowlist |
| P2-E-QUEUE | `CisApi.createTranslationQueueItem` ownership mơ | Governance | Giữ tạm, không mở rộng lifecycle trên CIS |

## Thứ tự đề xuất

```text
HH-0 Tier 0 write fix
  -> HH-1 Tier 4 Issue Editor composition
  -> HH-2 Tier 1 Translation context
  -> HH-3 Tier 2/3 document + harden
  -> HH-4 governance/tooling
  -> HH-5 queue primitive optional
```

## HH-0 - Cross-module write

### Jira -> CIS

Jira không được ghi trực tiếp `issues`.

Thêm hoặc dùng public methods trên `CisApi`:

```text
markIssueSyncStatus
saveJiraDraftFields
saveIssueJiraSyncResult
```

Sau đó `JiraSyncRepository` chỉ giữ read bundle Tier 3; mọi persist CIS đi qua `CisApi`.

### Translation -> Sync/CIS

Translation không được `DELETE FROM sync_jobs`.

Hướng:

- `DELETE sync_jobs` -> `SyncApi.cancelJobsForTranslationQueue`.
- Read `issues.fields_json` -> `CisApi.getIssueById` hoặc read method tối giản.

## HH-1 - Issue Editor composition

CIS không nên chứa stale/decorate logic của Translation.

Hướng:

- Thêm `TranslationApi.getIssueEditorTranslations`.
- `Cis.getIssueEditor` chỉ compose response bằng dữ liệu CIS core + translation view.
- Stale/review summary logic nằm trong Translation.

## HH-2 - Translation context

Translation context không nên tự SELECT `issues`, `issue_revisions`, `issue_comments`, `projects`.

Hướng:

- `CisApi.getIssueTranslationContext` trả issue/revision/comments cần thiết.
- `ProjectsApi.getProject` trả project profile/config.
- Translation repository chỉ query dữ liệu Translation-owned.

## HH-3 - Tier 2/3 document + harden

Dashboard và Jira read bundle được giữ trong Lite nếu read-only.

Việc cần làm:

- Thêm comment tier allowlist trong repository.
- Không refactor Dashboard thành nhiều API call nếu chưa có lý do.
- Không để Jira repository còn write CIS tables sau HH-0.
- Cân nhắc future API `CisApi.getIssueOutboundSnapshot` trước khi extract service.

## Verify matrix

| Phase | Lệnh |
| --- | --- |
| HH-0 | `npm run verify:phase04`, `npm run verify:phase06`, `npm test` |
| HH-1 | `npm run verify:issue-editor`, `npm run verify:admin-ui-acceptance` |
| HH-2 | `npm run verify:translation-review`, `npm run verify:phase04` |
| HH-3 | `npm run verify:phase07`, `npm run verify:phase06` |
| Toàn bộ | `npm test` + import grep rỗng + write audit |

## Definition of Done P2

- Import audit vẫn 0 vi phạm.
- Không còn cross-module write ngoài owner/public API.
- Tier 2/3 read exception có allowlist/comment.
- Issue Editor translation presentation thuộc Translation.
- Translation context đọc CIS/Projects qua public API.
- Verify liên quan pass thật.
