# Review - Entity Type Và Flow Tạo Entity

Ngày review: 2026-07-09

## Phạm Vi

File này review docs hiện tại về:

- entity type definition;
- flow tạo entity instance từ entity type;
- relation slot trong `relations_template`;
- canonical home của relation;
- mức độ docs hiện tại đã đủ để agent/người viết tạo entity đúng hay chưa.

File này là review artifact.
Nó không phải source of truth, không phải plan triển khai, và không tự tạo rule mới ngoài `docs/meta`, `docs/guide`, `docs/app`.

## Cách Đọc File Này

- `Finding` chỉ nói điều gì docs hiện tại đã chốt, chưa chốt, hoặc đang gây hiểu lầm.
- `Open question` là câu hỏi thiết kế còn mở; không phải rule đang active.
- Nếu một thứ chưa được ghi trong source of truth, file này không coi nó là rule hiện hành.

## Kết Luận Ngắn

Docs hiện tại đã có khung canonical đúng:

```text
Layer -> Concern -> Entity Type -> Entity Instance
Relation Type -> Valid Triple -> Relation Slot -> Entity Relation
```

Docs hiện tại cũng đã chốt rõ:

```text
requirement_mode = allowed_when_known | required_at_creation
```

Vì vậy, ở trạng thái hiện tại, docs đã đủ để:

- xác định entity type canonical nằm ở đâu;
- xác định relation slot canonical nằm ở đâu;
- reject relation ngoài slot;
- yêu cầu target tồn tại nếu slot là `required_at_creation`;
- ghi relation canonical vào YAML frontmatter thay vì prose body.

Nhưng docs hiện tại vẫn chưa đủ chặt ở các điểm sau:

- chưa có workflow end-to-end đủ sắc để tạo entity từ type một cách nhất quán;
- graph canonical ở `docs/app/05-architecture` chưa materialize từ prose sang YAML;
- decision layer đã có structure, nhưng chưa có decision units thật;
- nhiều entity type canonical còn legacy nên contract chưa đồng đều.

## Snapshot Hiện Tại

### Canonical Entity Type Registry

`docs/meta/01-entity-types/` hiện là registry canonical cho:

```text
00-context -> 05-architecture
```

Hiện có:

- `52` entity type files canonical.
- `52/52` có `relations_template`.
- `17/52` có `schema` field và `## structure extends`.
- `35/52` vẫn ở contract legacy, chủ yếu tại:
  - `00-context`
  - `02-product`
  - `03-interface`
  - `04-domain`

### App Graph Hiện Có

`docs/app/05-architecture` hiện là nơi có app instances thật nhiều nhất.

Hiện có:

- `42` entity instance directories cho `Module`, `ModuleBoundary`, `InteractionFlow`, `StateOwner`, `DataFlow`, `DeploymentUnit`, `CrossCuttingRule`.
- `0` instance có `schema: entity-instance/v1`.
- `0` instance có frontmatter `relations:` canonical.

Điều này nghĩa là app graph thật vẫn đang nằm chủ yếu ở prose/body, chưa materialize thành canonical YAML graph.

### Decision Layer

`docs/app/10-decisions` hiện đã có:

- README truth cho decision layer;
- folder structure chuẩn đã được route trong guide;
- template/unit structure cho decision.

Nhưng hiện chưa có:

- decision instance files thật trong `docs/app/10-decisions/**`.

## Model Đang Active Trong Docs

### 1. Entity Type Canonical Home

Entity type canonical hiện nằm ở:

```text
docs/meta/01-entity-types/**/<entity-type>.md
```

Type `05+` chỉ được ở layer-local trong `docs/app` nếu chưa được promote.
Riêng `05-architecture` common types đã promote sang meta.

### 2. Relation Slot Canonical Home

Relation slot hiện nằm trong:

```text
docs/meta/01-entity-types/**/relations_template
```

Mỗi slot hiện phải nêu:

- slot name;
- relation type;
- target entity type;
- requirement_mode;
- cardinality.

### 3. Requirement Mode Đang Active

Source of truth hiện chỉ chốt hai mode:

- `allowed_when_known`
- `required_at_creation`

Ý nghĩa hiện hành:

