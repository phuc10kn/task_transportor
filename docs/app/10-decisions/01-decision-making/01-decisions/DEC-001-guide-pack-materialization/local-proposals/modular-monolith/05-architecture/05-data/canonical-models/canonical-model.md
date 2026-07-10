# CanonicalModel

| Field | Value |
|-------|-------|
| **name** | CanonicalModel |
| **layer** | `05-architecture` |
| **concern** | `05-data` |
| **folder** | `canonical-models/` |
| **ID pattern** | `CM-{NNN}-{slug}` |

## meaning

Mô hình dữ liệu nội bộ mà application dùng làm shape hội tụ chung giữa inbound, review, manual edit và outbound.

## use when

Khi cần nói về:

- shape dữ liệu nội bộ ổn định của app;
- lý do không map trực tiếp external system A sang external system B;
- relationship giữa canonical state, snapshot và read model.

## role in the structure

- Bổ sung cho `CanonicalState`: state nói ai sở hữu, model nói app đang hội tụ về shape dữ liệu nào.
- Giúp giải thích vì sao canonicalization tồn tại như một bước kiến trúc riêng.
- Hữu ích cho pattern `System A -> canonical hub -> System B` hoặc bất kỳ flow nào cần shape hội tụ chung.

## notes

- Không phải schema bảng chi tiết.
- Không phải chỉ một DTO hay một file code.
- Project ghi evidence về canonical shape cụ thể trong architecture/data docs local.
