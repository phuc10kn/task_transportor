# Rules — Cấu Trúc Plan Bắt Buộc

## Mục đích

File này khóa cấu trúc filesystem và vị trí canonical cho mọi plan nhiều phase trong `docs/plans/`. `planner.md`, `coordinator.md` và `executor.md` phải đọc file này trước khi thao tác plan.

Không tự tổ chức thêm folder/file. Chỉ khác cấu trúc này khi user yêu cầu rõ một cấu trúc khác trong task hiện tại.

## Quy tắc thông báo prompt trước khi thao tác

Khi user yêu cầu tạo, review, điều phối hoặc triển khai một plan, sau khi đọc đủ file để xác định routing nhưng trước khi bắt đầu sửa file, chạy verify hoặc thực thi phase, phải in đúng một dòng visible trong `commentary` để xác nhận prompt đang dùng.

Format bắt buộc:

```text
Đang dùng <planner.md|coordinator.md|executor.md> — <current phase hoặc plan path> — lý do: <lý do chọn prompt>.
```

Ví dụ:

```text
Đang dùng planner.md — plan project-translation-glossary — lý do: contract còn thiếu và cần chỉnh plan.
Đang dùng coordinator.md — current phase TGL-00 — lý do: cần xác định dependency và handoff.
Đang dùng executor.md — current phase TGL-00 — lý do: phase đã mở, dependency pass và target artifacts đã rõ.
```

Luật bắt buộc:

- Không được in `executor.md` nếu current phase, dependency hoặc target artifacts chưa được xác nhận từ plan files.
- Không được bắt đầu mutation, verify phase hoặc tick checklist trước dòng thông báo này.
- Nếu phát hiện plan chưa đủ rõ sau khi đã routing, phải in `planner.md` và dừng để sửa plan; không tự chuyển sang executor.
- Dòng thông báo là status line, không thay thế handoff, blocked state hoặc `Kết quả thực hiện` canonical.

## Cây thư mục canonical

```text
docs/plans/<plan-slug>/
├── README.md
├── 00-overview.md
├── 01-phases/
│   ├── <PHASE-ID>-<phase-slug>.md
│   └── ...
└── 02-coordination.md
```

Luật cứng:

- Overview chỉ có một file `00-overview.md`; không tạo folder `00-overview/`.
- Coordination chỉ có một file `02-coordination.md`; không tạo folder `02-coordination/`.
- Mỗi phase là đúng một file trực tiếp trong `01-phases/`; không tạo folder con cho phase.
- Không tạo `01-phases/README.md`; bảng `## Phase triển khai` trong root `README.md` là phase index/dependency map duy nhất.
- Không tạo file gaps, risks, handoff hoặc target-design riêng; gộp vào overview hoặc coordination theo ownership bên dưới.
- Không lặp current phase, blocked snapshot hoặc accepted gaps ở nhiều file.

## Ownership từng file

### `README.md`

Root summary và routing, bắt buộc có:

- `## Mục tiêu`
- `## Phạm vi`
- `## Baseline hiện tại`
- `## Source of truth`
- `## Phase triển khai`
- `## Điều phối` — chỉ link tới `02-coordination.md`, không chép snapshot
- `## Checklist nghiệm thu tổng`
- `## Điều kiện hoàn thành`

`## Phase triển khai` phải chứa thứ tự, dependency và link trực tiếp tới từng phase file; không lặp phase index ở nơi khác.

### `00-overview.md`

Gộp toàn bộ context chi tiết:

- mục tiêu nghiệp vụ;
- in scope/out of scope;
- quyết định đã khóa;
- baseline/evidence;
- source precedence;
- target design/data/API/UI;
- migration/cutover;
- architecture decision.

### `01-phases/<PHASE-ID>-<phase-slug>.md`

Mỗi file phase bắt buộc có:

- `## Mục tiêu`
- `## Artifact mục tiêu`
- `## Điều kiện mở phase`
- `## Công việc`
- `## Checklist nghiệm thu`
- `## Kết quả thực hiện`

`Kết quả thực hiện` để trống khi planning. Sau execution chỉ dùng:

- `No-change: <path> - <lý do ngắn>`
- `Fix tối thiểu: <path> - <phạm vi ngắn>`
- `In-progress: <phase id> - <đã xong> | Next: <việc tiếp theo>`

### `02-coordination.md`

Đây là source duy nhất cho trạng thái điều phối. Bắt buộc có:

```text
## Quy ước điều phối
### Handoff hiện tại
### Trạng thái blocked
### Accepted gaps
### Quy tắc resume
```

Risk triggers, automated/manual acceptance và release condition cũng gộp trong file này. Không tạo file handoff/gaps/risks khác.

## Quy tắc thay đổi cấu trúc

- Plan cũ khác cấu trúc phải được flatten khi user yêu cầu sửa/review plan đó.
- Di chuyển nội dung trước, cập nhật mọi link, rồi xóa file/folder cũ.
- Không giữ compatibility stub hoặc duplicate file sau khi move.
- Self-review phải dùng `rg --files <plan-dir>` để chứng minh cây cuối đúng contract.
