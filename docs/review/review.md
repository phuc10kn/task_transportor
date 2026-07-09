# Review Graph Docs - Phần Chưa Chắc Chắn

File này chỉ giữ các điểm hiện vẫn chưa đủ chắc để coi là canonical sau đợt cleanup relation.

## Nguyên tắc đọc file này

- Đây là review artifact, chưa phải plan triển khai.
- Không đổi relation chỉ vì tên nghe chưa đẹp.
- Chỉ sửa khi đã chốt fact gốc, query intent và canonical direction.

## 1. Mirror / Passive Direction Chưa Chốt Hết

| Nhóm | Relation đang có | Điều cần xác nhận |
| --- | --- | --- |
| Product -> Interface | `UserFlow --implements--> UseCase` | Đây đã là fact gốc đủ tốt cho trace realization chưa, hay còn thiếu doctrine chặt hơn cho relation realization giữa product và interface? |
| Business composition | `Scenario --composes--> Process` và `Process --part_of--> Scenario` | Giữ container -> member hay cần cả hai vì semantic khác nhau? |
| Domain composition | `Aggregate --contains--> DomainEntity` và `DomainEntity --member_of--> Aggregate` | `member_of` có chỉ là inverse lookup không? |
| Architecture flow | `Module --participates_in--> InteractionFlow` và `InteractionFlow --involves--> Module` | Flow nên là fact gốc hay module participation là fact riêng? |
| Architecture governance | `Module --governed_by--> ModuleBoundary` | `governed_by` ở architecture là semantic riêng hay passive relation nên thay bằng boundary/rule -> target? |
| Domain usage | `ValueObject --used_by--> DomainEntity` | Đây là direction canonical thật hay inverse của relation kiểu `DomainEntity --uses--> ValueObject`? |

## 2. Relation Còn Mở Về Meaning Hoặc Governance

| Relation | Usage đáng chú ý | Vấn đề còn mở |
| --- | --- | --- |
| `affects` | `Problem --affects--> Stakeholder`, `CrossCuttingRule --affects--> Module` | Business impact đã rõ hơn, nhưng technical/architecture impact vẫn có thể quá rộng. |
| `specializes` | `DomainConcept --specializes--> GlossaryTerm` | Meaning đủ để giữ lại, nhưng inverse governance vẫn chưa khép kín. |
| `implements` | `UserFlow --implements--> UseCase`, `Feature --implements--> Capability` | Cần chốt rõ doctrine realization giữa các layer để tránh drift semantic. |
| `uses` / `used_by` | Product/domain/implementation candidate usage | Cần phân biệt dependency, runtime usage, API usage, data usage và inverse lookup. |
| `participates_in` / `involves` | Business process và architecture flow | Cần xác nhận khi nào participant là fact gốc, khi nào flow là fact gốc. |

## 3. App Instance Relations Chưa Query Được Chắc

Điểm chưa xác nhận:

- `docs/app` hiện vẫn chủ yếu dựa vào prose/link như `Related Entities`;
- chưa có bằng chứng graph query chạy chủ yếu từ YAML `relations:` thay vì text search;
- chưa xác nhận entity instance ưu tiên nào sẽ được promote sang canonical relation trước.

## 4. App Variants Còn Là Candidate Knowledge

`docs/app_variants` vẫn là khu vực candidate knowledge.

Điểm còn mở:

- relation type mới như `deploys_to` và `plans_capacity_for` đã có vocabulary, nhưng chưa có active meta valid usage;
- vẫn cần cơ chế rõ để promote candidate từ app variant vào app/meta canonical.

## 5. Checklist Trước Khi Sửa Tiếp

- [ ] Chốt relation nào là mirror/passive và relation nào có semantic độc lập.
- [ ] Chốt doctrine cho nhóm realization như `implements`.
- [ ] Chốt bộ relation meaning ưu tiên cần siết tiếp.
- [ ] Chốt cơ chế promote relation từ `docs/app_variants` sang canonical docs.
- [ ] Chốt chiến lược migrate `Related Entities` sang YAML `relations:`.