- `allowed_when_known`: nếu có fact và target thật thì ghi relation; thiếu không phải lỗi hard.
- `required_at_creation`: nếu relation là identity-critical ở thời điểm tạo, target phải tồn tại trước khi source được tạo canonical.

Docs hiện tại chưa chốt các mode khác như:

- `required_before_active`
- `required_before_release`
- `conditional_one_of`
- `coverage_required`

Nếu cần các mode đó, đó là bài toán thiết kế tiếp theo, không phải rule đang active.

### 4. Entity Relation Canonical Home

Relation instance canonical hiện phải nằm trong:

```yaml
relations:
  <slot-name>:
    - <TARGET-ID>
```

Body `## Relations` chỉ là prose giải thích ngữ cảnh cho người đọc.
Body prose không thay thế canonical graph edge.

### 5. Reverse Query Đang Active

Docs hiện đã chốt:

- reverse query ưu tiên repository search;
- derived inverse;
- index/tooling khi cần.

Không tạo inverse canonical chỉ để đọc ngược.

## Findings

### Finding 1 - Requirement Model Hiện Coherent Nhưng Mới Dừng Ở Hai Mode

Severity: High.

Điểm đúng của docs hiện tại:

- đã bỏ được kiểu `Required=true/false` mơ hồ;
- đã có `requirement_mode`;
- đã có rule rõ cho `required_at_creation`.

Điểm còn thiếu:

- khung hiện hành mới chỉ bao phủ hai nghĩa:
  - relation được ghi khi đã biết;
  - relation bắt buộc tồn tại trước khi tạo canonical instance.

Điều này không sai nếu hệ thống muốn giữ model đơn giản.
Nhưng nếu mục tiêu là quản lý lifecycle chặt hơn, docs hiện tại chưa biểu diễn được các case như:

- relation cần có trước khi chuyển `active`;
- relation chỉ bắt buộc ở `release/readiness`;
- entity cần ít nhất một relation trong một nhóm slot.

Kết luận của finding này không phải là “docs đang sai”.
Kết luận đúng hơn là:

```text
Docs hiện tại đang cố ý tối giản requirement model.
Nó đủ cho create-time identity, nhưng chưa đủ cho status/release gate phức tạp hơn.
```

### Finding 2 - Guide Tạo Entity Mới Có Gate Cơ Bản Nhưng Chưa Thành Workflow End-To-End

Severity: Medium/High.

`docs/guide/workflows/write-docs.md` hiện đã có:

- chọn canonical home;
- chọn schema canonical;
- reject relation ngoài slot;
- check `required_at_creation`;
- check `allowed_when_known`.

Nhưng guide vẫn chưa gom thành một flow đủ liền mạch như:

```text
1. đọc entity type;
2. kiểm tra instance criteria;
3. kiểm tra relation slot nào là required_at_creation;
4. xác nhận target đã tồn tại chưa;
5. tạo frontmatter + body theo structure extends;
6. chỉ ghi relation canonical khi target thật tồn tại;
7. validate lại slot + relation type + valid triple + direction.
```

Vì thiếu một checklist liền mạch như vậy, agent/người viết vẫn có thể:

- tạo entity theo template nhưng quên kiểm tra creation prerequisite;
- hiểu đúng schema nhưng làm sai thứ tự thao tác;
- ghi prose relation mà chưa promote thành canonical edge.

### Finding 3 - Graph Canonical Của App Chưa Materialize Từ Prose Sang YAML

Severity: High.

Đây là gap vận hành lớn nhất hiện tại.

Docs meta và guide đã chốt:

- entity relation canonical nằm ở frontmatter `relations`;
- prose body không thay thế relation canonical.

Nhưng `docs/app/05-architecture` hiện vẫn có:

- instance thật;
- related entities trong body;
- flow/boundary/state ownership được con người hiểu.

Trong khi chưa có:

- `schema: entity-instance/v1`;
- `relations:` canonical.

Hệ quả:

- graph query chưa thể tin cậy hoàn toàn bằng YAML;
- chưa phân biệt được confirmed edge với prose-only relation;
- trace impact tự động vẫn thiếu nền materialized graph.

### Finding 4 - Contract Của Entity Type Canonical Chưa Đồng Đều

Severity: Medium.

Hiện tất cả canonical entity types đã có `relations_template`, nên phần relation slot model đã đi đúng hướng.

Nhưng contract vẫn chưa đồng đều vì:

