# Plan 01 — Bridge Code/Product Change Sang Docs

Finding liên quan: WFP-02  
Trạng thái: **đã triển khai phương án B + C**

- B: canonical workflow [../../../guide/workflows/sync-product-change.md](../../../guide/workflows/sync-product-change.md)
- C: PR template + CI body check (path-filtered)

## Vấn đề gốc

`write-docs` bắt đầu khi người làm đã biết “cần sửa knowledge nào”. Product task thực tế thường bắt đầu từ code, incident hoặc behavior change. Thiếu bước xác định:

- behavior trước/sau;
- code chỉ là evidence hay là behavior đã được chốt;
- layer app nào bị tác động;
- test nào chứng minh behavior;
- conflict code ↔ app truth phải dừng ở đâu.

Hệ quả: tài liệu có thể đúng schema nhưng sai product truth.

## Phương án

| PA | Mô tả | Ưu điểm | Nhược điểm | Ảnh hưởng sửa | Sửa được gốc? | Recommend |
| --- | --- | --- | --- | --- | --- | --- |
| A | Thêm “Bước -1: behavior delta” trực tiếp vào `write-docs` | Ít file; người dùng không cần học workflow mới | `write-docs` phình; trộn product-impact analysis với docs governance; task prose nhỏ cũng chịu thêm bước | Trung: `write-docs`, README, onboarding | Một phần | 3/5 — cân nhắc |
| B | Tạo workflow riêng `sync-product-change`, handoff sang `write-docs` | Tách đúng trách nhiệm; portable; có output code evidence/test/conflict; dễ bỏ qua cho task prose | Chưa có enforcement; thêm một workflow phải học | Trung: workflow mới + dispatcher/entry point | Có ở mức process | **5/5 — đã triển khai** |
| C | Thêm PR change manifest/checklist bắt buộc (`behavior_delta`, docs impact, test evidence) | Review thấy bằng chứng ngay; khó quên; bind tốt với product repo | Repo-specific; dễ checklist fatigue; không tự dạy cách phân loại layer/home | Trung: PR template/policy/CI check | Một phần; enforcement tốt | **4/5 — đã triển khai sau B** |
| D | CI tự suy luận code path → docs path và fail nếu thiếu docs diff | Tự động; bắt drift rõ trên path ổn định | False positive/negative cao; không hiểu semantic; maintenance mapping lớn | Cao: script, mapping config, CI | Không hoàn toàn | 2/5 — chưa làm |

## Đề xuất

Đã chọn **B rồi C**.

```text
code / incident / behavior request
→ sync-product-change
→ write-docs
→ trace-impact (nếu cần)
→ validate-after-change
→ PR manifest / CI body check
```

### Phương án C đã materialize

- Template: `.github/pull_request_template.md`
- Validator: `scripts/verify/pr-change-manifest.js`
- Config path filter: `scripts/verify/pr-change-manifest.config.json`
- Workflow: `.github/workflows/verify-pr-change-manifest.yml`
- Unit tests: `npm run verify:pr-change-manifest`

Trigger khi PR chạm:

- `src/**`, `public/admin/**`, `scripts/**`, `routes/**`
- `package.json`, `package-lock.json`
- `docs/app/**`

Không trigger cho PR chỉ sửa guide/meta/theories/review/AGENT_SKILLS/`.github`/housekeeping/`backlog2jira`.

Giới hạn: validator kiểm shape/consistency, không suy luận semantic docs cần thiết từ code.

### Vì sao không nhét vào `write-docs`

`write-docs` đang làm tốt vai trò governance: home, schema, type, boundary, relation. Behavior delta là intake/product analysis. Trộn hai trách nhiệm làm workflow dài và khó dùng cho thay đổi docs thuần.

### Output sync đã materialize

Xem contract trong [../../../guide/workflows/sync-product-change.md](../../../guide/workflows/sync-product-change.md) và ví dụ [../../../guide/examples/central-sync-hub-change.md](../../../guide/examples/central-sync-hub-change.md).

## Phạm vi đã sửa

- Thêm `docs/guide/workflows/sync-product-change.md`.
- Sửa dispatcher `docs/guide/workflows/README.md`.
- Sửa `docs/guide/README.md`, `quick-start.md`, `first-doc-change.md`, `read-for-task.md`, `write-docs.md`, `validate-after-change.md`.
- Cập nhật example CIS và agent route.
- Thêm PR template + CI path-filtered body check.
- Product local activation profile YAML vẫn để phase sau nếu cần.

## Acceptance

- [x] Mọi code behavior change có behavior delta trước khi sửa docs (workflow yêu cầu).
- [x] Code và app truth conflict tạo `blocked`, không tự sửa docs cho khớp code.
- [x] Test command ghi cả result và coverage (trong output template).
- [x] Task prose không đổi behavior không bị ép chạy workflow sync.
- [x] PR chạm code/`docs/app` phải khai manifest; PR guide-only được skip.
