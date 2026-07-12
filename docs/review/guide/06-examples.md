# Review — `docs/guide/examples/`

Ngày: 2026-07-12  
Context: [00-overview.md](00-overview.md)  
Phạm vi: 4 file Markdown trong `examples/`

## 1. Vai trò

| Nguồn | Vai trò |
| --- | --- |
| README gốc | “Ví dụ thật theo repo để giảm mơ hồ.” |
| `examples/README.md` | **Project-specific `task_transportor`**; minh họa cách dùng guide; **không** phải template generic copy sang project khác. |

## 2. Inventory

| File | Nội dung |
| --- | --- |
| `README.md` | Scope + index |
| `central-sync-hub-change.md` | Phân loại thay đổi CIS scope → route app/decision/theory |
| `relation-trace.md` | Ví dụ walk relation / gap / accepted gap |
| `slim-context-readme.md` | Before/after slim `00-context` README; chứa app truth Lite/CIS |

## 3. Đối chiếu tiêu chí overview

### 3.1 Pure vs project

| File | Leakage | Đánh giá |
| --- | --- | --- |
| README | Tự nhận `task_transportor` | **Đúng chỗ** |
| `central-sync-hub-change.md` | Backlog→CIS→Jira, Lite | Đúng examples |
| `slim-context-readme.md` | `System -> CIS -> System`, Lite, `TH-HUBFLOW`, dry-run | Đúng examples |
| `relation-trace.md` | Generic Problem/BusinessRequirement — ít project name | Đúng sau khi README phân biệt generic vs CIS |

Placement cleanup (EX-01) đã remediate: cleanup bắt buộc = workflow + template; example optional + nhãn không portable.

### 3.2 Ownership

- Không thay SoT; chỉ minh họa.
- `central-sync-hub-change`: “Không đặt trong theories vì app-specific” — đúng.
- Slim after-pattern giữ app truth trong layer README — đúng slim doctrine.

### 3.3 Điều hướng

| Finding | Severity | Chi tiết |
| --- | --- | --- |
| reference/README không link examples | Thấp | Không bắt buộc |

### 3.4 Portability

**Thấp theo thiết kế** — OK nếu consumer đọc `examples/README.md` trước.

### 3.5 Completeness

| Hứa | Thực tế |
| --- | --- |
| Ví dụ change / relation / slim | Có 3 file nội dung |
| `central-sync-hub-change` có handoff write/trace | Đã có mục sau khi route |

### 3.6 Chất lượng

- Slim example giá trị cao cho agent (before/after cụ thể).
- `relation-trace` align allowed_when_known / required_at_creation / accepted gap — hữu ích xuyên dự án.

## 4. Finding còn mở

| ID | Severity | Chi tiết |
| --- | --- | --- |
| — | Thấp | `reference/README` không link `examples/` — không bắt buộc |

EX-01…EX-04 đã remediate và gỡ khỏi bảng.

## 5. Điểm mạnh

1. README folder **thành thật** về project-specific — chuẩn mực cho examples.
2. Slim before/after là tài liệu đào tạo tốt nhất trong guide cho cleanup.
3. Phân biệt theory vs app trong change example rõ.
4. Không giả vờ là pack reusable.

## 6. Verdict folder

**Đúng vai trò examples.** Không còn finding mở trong bảng remediation.
