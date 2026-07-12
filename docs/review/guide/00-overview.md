# Review Tổng Quan — `docs/guide`

Ngày: 2026-07-12  
Phạm vi: `docs/guide/README.md` + cấu trúc cấp 1 + mọi entry point được README hứa hẹn  
Cách đọc review này: đọc file này trước; các file folder con dùng context đã chốt ở đây.

## 1. Vai trò được tuyên bố

Theo `docs/guide/README.md`, guide là:

- **manual xuyên dự án** để đọc / viết / validate / evolve hệ tài liệu;
- **bản đồ điều hướng**, không thay source of truth active;
- nơi giữ **reusable pack** tại `reference/entity-maps/packs/`.

Guide trả lời: bắt đầu từ đâu; phân biệt app/meta/theories/workbench/pack; đặt knowledge mới ở đâu; khi nào cần relation/theory/decision/workbench; trace impact; slim layer README.

## 2. Boundary đã chốt (context cho mọi review con)

| Nội dung | Canonical home | Guide được phép |
| --- | --- | --- |
| Luật documentation system | `docs/meta/` | Giải thích + link, không nhân bản SoT |
| App truth | `docs/app/` | Route + ví dụ có nhãn, không giữ graph project |
| Theory | `docs/theories/` | Mô hình khi nào dùng theory |
| Universal taxonomy / concern | `packs/universal/` | Stable reusable |
| Methodology template | `packs/variants/` | Stable reusable theo style |
| Workbench | `docs/workbench/` | Conceptual model + conditional workflow; local activation/policy thuộc project |
| Agent checklist | `docs/AGENT_SKILLS/` | Ngoài guide manual |

Khớp DEC-001: guide **không** quản lý migration / adoption / lifecycle / divergence / provenance / evidence / canonical graph của `task_transportor`.

## 3. Inventory cấp 1 thực tế

```text
docs/guide/
├── README.md                 ← entry tổng
├── getting-started/          4 md
├── concepts/                 8 md
├── workflows/                7 md
├── unit-structure/           8 md
├── reference/              110 md   (chiếm phần lớn khối lượng)
└── examples/                 4 md
```

| Folder | Vai trò theo README gốc | Khớp cấu trúc? |
| --- | --- | --- |
| `getting-started/` | Đường vào nhanh người mới | Có |
| `concepts/` | Mô hình nền | Có |
| `workflows/` | Cách làm việc | Có |
| `unit-structure/` | Template YAML/Markdown unit | Có |
| `reference/` | Bảng tra + reusable packs | Có; khối lượng lớn cần review riêng |
| `examples/` | Ví dụ thật theo repo | Có; README tự nhận project-specific |

**Không có** folder cấp 1 “lạ” ngoài bảng README. Không thiếu folder được hứa.

## 4. Luồng vận hành chuẩn — đánh giá

README hứa 4 bước mặc định:

1. `workflows/read-for-task.md`
2. `workflows/write-docs.md`
3. `workflows/trace-impact.md`
4. `workflows/slim-layer-readme.md`

Điều phối chi tiết tại `workflows/README.md#luồng-tổng`.

| Kiểm tra | Kết quả |
| --- | --- |
| File tồn tại | Tất cả có |
| Workbench bị loại khỏi luồng mặc định | Cập nhật: conditional core khi undetermined-placement + local activation |
| Anchor `#luồng-tổng` | Heading thực tế `## Luồng Tổng` — rủi ro case-sensitive trên một số renderer |
| Nội dung khớp vai trò | Mạnh: mỗi workflow có gate/output cụ thể |

## 5. “Cách đọc nhanh” — đánh giá điều hướng

### 5.1 Nhánh mới vào repo

