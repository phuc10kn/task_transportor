# BoundaryTier

| Field | Value |
|-------|-------|
| **name** | BoundaryTier |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `boundary-tiers/` |
| **ID pattern** | `BT-{NNN}-{slug}` |

## meaning

Mức access chuẩn dùng để phân loại cross-module access theo độ nhạy và mục đích kiến trúc.

## use when

Khi cần object hóa các tier như:

- Tier 0 cross-module write
- Tier 1 orchestration read
- Tier 2 reporting read-only
- Tier 3 outbound snapshot read-only
- Tier 4 presentation composition

## role in the structure

- Là nền để `ReadAllowlist` có thể tham chiếu một tier rõ ràng.
- Giúp review boundary không chỉ bằng prose, mà bằng vocabulary ổn định.
- Cho phép các repo khác reuse cùng mô hình tier mà không phải viết lại từ đầu.

## notes

- Type này không thay thế `ReadAllowlist`; nó là vocabulary đứng sau allowlist.
- Tier không tự cho quyền truy cập; allowlist cụ thể mới cho quyền.
