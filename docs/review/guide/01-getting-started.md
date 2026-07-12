# Review — `docs/guide/getting-started/`

Ngày: 2026-07-12  
Context: [00-overview.md](00-overview.md)  
Phạm vi: 4 file Markdown trong `getting-started/`

## 1. Vai trò theo README gốc và README folder

| Nguồn | Vai trò |
| --- | --- |
| `docs/guide/README.md` | “Đường vào nhanh cho người mới.” |
| `getting-started/README.md` | Hiểu hệ docs nhanh; mục tiêu là **cách dùng**, không học hết layer. Thứ tự: `quick-start` → `introduction` → `first-doc-change`. |

## 2. Inventory

| File | Vai trò thực tế |
| --- | --- |
| `README.md` | Index thứ tự đọc |
| `quick-start.md` | Nhánh use-case (hiểu app / hiểu docs / sửa / thêm type / temporary) |
| `introduction.md` | Bức tranh Meta→App + Theory; bảng folder; lý do cần guide; universal baseline |
| `first-doc-change.md` | Route Luồng tổng (read → write → trace → validate) + ví dụ phân loại home |

## 3. Đối chiếu tiêu chí overview

### 3.1 Pure vs project

| Quan sát | Mức |
| --- | --- |
| Không nhắc CIS / Backlog / Jira / `task_transportor` trong body | Tốt |
| `first-doc-change.md` ví dụ “external write phải qua pre-check” — echo pattern CIS nhưng **không gọi tên hệ thống** | Thấp (acceptable generic) |
| `quick-start.md` route thẳng `docs/app/00-context`…`10-decisions` — giả định layout layer chuẩn | Thấp–Trung (convention framework) |

### 3.2 Ownership

- `introduction.md` phân biệt rõ meta / app / theories / packs / decisions / workbench / guide / AGENT_SKILLS.
- Nhấn: guide gom kiến thức chung để layer README không lặp — khớp `documentation-architecture.md`.
- Không nhân bản schema meta.

### 3.3 Điều hướng

Chuỗi đọc README gốc ↔ folder và handoff nội bộ `quick-start` đã khớp (GS-01/GS-02 đã remediate, gỡ khỏi finding).

### 3.4 Portability

- Path `docs/app/<layer>/README.md` portable trong framework layer `00–10`.
- Không embed npm script.
- Temporary content: “đọc policy local của project” — đúng DEC-001.

### 3.5 Completeness

| Hứa | Thực tế |
| --- | --- |
| Ba bước đọc | Có đủ 3 file nội dung + README |
| Không học hết layer | Đúng — `quick-start` phân nhánh theo mục đích |

### 3.6 Chất lượng / mâu thuẫn

- Không mojibake rõ.
- `introduction.md` bảng folder liệt kê `docs/app/10-decisions/` riêng khỏi `docs/app/` — hơi dư nhưng giúp người mới.
- Link nội bộ tương đối ổn.

## 4. Finding còn mở

Không còn finding mở trong folder này. GS-01/GS-02/GS-03 đã remediate và gỡ khỏi bảng.

## 5. Điểm mạnh

1. Ngắn, actionable, đúng “getting started”.
2. Phân tách “hiểu app” vs “hiểu docs system”.
3. Temporary lifecycle được đẩy về project — không vi phạm DEC-001.
4. `introduction` giải thích *tại sao* guide tồn tại (giảm phình layer README) — giá trị cao cho người mới.

## 6. Verdict folder

**Đạt mục tiêu** đường vào nhanh. Không còn finding mở. Nội dung sạch project name; portable ở mức framework.