| # | Target | Tồn tại | Khớp vai trò |
| --- | --- | --- | --- |
| 1 | `getting-started/` (đủ quick-start → introduction → first-doc-change) | Có | Có — handoff từ README gốc |
| 2 | `concepts/documentation-architecture.md` | Có | Có |
| 3 | `reference/canonical-map.md` | Có | Có — route SoT theo layer/home; không shortcut concern architecture con |
| 4 | `reference/entity-maps/overview.md` | Có | Có (pure/default) |
| 5 | `workflows/read-for-task.md` | Có | Có |

**Gap điều hướng:** Không còn — README gốc bước 1 trỏ [getting-started/](../../guide/getting-started/README.md); `quick-start.md` handoff tiếp `introduction` → `first-doc-change`.

### 5.2 Nhánh chuẩn bị sửa docs

Targets: `folder-map`, `folder-structure`, `unit-structure/README`, `write-docs`, `trace-impact`, `validate-after-change` — khớp Luồng tổng hiện tại. Chi tiết finding workflow còn mở: [../workflows/all.md](../workflows/all.md).

### 5.3 Nhánh cleanup

Targets bắt buộc: `slim-layer-readme`, `layer-readme-template`. Example CIS là optional “xem thêm (không portable)”.

## 6. Nguyên tắc README gốc — kiểm chứng

| Nguyên tắc | Hiện trạng |
| --- | --- |
| Guide giải thích + giữ reusable pack; không thay canonical active | Đúng ở concepts / workflows / packs README |
| Không copy toàn bộ README layer vào guide | Đúng hướng; slim workflow ủng hộ |
| Không quản lý migration/lifecycle/adoption/divergence project | Không thấy DEC-001 migration inventory trong guide |
| Mâu thuẫn với app → ưu tiên app | Được nêu rõ |
| Không định nghĩa temporary-record flow | `validation-and-lifecycle.md`, `status-and-notes.md` khớp |

## 7. Finding còn mở / một phần

Không còn finding overview mở. F-G-01…F-G-06 đã remediate và gỡ khỏi bảng.

Finding workflow còn mở / một phần (WFP-06, WFP-07, WFP-08, WFP-09): xem [../workflows/all.md](../workflows/all.md). WFP-02 và WFP-03 đã đóng.

## 8. Điểm mạnh tổng quan

1. **Phân tầng rõ:** README → concepts → workflows → unit-structure → reference/packs → examples.
2. **Luồng mặc định hẹp và có chủ đích**; workbench không bị nhét vào path chuẩn.
3. **DEC-001 được lặp nhất quán** ở README, packs, status-and-notes, validation-and-lifecycle.
4. **Entity-maps overview** đã tách pure/default khỏi variant (sau cleanup gần đây) — đúng tinh thần “overview = cái chung”.
5. **Không broken link file** trên các target được README gốc trỏ trực tiếp (đã kiểm bằng chứng).

## 9. Context khóa để review folder con

Khi review từng folder, dùng các tiêu chí sau (derive từ tổng quan):

1. **Pure vs project:** nội dung common có bị lẫn app truth / CIS / modular-monolith vocabulary không?
2. **Ownership:** file có đang nhân bản SoT của meta/app không?
3. **Điều hướng:** link nội bộ có khớp README folder và README gốc không?
4. **Portability:** guide có giả định tooling/path chỉ đúng `task_transportor` không?
5. **Pack boundary:** universal vs variants có bị lẫn không?
6. **Examples:** có nhãn project-specific rõ khi được dùng từ luồng generic không?

## 10. File review tiếp theo

| File | Folder |
| --- | --- |
| [01-getting-started.md](01-getting-started.md) | `getting-started/` |
| [02-concepts.md](02-concepts.md) | `concepts/` |
| [03-workflows.md](03-workflows.md) | `workflows/` |
| [04-unit-structure.md](04-unit-structure.md) | `unit-structure/` |
| [05-reference.md](05-reference.md) | `reference/` |
| [06-examples.md](06-examples.md) | `examples/` |
| [99-synthesis.md](99-synthesis.md) | Tổng hợp sau khi đủ 6 folder |

Index: [README.md](README.md).
