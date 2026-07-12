# Plan 04 — Output Contract Và Throughput Cho `write-docs`

Finding liên quan: WFP-06 và §5.2 `write-docs`  
Phương án đã chốt: **PA-B** — `write-docs result` sống trong task/chat/PR  
Trạng thái plan: đủ cấu trúc để điều phối và thực thi theo `docs/plans/prompts`

## Mục tiêu

Thêm output contract `write-docs result` vào workflow `write-docs` để human và agent cùng một shape audit:

- classification home/unit;
- path đã sửa và unit mới/cũ;
- relation added / intentionally not added / rejected kèm reason;
- evidence và open conflict;
- handoff sang `trace-impact` hoặc `validate-after-change`.

Giữ ceremony thấp bằng short form cho thay đổi prose nhỏ. Không tạo file SoT mới và không thay terminal gate.

## Phạm vi

### Trong scope

- Chốt và materialize PA-B trong guide workflow.
- Full form + short form + ceremony matrix trong `write-docs.md`.
- `validate-after-change` nhận `write-docs result` như optional evidence input.
- Đồng bộ onboarding/dispatcher ngắn.
- Cập nhật example CIS và `doc-create-entity` output shape.
- Đóng review finding WFP-06 phần write-output sau khi materialize.

### Ngoài scope

- PA-A làm hướng chính.
- PA-C file change manifest trong repo.
- PA-D auto report từ git diff.
- Schema/meta mới cho report.
- CI parse bắt buộc `write-docs result`.
- Thay PR change manifest Plan 01-C bằng write-docs result.
- WFP-08 mở rộng `verify:docs` sang `docs/app` / `docs/meta`.
- Plan 05 Business materialization.
- Sửa product behavior code.

### Deferred work

- PA-D helper sinh draft report từ git diff sau khi PA-B ổn.
- Gợi ý section trong PR template nếu sau vận hành thấy thiếu kỷ luật emit report.
- Human output chuẩn cho `read-for-task` / `trace-impact` nếu còn gap WFP-06 ngoài write.

## Baseline hiện tại

- `write-docs.md` có gate classification/schema/boundary/relation nhưng **không** có section Output.
- `sync-product-change.md` đã có `product-change sync result`.
- `validate-after-change.md` đã có terminal result; input chưa nhận `write-docs result`.
- `doc-create-entity` có output riêng `doc-create-entity result`, chưa map sang `write-docs result`.
- Example `central-sync-hub-change.md` minh họa sync/write nhưng chưa có mẫu write-docs result.
- Option paper cũ đã khuyến nghị PA-B 5/5; user đã chốt làm PA-B.

Chuỗi hiện thiếu mắt xích giữa:

```text
sync result (nếu có) → [thiếu write-docs result] → validate-after-change result
```

## Source of truth

| Nguồn | Vai trò trong plan này |
| --- | --- |
| `docs/guide/workflows/write-docs.md` | Home canonical của output contract PA-B |
| `docs/guide/workflows/validate-after-change.md` | Terminal gate; nhận write result làm optional input |
| `docs/guide/workflows/sync-product-change.md` | Intake trước write; write result reference sync, không nhập lại behavior delta |
| `docs/guide/examples/central-sync-hub-change.md` | Ví dụ local minh họa full form |
| `docs/AGENT_SKILLS/doc-create-entity/SKILL.md` | Agent output phải align full form |
| `docs/review/workflows/all.md` + `plans/README.md` | Review/finding closure sau materialize |
| `docs/plans/prompts/planner.md` | Hợp đồng cấu trúc plan |
| `docs/plans/prompts/coordinator.md` | Chọn current phase, handoff, blocked, accepted gaps |
| `docs/plans/prompts/executor.md` | Thực thi phase, tick checklist, ghi `Kết quả thực hiện` |
| File plan này | Điều phối phase, handoff, blocked, acceptance |

`write-docs result` **không** là source of truth cho app/meta/theory knowledge. Report chỉ audit quyết định lúc viết.

### Output contract đã chốt

#### Full form

Dùng khi entity, relation, meta, theory hoặc decision đổi; hoặc khi tạo unit mới.

```md
## write-docs result

### Classification
- Task:
- Canonical home:
- Unit type:
- Schema / template used:
- Existing file reused: yes/no + path
- New unit (if any): path + reason

### Changes
- Paths:
- App truth changed: yes/no
- Meta contract changed: yes/no
- Theory / decision changed: yes/no

### Relations
- Added:
- Intentionally not added: + reason
- Rejected: + reason

### Evidence / decisions
- Sync result referenced: yes/no + verdict
- Sources:
- Decision/theory basis:
- Open conflicts / questions:

### Handoff
- trace-impact: yes/no + reason
- validate-after-change: required
- Next: trace-impact | validate-after-change | clarification | use-workbench
```

#### Short form

Dùng khi typo, link fix hoặc wording nhỏ; không đổi behavior, schema hay relation.

```md
## write-docs result (short)

### Classification
- Canonical home:
- Unit type: prose / README layer

### Changes
- Paths:

### Handoff
- validate-after-change: required
- trace-impact: no
```

