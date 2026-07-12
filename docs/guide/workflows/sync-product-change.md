# Sync Product Change

Intake và conflict gate trước [write-docs.md](write-docs.md) khi task bắt đầu từ code, incident hoặc product behavior change.

Workflow này phân tích behavior delta, phân loại evidence và quyết định có được phép sửa canonical docs hay không. Nó **không** sửa file docs, **không** validate schema/relation và **không** thay [validate-after-change.md](validate-after-change.md).

`product-change sync result` chỉ là artifact trong task/PR/chat. Canonical-home path trong output chỉ là **candidate**; [write-docs.md](write-docs.md) phải xác nhận lại trước khi sửa.

## Trigger

Chạy khi:

- thêm/sửa behavior observable (API, worker, UI flow, sync path);
- đổi scope, state machine, gate hoặc authority;
- đổi external side effect;
- đổi acceptance, recovery path hoặc quality gate ở mức product;
- incident/postmortem cho thấy behavior thực tế lệch app docs.

Không chạy khi:

- typo, link fix hoặc prose-only không đổi behavior;
- refactor nội bộ không đổi contract;
- test-only không đổi product behavior;
- slim README hoặc meta convention thuần;
- task chỉ đọc.

## Change stage

Ghi một trong:

| Stage | Ý nghĩa | Evidence tối thiểu |
| --- | --- | --- |
| `proposed` | Thay đổi đã được phê duyệt hoặc đang được thiết kế; chưa hoặc chưa cần code | Approved request/decision + behavior delta rõ |
| `implemented` | Code/test đã đổi hoặc đang đổi cùng docs | App/decision authority + code evidence + test/runtime khi áp dụng |
| `drift-investigation` | Phát hiện code/docs lệch; chưa chắc cái nào đúng | Code evidence + app truth hiện hành + conflict note |

Không bắt buộc có code evidence cho stage `proposed`. Không dùng code làm authority cho stage `drift-investigation`.

## Input

- task / change request / incident;
- kết quả [read-for-task.md](read-for-task.md);
- app truth và decision hiện hành;
- `change_authority` do product local xác định (request đã duyệt, decision, product owner, hoặc tương đương);
- code paths/diff nếu đã có;
- test/runtime evidence và coverage nếu áp dụng;
- local tooling hooks của project (optional).

Code **không** tự là `change_authority`.

## Workflow

```text
1. Gate loại task và stage
   - Không có product behavior delta → skip.
   - Có delta → ghi change_stage.

2. Xác định authority của delta
   - Approved request / decision / product authority hiện hành.
   - Nếu authority không rõ → blocked.

3. Viết behavior delta
   - Before / After / Unchanged guardrails.

4. Phân loại evidence
   - canonical truth
   - effective decision / approved request
   - code evidence
   - test / runtime evidence
   - candidate
   - missing evidence

5. Map impact
   - Layers: Business, Product, Domain, Architecture, Quality, Decision, ...
   - Canonical-home candidates (chưa chọn unit/schema).

6. Phân loại quan hệ giữa sources
   - aligned | authorized-delta | drift | undetermined

7. Gắn cờ
   - trace-impact needed
   - decision record needed
   - implementation evidence pending

8. Emit product-change sync result + verdict handoff
```

## Source relationship

| Label | Ý nghĩa |
| --- | --- |
| `aligned` | Code/test và app truth đang khớp; task có thể chỉ củng cố docs |
| `authorized-delta` | Có authority rõ để đổi app truth theo delta |
| `drift` | Code và app truth lệch; chưa có authority để chọn phía nào |
| `undetermined` | Thiếu evidence để kết luận |

## Verdict / stop condition

| Verdict | Điều kiện | Handoff |
| --- | --- | --- |
| `skip` | Không có product behavior impact | Không sang write-docs vì sync; prose riêng vẫn có thể đi thẳng write-docs |
| `ready_for_write` | Delta có authority, behavior rõ, không còn conflict chặn | [write-docs.md](write-docs.md) |
| `blocked` | Drift không authority, authority không rõ, delta mơ hồ, hoặc evidence không đủ | Clarification / decision; **không** sửa docs để hợp thức hóa code |

Phân biệt:

- authority/conflict `blocked` → clarification/decision; Workbench **không** đổi verdict thành `ready_for_write`;
- thiếu evidence nhưng vẫn cần giữ observation tạm và project đã kích hoạt Workbench → có thể intake Workbench như evidence staging; sync vẫn không sẵn sàng write canonical.

Quy tắc cứng:

- Không tự chọn code là truth khi conflict với app truth/decision.
- Stage `proposed` có thể `ready_for_write`, nhưng phải gắn `implementation evidence pending: yes` nếu docs sẽ mô tả behavior active mà code/test chưa có.
- Terminal merge vẫn thuộc [validate-after-change.md](validate-after-change.md); sync không claim `ready` để merge.

## Output

```md
## product-change sync result

### Trigger
- Type: code-change | incident | scope-change | acceptance-change | other
- Stage: proposed | implemented | drift-investigation
- Summary:
- Authority:

### Behavior delta
- Before:
- After:
- Unchanged guardrails:

### Evidence
| Kind | Reference | Finding | Coverage |
| --- | --- | --- | --- |
| canonical truth | | | |
| effective decision / approved request | | | |
| code evidence | | | |
| test / runtime evidence | | | |
| candidate | | | |
| missing | | | |

### Impact
- Layers:
- Knowledge changes required:
- Canonical-home candidates:

### No-doc-impact
- Path/change + reason:

### Conflicts / open decisions
- ...

### Flags
- trace-impact needed: yes/no + reason
- decision record needed: yes/no
- implementation evidence pending: yes/no

### Handoff
- Verdict: skip | ready_for_write | blocked
- Reason:
- Next: write-docs | clarification/decision | none
```

## Project tooling hooks (optional)

Bước này **không** thuộc contract xuyên dự án của guide.

- Không có tooling local → bỏ qua; dựa evidence thủ công trong report.
- Có tooling → chạy đúng phạm vi và ghi cả `result` lẫn `coverage`.
- Guide **không** bắt buộc `npm`, Node, tên script, hay product-specific phase verify.

Ví dụ local chỉ được ghi trong product example hoặc activation profile; không copy vào contract generic này.

## Handoff

- `ready_for_write` → [write-docs.md](write-docs.md) với toàn bộ `product-change sync result`.
- `blocked` → làm rõ authority/decision hoặc bổ sung evidence; chạy lại sync trước khi sửa `docs/app`. Workbench không bypass blocked.
- `skip` → nếu vẫn cần sửa prose unrelated, đi [write-docs.md](write-docs.md) như task docs thường; nếu không cần sửa docs thì dừng.
- Sau write-docs: [trace-impact.md](trace-impact.md) khi flag yêu cầu, rồi luôn [validate-after-change.md](validate-after-change.md).
- Nếu ready_for_write nhưng canonical home chưa rõ và Workbench đã active → [use-workbench.md](use-workbench.md) trước khi materialize.
