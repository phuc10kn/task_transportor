# OwnerApiCapability

| Field | Value |
|-------|-------|
| **name** | OwnerApiCapability |
| **layer** | `05-architecture` |
| **concern** | `01-structure` |
| **folder** | `owner-api-capabilities/` |
| **ID pattern** | `OAC-{NNN}-{slug}` |

## meaning

Capability công khai mà module expose với tư cách owner của business state hoặc owner của business action tương ứng.

## use when

Khi cần phân biệt:

- capability public thông thường;
- capability có quyền đổi owner state hoặc quyết định business outcome.

## role in the structure

- Giữ rõ owner API trong custom modular monolith.
- Giúp chống lại facade giả hoặc proxy API mờ ownership.
- Tạo cầu nối giữa `Module`, `PublicApiBoundary` và `DataOwnershipBoundary`.

## notes

- Mọi `OwnerApiCapability` là `PublicCapability`, nhưng không phải mọi `PublicCapability` đều là owner capability.
- Evidence về owner action phải được project ghi trong app architecture local, không nằm trong source template này.