#### Ceremony matrix

| Loại task | Form | Rule |
| --- | --- | --- |
| Typo / link / wording không đổi behavior | Short | Bắt buộc home + paths + validate handoff |
| README layer prose không đụng entity/relation | Short | Không bắt Relations section |
| Entity / relation / meta / theory / decision | Full | Bắt buộc Relations + Evidence |
| Code/product behavior đã qua sync | Full | Reference sync result; không nhập lại behavior delta |
| Undetermined-placement | Không emit write-docs result ready | Route `use-workbench` theo DEC-003; ngoài scope Workbench thì clarification theo policy local |

#### Quy tắc cứng

1. Không cite `write-docs result` như app truth hoặc meta contract.
2. Không tạo file canonical trong `docs/app` / `docs/meta` chỉ để chứa report.
3. Không bỏ `validate-after-change` vì đã có write report.
4. `Intentionally not added` và `Rejected` phải có reason.
5. Sync `blocked` không được đi kèm write-docs result hợp lệ cho app truth change.

## Phase triển khai

### Phase P04-01 - Core write-docs output contract

Mục tiêu:
- Materialize Output full/short + ceremony matrix + quy tắc cứng vào `write-docs.md`.
- Bắt buộc emit result trước handoff validate/trace.

Target files/artifacts:
- `docs/guide/workflows/write-docs.md`

Điều kiện mở:
- Plan này đã pass checklist cấu trúc planner.
- PA-B đã được user chốt.

Việc cần làm:
- Thêm section Output với full form, short form, ceremony matrix và non-goals.
- Cập nhật Bước 6 handoff: emit `write-docs result` trước khi sang `trace-impact` hoặc `validate-after-change`.
- Ghi rõ report sống trong task/chat/PR; không tạo file SoT.

Checklist nghiệm thu:
- [x] `write-docs.md` có heading Output với full form và short form đúng contract đã chốt.
- [x] Ceremony matrix nằm trong `write-docs.md` và không còn wording mơ hồ về form.
- [x] Handoff yêu cầu emit result trước validate/trace.
- [x] Có câu non-goal: report không phải SoT; không thay validate.

Kết quả thực hiện:
- Fix tối thiểu: docs/guide/workflows/write-docs.md - thêm Output full/short, ceremony matrix, quy tắc cứng; Bước 6 bắt buộc emit trước handoff

### Phase P04-02 - Validate binding và entry points

Mục tiêu:
- Cho `validate-after-change` nhận write result như optional evidence input.
- Đồng bộ dispatcher/onboarding để nhắc emit result đúng form.

Target files/artifacts:
- `docs/guide/workflows/validate-after-change.md`
- `docs/guide/workflows/README.md`
- `docs/guide/getting-started/quick-start.md`
- `docs/guide/getting-started/first-doc-change.md`

Điều kiện mở:
- Phase P04-01 đã pass acceptance.

Việc cần làm:
- Thêm `write-docs result` vào Input của validate; nêu rõ không thay checklist schema/relation.
- Thêm một câu vận hành ở dispatcher và getting-started: sau write phải có short hoặc full form phù hợp ceremony matrix.

Checklist nghiệm thu:
- [x] `validate-after-change.md` Input liệt kê `write-docs result` là optional evidence.
- [x] Validate vẫn yêu cầu checklist riêng; không bị thay bằng write report.
- [x] `workflows/README.md` nhắc emit write-docs result.
- [x] `quick-start.md` và `first-doc-change.md` nhắc short/full theo loại task.

Kết quả thực hiện:
- Fix tối thiểu: docs/guide/workflows/validate-after-change.md - Input nhận write-docs result optional
- Fix tối thiểu: docs/guide/workflows/README.md - nhắc emit result sau write
- Fix tối thiểu: docs/guide/getting-started/quick-start.md - short/full rule
- Fix tối thiểu: docs/guide/getting-started/first-doc-change.md - emit result trên cả hai nhánh

### Phase P04-03 - Example và agent alignment

Mục tiêu:
- Minh họa full form trên example CIS.
- Align `doc-create-entity` output với full form.

Target files/artifacts:
- `docs/guide/examples/central-sync-hub-change.md`
- `docs/AGENT_SKILLS/doc-create-entity/SKILL.md`

Điều kiện mở:
- Phase P04-02 đã pass acceptance.

Việc cần làm:
- Thêm mẫu `write-docs result` full form sau bước write trong example CIS.
- Sửa output `doc-create-entity` để map sang shape full form; suggested next gồm `trace-impact` / `validate-after-change`.
- Không tạo schema meta mới.

Checklist nghiệm thu:
- [x] Example CIS có section `## write-docs result` với Classification/Changes/Relations/Evidence/Handoff.
- [x] `doc-create-entity/SKILL.md` output align full form hoặc map tường minh từng field sang full form.
- [x] Suggested next của skill gồm validate và trace khi cần.
- [x] Không có file schema/meta mới cho report.

