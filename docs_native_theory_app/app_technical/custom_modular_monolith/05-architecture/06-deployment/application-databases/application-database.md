# ApplicationDatabase

| Field | Value |
|-------|-------|
| **name** | ApplicationDatabase |
| **layer** | `05-architecture` |
| **concern** | `06-deployment` |
| **folder** | `application-databases/` |
| **ID pattern** | `ADB-{NNN}-{slug}` |

## meaning

Database phục vụ một application hoặc một deployable, nơi nhiều module có thể cùng dùng engine nhưng không vì thế mà chia sẻ ownership.

## use when

Khi cần nói rõ:

- app có một database chung;
- database đó thuộc phạm vi deployable nào;
- ownership state bên trong vẫn tách theo module.

## role in the structure

- Cầu nối giữa deployment topology và data ownership model.
- Giúp tránh nhầm giữa `cùng DB` và `cùng owner`.
- Là concept rất đặc trưng của custom modular monolith pragmatic.

## notes

- Không thay `DataStore` ở `06-technical`; `DataStore` nói về persistence mechanism kỹ thuật hơn.
- `ApplicationDatabase` nói ở mức kiến trúc và phạm vi ownership của monolith.