- chỉ `17/52` file có `schema`;
- chỉ `17/52` file có `## structure extends`.

Điều này có nghĩa:

- relation slot model đã canonical hóa khá tốt;
- nhưng create contract của entity instance vẫn chưa đồng đều giữa các layer.

Đây là lý do người viết có thể biết:

```text
entity này được phép nối relation nào
```

nhưng vẫn chưa biết đủ chắc:

```text
entity này phải có section nào khi được tạo instance
```

### Finding 5 - Decision Layer Đã Có Structure, Nhưng Chưa Có Decision Units

Severity: Medium.

Docs hiện tại đã có:

- folder structure cho `10-decisions`;
- README truth cho decision layer;
- unit template và schema decision.

Như vậy, bài toán hiện tại không còn là “thiếu structure”.
Gap thật sự là:

- chưa có decision unit files thật;
- `decision_basis` trong entity schema chưa có target instance ổn định để trace tự động;
- decision impact hiện vẫn chủ yếu là prose/table-level, chưa thành unit graph.

### Finding 6 - Layers 06-09 Vẫn Đang Ở Trạng Thái Template/README-Level

Severity: Medium.

Đối với mục tiêu “tạo entity từ entity type”, layers `06-technical` đến `09-operation` hiện chưa active theo nghĩa graph vận hành:

- app layer chủ yếu vẫn là README truth;
- nhiều type nằm ở `docs/app_variants/custom_modular_monolith`;
- chưa có app instance thật cho các layer này.

Điều này không mặc định là lỗi.
Nó chỉ có nghĩa rằng:

```text
Flow tạo entity hiện tại mới vận hành thật mạnh nhất ở 05-architecture.
```

Nếu dự án muốn dùng entity graph sâu cho technical/implementation/quality/operation, docs hiện tại chưa materialize tới mức đó.

## Open Questions

Đây là các câu hỏi thiết kế còn mở.
Chúng không phải rule đang active.

### 1. Có Giữ Requirement Model 2-Mode Hay Mở Rộng Không

Câu hỏi thật sự là:

```text
allowed_when_known + required_at_creation đã đủ cho docs system này chưa?
```

Nếu chưa đủ, cần chốt rõ:

- mở thêm mode nào;
- mode nào là canonical;
- mode nào chỉ là idea nhưng chưa active.

### 2. Những Slot Nào Là Candidate Đầu Tiên Nếu Muốn Siết Chặt

Nếu sau này muốn tăng độ chặt, các candidate tự nhiên nhất hiện tại là:

- `AcceptanceCriterion.accepts_*`
- `UIState.displayed_on`
- `DataFlow.moves`
- `DeploymentUnit.hosts`
- `Lifecycle.describes`

Nhưng hiện tại, docs chưa chốt rằng các slot này phải dùng mode nào ngoài `allowed_when_known`.

### 3. Khi Nào Nên Materialize Decision Units

Hiện có đủ structure để làm.
Câu hỏi còn lại là timing:

- decision table trong README đã đủ cho giai đoạn này chưa;
- hay đã đến lúc tạo decision unit thật để `decision_basis` trace được chắc hơn.

### 4. Khi Nào Nên Promote 06-09 Thành Active Graph

Layers `06-09` hiện vẫn hợp lệ ở dạng README + variant template.
Open question là:

- khi nào cần promote type thật;
- khi nào cần app instance thật;
- và layer nào cần trước để phục vụ implementation/quality/operation reasoning.

## Kết Luận

Nếu chỉ bám docs hiện tại, rule an toàn nhất khi tạo entity là:

```text
1. Chọn đúng entity type canonical.
2. Kiểm tra instance criteria trước khi tạo.
3. Chỉ ghi relation khi slot hợp lệ, direction đúng, target instance thật tồn tại.
4. Nếu slot là required_at_creation, target phải có trước khi source được tạo canonical.
5. Ngoài hai requirement mode active hiện tại, không tự suy ra gate mới.
```

Vấn đề chính của docs hiện nay không còn là “thiếu meta model”.
Vấn đề chính là:

- flow tạo entity chưa được hướng dẫn đủ sắc;
- graph app thật chưa được materialize thành canonical YAML;
- một số layer/unit vẫn chưa được đưa vào vận hành ở mức entity graph.
