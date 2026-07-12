# Review Guide — Index

Ngày cập nhật: 2026-07-12  
Phạm vi: toàn bộ `docs/guide/` theo `README.md` và 6 folder con cấp 1.

## Cách đọc (bắt buộc)

1. Đọc **[00-overview.md](00-overview.md)** trước — chốt vai trò, boundary DEC-001, luồng chuẩn, finding còn mở.
2. Dùng context đó để đọc từng folder:
   - [01-getting-started.md](01-getting-started.md)
   - [02-concepts.md](02-concepts.md)
   - [03-workflows.md](03-workflows.md) — snapshot; finding sâu ở [../workflows/all.md](../workflows/all.md)
   - [04-unit-structure.md](04-unit-structure.md)
   - [05-reference.md](05-reference.md)
   - [06-examples.md](06-examples.md)
3. Đọc **[99-synthesis.md](99-synthesis.md)** để hợp nhất finding còn mở.

## Phân biệt với review chung

| Artifact | Vai trò |
| --- | --- |
| `docs/review/review.md` | Finding/open question còn hiệu lực của documentation system (cross-cutting) |
| `docs/review/guide/` | Review chuyên sâu cấu trúc và chất lượng `docs/guide/` |
| `docs/review/workflows/` | Review tính thực dụng workflow + ví dụ Business CIS |

Review guide **không** thay source of truth; không tự tạo schema/relation/decision. Finding đã đóng được gỡ khỏi bảng; finding một phần/còn mở được giữ.

## Snapshot nhanh

| Folder | Verdict ngắn | Finding còn mở |
| --- | --- | --- |
| getting-started | Đạt | Không |
| concepts | Nền tảng sạch | Không |
| workflows | Core flow có validate | Xem [../workflows/all.md](../workflows/all.md) |
| unit-structure | Đạt | US-05 (Thấp) |
| reference | Mạnh | Không |
| examples | Đúng vai trò | Không (Thấp: reference không link examples) |

Chi tiết: [99-synthesis.md](99-synthesis.md).
