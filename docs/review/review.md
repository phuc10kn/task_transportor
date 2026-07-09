# Review Graph Docs - Phần Chưa Chắc Chắn

File này chỉ giữ các điểm hiện vẫn chưa đủ chắc để coi là canonical sau đợt cleanup relation.

## Nguyên tắc đọc file này

- Đây là review artifact, chưa phải plan triển khai.
- Không đổi relation chỉ vì tên nghe chưa đẹp.
- Chỉ sửa khi đã chốt fact gốc, query intent và canonical direction.

## 1. Mirror / Passive Direction Chưa Chốt Hết

| Nhóm | Relation đang có | Điều cần xác nhận |
| --- | --- | --- |
| Business composition | `Scenario --composes--> Process` và `Process --part_of--> Scenario` | Giữ container -> member hay cần cả hai vì semantic khác nhau? |
| Domain composition | `Aggregate --contains--> DomainEntity` và `DomainEntity --member_of--> Aggregate` | `member_of` có chỉ là inverse lookup không? |
| Architecture flow | `Module --participates_in--> InteractionFlow` và `InteractionFlow --involves--> Module` | Flow nên là fact gốc hay module participation là fact riêng? |
| Architecture governance | `Module --governed_by--> ModuleBoundary` | `governed_by` ở architecture là semantic riêng hay passive relation nên thay bằng boundary/rule -> target? |
| Domain usage | `ValueObject --used_by--> DomainEntity` | Đây là direction canonical thật hay inverse của relation kiểu `DomainEntity --uses--> ValueObject`? |
| Business direction | `Problem --motivates--> Goal` và `Goal --addresses--> Problem` | Một fact hay hai fact độc lập? |
| Business measurement | `Goal --measured_by--> SuccessCriterion` và `SuccessCriterion --validates--> Goal` | Một fact hay hai fact độc lập? |

## 2. Relation Còn Mở Về Meaning Hoặc Governance

| Relation | Usage đáng chú ý | Vấn đề còn mở |
| --- | --- | --- |
| `affects` | `Problem --affects--> Stakeholder`, `CrossCuttingRule --affects--> Module` | Business impact đã rõ hơn, nhưng technical/architecture impact vẫn có thể quá rộng. |
| `uses` / `used_by` | Product/domain/implementation candidate usage | Cần phân biệt dependency, runtime usage, API usage, data usage và inverse lookup. |
| `participates_in` / `involves` | Business process và architecture flow | Cần xác nhận khi nào participant là fact gốc, khi nào flow là fact gốc. |
| `implements` | `Feature --implements--> Capability`, `UserFlow --implements--> UseCase` | Direction concrete → abstract đang được ghi, nhưng scope chỉ product/UI hay còn technical/implementation conformance vẫn chưa chốt. |

## 3. App Instance Relations Chưa Query Được Chắc

Điểm chưa xác nhận:

- `docs/app` hiện vẫn chủ yếu dựa vào prose/link như `Related Entities`;
- chưa có bằng chứng graph query chạy chủ yếu từ YAML `relations:` thay vì text search;
- chưa xác nhận entity instance ưu tiên nào sẽ được promote sang canonical relation trước.

## 4. Promotion Từ Template/Candidate

`docs/app_variants/raw_app_original/` là universal origin model. `docs/app_variants/custom_modular_monolith/` giữ template phụ thuộc methodology; type/relation ở đây chỉ promote khi meaning và canonical usage đã được chốt.

Điểm còn mở:

- relation type mới như `deploys_to` và `plans_capacity_for` đã có vocabulary, nhưng chưa có active meta valid usage;
- vẫn cần cơ chế rõ để promote template/candidate từ raw origin hoặc methodology template vào meta canonical.

## 5. Checklist Trước Khi Sửa Tiếp

- [ ] Chốt relation nào là mirror/passive và relation nào có semantic độc lập (còn lại: business/domain/architecture duals).
- [ ] Chốt scope semantic của `implements` sau direction concrete → abstract.
- [ ] Chốt bộ relation meaning ưu tiên cần siết tiếp.
- [ ] Chốt cơ chế promote relation từ raw origin hoặc methodology template sang canonical docs.
- [ ] Chốt chiến lược migrate `Related Entities` sang YAML `relations:`.