Kết quả thực hiện:
- Fix tối thiểu: docs/guide/examples/central-sync-hub-change.md - mẫu write-docs result full form sau bước write
- Fix tối thiểu: docs/AGENT_SKILLS/doc-create-entity/SKILL.md - Output = full form + alias map; suggested next trace/validate

### Phase P04-04 - Review closure và verify

Mục tiêu:
- Cập nhật review/finding sau materialize.
- Chạy `verify:docs` và xác nhận không còn gap cấu trúc PA-B.

Target files/artifacts:
- `docs/review/workflows/all.md`
- `docs/review/workflows/plans/README.md`
- `docs/review/workflows/plans/04-write-docs-output-throughput.md`
- `docs/review/guide/03-workflows.md`
- verify-only: `npm run verify:docs`

Điều kiện mở:
- Phase P04-03 đã pass acceptance.

Việc cần làm:
- Đánh dấu Plan 04-B done trong `plans/README.md`.
- Cập nhật WFP-06: write output đã có; ghi rõ phần read/trace human output còn mở nếu còn.
- Tick checklist nghiệm thu tổng của plan này sau verify thật.
- Chạy `npm run verify:docs`.

Checklist nghiệm thu:
- [x] `plans/README.md` ghi Plan 04-B đã triển khai.
- [x] `all.md` cập nhật trạng thái WFP-06 phản ánh write output đã materialize.
- [x] Plan 04 checklist nghiệm thu tổng đã tick theo verify thật.
- [x] `npm run verify:docs` pass.

Kết quả thực hiện:
- Fix tối thiểu: docs/review/workflows/plans/README.md - Plan 04-B done
- Fix tối thiểu: docs/review/workflows/all.md - WFP-06 write đã có; read/trace còn mở
- Fix tối thiểu: docs/review/guide/03-workflows.md - snapshot Plan 04-B
- No-change: verify:docs - Documentation navigation verification passed (184 Markdown files)

## Quy ước điều phối

### Handoff hiện tại

```text
Current phase: none
Done: Plan 04-B closed — P04-01..P04-04 pass; verify:docs pass
Next: Deferred outside Plan 04 (read/trace human output; PA-D; PR template section)
Prompt tiếp theo: none (Plan 04-B closed)
```

### Trạng thái blocked

None

### Accepted gaps

- Human output chuẩn cho `read-for-task` và `trace-impact` không thuộc acceptance Plan 04-B; giữ trong WFP-06 phần còn mở nếu còn.
- PA-D auto-diff helper deferred; không ảnh hưởng pass P04-01..P04-04.
- PR template section riêng deferred; short/full trong chat/PR body là đủ cho Plan 04-B.

### Quy tắc resume

Luồng prompt chuẩn:

```text
planner.md → coordinator.md → executor.md → coordinator.md → ...
```

1. Đọc `### Handoff hiện tại` và phase id trước khi làm tiếp.
2. `coordinator.md` chọn current phase và overwrite handoff; không tick checklist.
3. `executor.md` chỉ làm trong current phase; tick checklist sau khi sửa/verify thật.
4. Chỉ mở phase sau khi phase trước đã pass toàn bộ checklist nghiệm thu.
5. Ghi tiến độ vào `Kết quả thực hiện` bằng đúng format:
   - `No-change: <path> - <lý do ngắn>`
   - `Fix tối thiểu: <path> - <phạm vi ngắn>`
   - `In-progress: <phase id> - <đã xong> | Next: <việc tiếp theo>`
6. Blocked ghi vào `### Trạng thái blocked` theo format `Blocked: <phase id> - <blocker ngắn>`.
7. Không tick checklist khi mới thảo luận hoặc mới dự định.
8. Thiếu cấu trúc plan → quay `planner.md`. Current phase rõ và không blocked → `executor.md`.

## Checklist nghiệm thu tổng

- [x] `write-docs.md` có Output full + short + ceremony matrix + quy tắc cứng.
- [x] `validate-after-change.md` nhận write result optional và vẫn giữ terminal checklist.
- [x] Dispatcher/onboarding nhắc emit result đúng form.
- [x] Example CIS có mẫu full form.
- [x] `doc-create-entity` align full form.
- [x] Không tạo schema/meta/file manifest mới cho report.
- [x] Review docs đánh dấu Plan 04-B done; WFP-06 phần write đã cập nhật.
- [x] `npm run verify:docs` pass.

## Điều kiện hoàn thành

Plan 04-B hoàn thành khi:

1. Toàn bộ phase P04-01..P04-04 pass acceptance.
2. Checklist nghiệm thu tổng đã tick sau verify thật.
3. `### Handoff hiện tại` ghi Plan 04-B closed và Prompt tiếp theo không còn mở phase Plan 04.
4. Deferred work còn lại nằm ngoài acceptance hiện tại và đã ghi ở `### Accepted gaps` hoặc Deferred work.

Không hoàn thành nếu:

- chỉ có plan mà chưa materialize workflow;
- có write report nhưng bỏ validate;
- tạo file SoT hoặc schema mới cho report;
- ceremony matrix còn mơ hồ giữa short và full.
