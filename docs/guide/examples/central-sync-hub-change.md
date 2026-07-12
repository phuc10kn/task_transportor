# Example: Central Sync Hub Change

Ví dụ local của `task_transportor`. Không portable nguyên xi sang project khác.

## Task

Làm rõ rằng Lite ưu tiên `Backlog -> CIS` và `CIS -> Jira`, chưa yêu cầu Jira inbound đầy đủ. Giả sử thay đổi đã được phê duyệt ở product/decision; code có thể đã khớp hoặc đang được căn.

## 1. read-for-task

Canonical sources cần đối chiếu:

| Nội dung | Home |
| --- | --- |
| Scope Lite | `docs/app/02-product/README.md` |
| Business flow | `docs/app/01-business/README.md` |
| Architecture invariant | `docs/app/05-architecture/README.md` |
| Decision accepted | `docs/app/10-decisions/README.md` |
| Acceptance | `docs/app/08-quality/README.md` |

Không đặt rule này trong `docs/theories/` vì đây là app-specific scope. Theory liên quan có thể là `TH-HUBFLOW`, nhưng theory không nên nhắc Backlog/Jira cụ thể.

Workflow tiếp theo: `sync-product-change`.

## 2. sync-product-change

```md
## product-change sync result

### Trigger
- Type: scope-change
- Stage: implemented
- Summary: Chốt Lite ưu tiên Backlog -> CIS và CIS -> Jira; Jira inbound đầy đủ vẫn ngoài scope.
- Authority: docs/app/02-product/README.md + docs/app/10-decisions/README.md

### Behavior delta
- Before: Scope có thể bị hiểu là hai chiều đầy đủ Backlog <-> Jira.
- After: Inbound ưu tiên Backlog -> CIS; outbound ưu tiên CIS -> Jira; Jira inbound đầy đủ chưa thuộc Lite.
- Unchanged guardrails: Dry-run trước sync Jira thật; Medium/Full không tự thành Lite.

### Evidence
| Kind | Reference | Finding | Coverage |
| --- | --- | --- | --- |
| canonical truth | docs/app/02-product/README.md | Scope Lite hiện hành | n/a |
| effective decision / approved request | docs/app/10-decisions/README.md | Quyết định còn hiệu lực | n/a |
| code evidence | src/modules ingest/push paths | Manual pull + Jira outbound theo Lite | observed paths only |
| test / runtime evidence | npm run verify:phase03; npm run verify:phase06 | Pass theo phase liên quan | behavior phase; không validate docs schema |
| candidate | | | |
| missing | | | |

### Impact
- Layers: Product, Business, Architecture, Quality, Decision
- Knowledge changes required: làm rõ scope wording và out-of-scope Jira inbound đầy đủ
- Canonical-home candidates: docs/app/02-product/README.md; docs/app/01-business/README.md; docs/app/05-architecture/README.md; docs/app/10-decisions/README.md

### No-doc-impact
- Pure internal helper rename không đổi contract: không cần docs nếu không đổi behavior.

### Conflicts / open decisions
- Không có. Code không được dùng để mở rộng scope vượt product/decision.

### Flags
- trace-impact needed: no — thay đổi wording/scope README, chưa materialize entity/relation mới
- decision record needed: no — decision hiện hành đã đủ
- implementation evidence pending: no

### Handoff
- Verdict: ready_for_write
- Reason: Authority rõ; delta khớp product truth; không drift
- Next: write-docs
```

### Ví dụ blocked (drift)

Nếu code có Jira inbound đầy đủ nhưng product/decision vẫn out-of-scope:

- Source relationship: `drift`
- Handoff: `blocked`
- Không sửa docs để hợp thức hóa code; cần decision/scope review trước.

## 3. write-docs

Chỉ sau `ready_for_write`:

1. Xác nhận candidate homes ở trên; sửa file app/decision tương ứng bằng [write-docs.md](../workflows/write-docs.md).
2. Không nhét Backlog/Jira detail vào theory.
3. Không tạo entity/relation chỉ vì muốn graph đầy đủ.
4. Emit `write-docs result` full form trong task/chat/PR trước validate.

```md
## write-docs result

### Classification
- Task: Làm rõ Lite ưu tiên Backlog -> CIS và CIS -> Jira; Jira inbound đầy đủ vẫn ngoài scope
- Canonical home: docs/app/02-product/README.md
- Unit type: README layer
- Schema / template used: layer README pattern (không tạo entity instance mới)
- Existing file reused: yes + docs/app/02-product/README.md; docs/app/01-business/README.md; docs/app/05-architecture/README.md; docs/app/10-decisions/README.md
- New unit (if any): none

### Changes
- Paths: docs/app/02-product/README.md; docs/app/01-business/README.md; docs/app/05-architecture/README.md; docs/app/10-decisions/README.md
- App truth changed: yes
- Meta contract changed: no
- Theory / decision changed: no (decision hiện hành đã đủ; chỉ đồng bộ wording)

### Relations
- Added: none
- Intentionally not added: entity/relation mới — reason: thay đổi wording/scope README; sync gắn trace-impact needed: no
- Rejected: graph “đầy đủ” Backlog/Jira trong theory — reason: app-specific detail thuộc docs/app, không thuộc docs/theories

### Evidence / decisions
- Sync result referenced: yes + ready_for_write
- Sources: docs/app/02-product/README.md; docs/app/10-decisions/README.md; sync evidence bảng ở bước 2
- Decision/theory basis: docs/app/10-decisions/README.md (accepted); không tạo DEC mới
- Open conflicts / questions: none

### Handoff
- trace-impact: no — sync flags trace-impact needed: no; không materialize entity/relation mới
- validate-after-change: required
- Next: validate-after-change
```

## 4. validate-after-change

Chạy [validate-after-change.md](../workflows/validate-after-change.md).

Local hooks minh họa coverage (không portable):

| Command | Coverage thật |
| --- | --- |
| `npm run verify:phase03` | Behavior inbound pull liên quan |
| `npm run verify:phase06` | Behavior outbound Jira liên quan |
| `npm run verify:docs` | Link/anchor guide/skills/review; **không** quét `docs/app` |

Checklist placement/schema/relation vẫn thủ công nếu chạm unit schema-managed.

## 5. Local PR enforcement (task_transportor)

Repo này có PR change manifest local — **không** thuộc guide portable.

Khi PR chạm `src/**`, `public/admin/**`, `scripts/**`, `routes/**`, `package.json`, `package-lock.json` hoặc `docs/app/**`:

1. Điền `.github/pull_request_template.md`.
2. Với behavior change: dán/gắn `product-change sync result` và set `Sync verdict: ready_for_write`.
3. CI chạy `.github/workflows/verify-pr-change-manifest.yml` → `node scripts/verify/pr-change-manifest.js`.
4. Validator chỉ kiểm shape/consistency (delta, docs impact, test evidence); không xác minh business meaning.

Ví dụ local:

```powershell
node scripts/verify/pr-change-manifest.js --body-file pr-body.md --files-file pr-changed-files.json
npm run verify:pr-change-manifest
```

Branch protection phải yêu cầu check `Verify PR change manifest` sau khi workflow đã chạy trên default branch; chỉ thêm workflow chưa tự chặn merge.
