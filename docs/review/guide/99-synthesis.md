# Tổng Hợp Review — `docs/guide`

Ngày cập nhật: 2026-07-12  
Đầu vào: [00-overview.md](00-overview.md) + review 6 folder cấp 1 + [../workflows/all.md](../workflows/all.md)

## Remediations đã làm (lịch sử)

Finding guide-folder đã remediate được gỡ khỏi bảng “còn mở” trong từng file `0x-*.md`. Chi tiết lịch sử remediation nằm ở các file folder và §4 của [../workflows/all.md](../workflows/all.md).

## Finding còn mở

### Trong `docs/review/guide/`

| ID | Severity | Nơi giữ |
| --- | --- | --- |
| US-05 | Thấp | [04-unit-structure.md](04-unit-structure.md) — path rút gọn thiếu prefix `docs/meta/` |
| — | Thấp | [06-examples.md](06-examples.md) — `reference/README` không link examples |

Không còn finding Cao/Trung/một phần của remediation overview guide-folder còn mở.

### Trong `docs/review/workflows/` (còn mở / một phần)

Xem bảng hiện hành ở [../workflows/all.md §6](../workflows/all.md):

- WFP-06, WFP-07 (một phần)
- WFP-08, WFP-09 (Trung)

WFP-02 đã đóng bằng `sync-product-change`. WFP-03 đã đóng bằng generic docs-contract verifiers.

## Ngoài scope / không đụng

- Nội dung `docs/meta/**` (trừ không đụng)
- App truth / DEC body
- Gộp hoặc xóa cây `variants/` vs `packs/variants/` (chỉ làm rõ docs)
- Body-link navigation `docs/app`/`docs/meta` và product activation profile (xem workflows review)
