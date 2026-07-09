# Review Cross-Layer Relationship

File này review catalog cross-layer sau đợt cleanup theo rule:

- relation có `Meaning = Không` hoặc `Meaning = Một phần` đã bị loại khỏi active docs;
- relation không còn là `cross-layer active` đã bị loại khỏi catalog cross-layer;
- các slot, valid triple, relation type file và index liên quan đã được dọn theo.

## Phạm vi

- `docs/meta/03-rules/cross-layer/valid-triples.md`
- relation type file còn active trong `docs/meta/02-relation-types/cross-layer/`
- `relations_template` của source entity type tương ứng
- rà `docs/app/**` để tìm frontmatter `relations:`

Lưu ý:

- Review này đánh giá tầng governance.
- Hiện `docs/app` vẫn có `0` entity instance dùng frontmatter `relations:` canonical.

## Catalog Cross-Layer Active Hiện Tại

| Source | Relation | Target |
| --- | --- | --- |
| BusinessRequirement | `derived_from` | Problem |
| Persona | `maps_from` | Stakeholder |
| UserFlow | `implements` | UseCase |
| Feature | `exposed_via` | Screen |
| Invariant | `refined_from` | BusinessRule |
| DomainConcept | `specializes` | GlossaryTerm |

## Tiêu chí đánh giá

1. `Meaning` đủ sắc để biết khi nào edge được phép tồn tại.
2. `Direction` bám fact gốc, không lưu mirror chỉ để đọc ngược.
3. `Governance` đầy đủ:
   - relation type file không còn placeholder;
   - có `inverse kind` khi file đã ở chuẩn hiện tại;
   - nếu khai inverse thật thì inverse relation phải tồn tại thật.
4. `Placement` đúng:
   - triple cross-layer chỉ nằm ở `docs/meta/03-rules/cross-layer/valid-triples.md`.
5. `Active-ready` đúng:
   - source entity type có slot trong `relations_template`;
   - target entity type tồn tại thật.

## Ma Trận Đánh Giá

| Relation | Triple hiện có | Meaning | Direction | Governance | Placement | Active-ready | Kết luận |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `derived_from` | `BusinessRequirement --derived_from--> Problem` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `maps_from` | `Persona --maps_from--> Stakeholder` | Đạt | Đạt | Không | Đạt | Đạt | Đạt một phần |
| `exposed_via` | `Feature --exposed_via--> Screen` | Đạt | Đạt | Không | Đạt | Đạt | Đạt một phần |
| `refined_from` | `Invariant --refined_from--> BusinessRule` | Đạt | Đạt | Không | Đạt | Đạt | Đạt một phần |
| `specializes` | `DomainConcept --specializes--> GlossaryTerm` | Đạt | Đạt | Không | Đạt | Đạt | Đạt một phần |
| `implements` | `UserFlow --implements--> UseCase` | Đạt | Một phần | Một phần | Đạt | Đạt | Đạt một phần |

## Kết luận nhanh

- `derived_from` là relation cross-layer sạch nhất ở trạng thái hiện tại.
- Năm relation còn lại đã qua được bộ lọc `Meaning`, nhưng chưa sạch về governance hoặc direction doctrine.
- Cleanup vừa rồi đã làm catalog cross-layer gọn lại, chỉ còn các edge có semantic đủ mạnh để tiếp tục siết chuẩn.

## Finding Còn Mở

### 1. `maps_from` chưa sạch về inverse governance

Hiện `Persona --maps_from--> Stakeholder` vẫn dùng file relation type có inverse `maps_to`, nhưng inverse này chưa có relation definition thật.

Tác động:

- relation còn dùng được ở mặt meaning;
- nhưng catalog chưa self-consistent.

### 2. `exposed_via` chưa sạch về header governance

`Feature --exposed_via--> Screen` vẫn là edge có nghĩa rõ, nhưng file relation type chưa theo chuẩn header mới một cách đầy đủ.

Tác động:

- dùng được ở mức semantic;
- chưa đủ gọn để làm mẫu chuẩn cho relation type file khác.

### 3. `refined_from` chưa sạch về inverse governance

`Invariant --refined_from--> BusinessRule` giữ được provenance hợp lý, nhưng inverse `refines` chưa có relation definition thật.

Tác động:

- meaning ổn;
- family governance chưa khép kín.

### 4. `specializes` chưa sạch về inverse governance

`DomainConcept --specializes--> GlossaryTerm` đang là edge cross-layer vocabulary mạnh nhất còn lại, nhưng inverse `generalized_by` chưa có relation definition thật.

Tác động:

- trace hiện còn dùng được;
- catalog relation vẫn chưa hoàn toàn strict.

### 5. `implements` còn mở ở direction doctrine

`UserFlow --implements--> UseCase` được giữ lại sau cleanup, nhưng direction doctrine vẫn chưa thật sự chốt kín:

- relation này có đang là fact gốc tốt nhất cho `product -> interface` không;
- hay sau này cần một doctrine rõ hơn giữa `implements` và các relation realization khác.

## Trạng Thái Vận Hành

Ở tầng meta:

- valid triple cross-layer đã được dọn theo rule mới;
- source slot không còn tham chiếu relation đã loại;
- relation type file đã loại đã được gỡ khỏi catalog active.

Ở tầng instance:

- chưa có `relations:` canonical trong `docs/app`;
- vì vậy chưa thể xác nhận khả năng query graph bằng instance relation thật.
