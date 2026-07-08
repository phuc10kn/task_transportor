# Review Quan Hệ Graph Trong Docs

## Phạm vi

Review này tập trung vào quan hệ canonical trong hệ thống docs:

- `docs/meta/01-entity-types/**`
- `docs/app/05-architecture/**/<entity-type>.md`
- `docs/meta/02-relation-types/**`
- `docs/meta/03-rules/**/valid-triples.md`
- entity instance hiện có trong `docs/app/**`

Mục tiêu là đánh giá liệu graph hiện tại có đủ tốt để:

- query;
- truy cứu;
- tra cứu;
- xét phạm vi ảnh hưởng;
- chống AI tự tạo quan hệ mơ hồ;
- giữ relation strict theo entity type, relation type và valid triple.

Review này không sửa governance, không đổi relation, không thay app docs.

## Kết Luận Ngắn

Graph hiện tại đã tốt hơn sau khi bỏ pseudo target như `entities` và `layers/entities`, đồng thời đã dọn xong nhóm target entity type chưa có definition thật trong canonical relation của architecture. Tuy vậy, graph vẫn chưa đủ chắc để vận hành impact query tự động.

Vấn đề chính không còn là thiếu relation type hoặc thiếu valid triple. Vấn đề chính còn lại là:

- một số relation đang là mirror hoặc passive direction của cùng một fact;
- nhiều relation type có meaning quá placeholder;
- một số verb quá rộng làm impact query dễ trả kết quả nhiễu;
- `docs/app` hiện mới có nhiều `Related Entities` dạng prose/link, chưa có YAML `relations:` canonical.

## Số Liệu Kiểm Tra

| Hạng mục | Kết quả | Nhận xét |
| --- | ---: | --- |
| Active `relations_template` rows | 88 | Đây là số slot relation đang được entity type cho phép sau khi dọn nhóm target undefined. |
| Missing relation type | 0 | Relation type đều tồn tại. |
| Missing valid triple | 0 | Slot đều có valid triple tương ứng. |
| Pseudo target còn lại | 0 | Không còn `entities`, `layers/entities`, `_any Entity_`, `_layer / entity_`. |
| Target entity type chưa có definition thật | 0 | Nhóm Finding 1 đã được xử lý trong canonical relation scope. |
| Valid triple duplicate giữa layer file và `cross-layer` | 15 | Mức nghiêm trọng Medium. |
| Relation types không còn valid triple | 0 | Các relation type mất toàn bộ usage đã được loại bỏ trong scope Finding 1. |
| Residual valid triple không có template | 2 | `Decision --supersedes--> Decision`, `Module --depends_on--> Module`; đây là reserved rule ngoài scope Finding 1. |
| Relation type meaning còn dạng placeholder | 56/75 | Mức nghiêm trọng Medium. Sau cleanup đã xoá 3 relation type không còn usage. |
| App instance có YAML `relations:` canonical | Chưa thấy trong scan | Graph instance chưa query tự động tốt. |

## Thang Rating

| Rating | Ý nghĩa |
| --- | --- |
| Critical | Làm graph sai về mặt model, tạo edge không thể validate hoặc gây hiểu nhầm nền tảng. |
| High | Graph vẫn pass cấu trúc nhưng query impact/tracing dễ sai hoặc không thể strict. |
| Medium | Graph dùng được nhưng semantic/gov chưa đủ rõ, dễ sinh lỗi khi mở rộng. |
| Low | Chủ yếu là wording, consistency hoặc tài liệu tham chiếu chưa mượt. |

## Finding 1 - Target Entity Type Chưa Có Definition Thật

Trạng thái: Đã xử lý trong canonical relation scope.

Rule đã chốt: target trong `relations_template` phải là entity type canonical thật. Nhóm slot target chưa có definition thật đã được loại bỏ khỏi `relations_template`, `valid-triples` và relation type docs liên quan.

Đã loại bỏ các relation sau:

| Source | Relation | Target đã loại bỏ | File |
| --- | --- | --- | --- |
| `CrossCuttingRule` | `refined_in` | `CodingRule` | `docs/app/05-architecture/07-cross-cutting/cross-cutting-rules/cross-cutting-rule.md` |
| `ModuleBoundary` | `refined_in` | `CodingRule` | `docs/app/05-architecture/02-boundaries/module-boundaries/module-boundary.md` |
| `DataFlow` | `stored_on` | `DataStore` | `docs/app/05-architecture/05-data/data-flows/data-flow.md` |
| `InteractionFlow` | `implemented_by` | `ExecutionMechanism` | `docs/app/05-architecture/03-interactions/interaction-flows/interaction-flow.md` |
| `DataFlow` | `crosses` | `Interface` | `docs/app/05-architecture/05-data/data-flows/data-flow.md` |
| `InteractionFlow` | `uses` | `Interface` | `docs/app/05-architecture/03-interactions/interaction-flows/interaction-flow.md` |
| `DeploymentUnit` | `runs_on` | `Platform` | `docs/app/05-architecture/06-deployment/deployment-units/deployment-unit.md` |
| `CrossCuttingRule` | `supports` | `QualityObjective` | `docs/app/05-architecture/07-cross-cutting/cross-cutting-rules/cross-cutting-rule.md` |
| `ModuleBoundary` | `affected_by` | `RiskRecord` | `docs/app/05-architecture/02-boundaries/module-boundaries/module-boundary.md` |
| `DeploymentUnit` | `runs_in` | `RuntimeEnvironment` | `docs/app/05-architecture/06-deployment/deployment-units/deployment-unit.md` |

Đã xử lý kèm theo:

- Xoá valid triple tương ứng trong `docs/meta/03-rules/05-architecture/valid-triples.md`.
- Dọn example/non-example/valid usage liên quan trong relation type docs.
- Xoá relation type không còn valid usage sau cleanup: `crosses`, `runs_on`, `stored_on`.

Kết quả sau fix:

- `UNDEFINED_TARGET_ROWS=0`
- `MISSING_RELATION_TYPE=0`
- `RELATION_TYPES_WITH_NO_VALID_TRIPLE=0`
- `MISSING_VALID_TRIPLE=0`

Residual note:

- Còn prose mention như `DataStoreUnit`, `DataStore`, `ApplicationRuntime` trong mô tả layer/deployment, nhưng đó không phải canonical relation slot/triple nên không nằm trong Finding 1.
- Còn `VALID_WITHOUT_TEMPLATE=2`: `Decision --supersedes--> Decision` và `Module --depends_on--> Module`. Đây là reserved rule cũ, không thuộc nhóm target undefined vừa xử lý.

## Finding 2 - Mirror Direction Và Passive Relation

Rating: High.

Docs đã có rule: mỗi fact nên có một canonical direction, không mirror cùng một fact ở hai README chỉ để đọc hai chiều. Nhưng một số template vẫn cho phép cả hai hướng hoặc passive relation.

Nhóm rủi ro cao:

| Cặp | Vấn đề | Hướng đề xuất |
| --- | --- | --- |
| `Problem --affects--> Stakeholder` và `Stakeholder --affected_by--> Problem` | Cùng một fact có thể bị lưu hai lần. Impact query dễ double-count. | Giữ hướng cause -> impacted target: `Problem --affects--> Stakeholder`. Bỏ slot passive `Stakeholder --affected_by--> Problem`. |
| `Application --has_scope--> Scope` và `Scope --applies_to--> Application` | Mirror scope ownership/applicability. | Chọn một hướng canonical. Đề xuất giữ `Application --has_scope--> Scope`. |
| `Release --includes--> Feature` và `Feature --included_in--> Release` | Cùng một quan hệ container-membership. | Giữ container -> member: `Release --includes--> Feature`. |
| `Module --owns--> StateOwner` và `StateOwner --owned_by--> Module` | Cùng fact ownership hai chiều. | Giữ owner -> owned: `Module --owns--> StateOwner`. |
| `Stakeholder --may_map_to--> Persona` và `Persona --maps_from--> Stakeholder` | Vừa mirror, vừa có uncertainty trong `may_map_to`. | Candidate mapping không nên là canonical relation. Khi đã chốt, dùng một hướng dứt khoát. |
| `BusinessRule --may_refine_to--> Invariant` và `Invariant --refined_from--> BusinessRule` | Vừa mirror, vừa có uncertainty trong `may_refine_to`. | Candidate refine đưa vào workbench/proposal; canonical graph chỉ dùng relation đã chốt. |
| `Module --participates_in--> InteractionFlow` và `InteractionFlow --involves--> Module` | Có thể mô tả cùng một fact ở hai chiều. | Với flow architecture, giữ `InteractionFlow --involves--> Module`; trace ngược bằng derived inverse/search. |

Tác động:

- Impact query trả kết quả trùng.
- Tooling phải dedupe thủ công.
- Người viết docs dễ lưu cùng fact ở cả hai đầu.
- Direction rule bị yếu vì template vẫn cho phép cả hai.

Phương án thay thế:

- Mỗi fact chỉ có một canonical direction.
- Inverse chỉ tồn tại như derived inverse trong tooling/search, không phải slot instance mặc định.
- Chỉ giữ paired relation nếu hai relation thật sự khác semantic, không chỉ khác chiều đọc.

## Finding 3 - Nhóm Impact: `affects` / `affected_by`

Rating: High.

Slot hiện có:

| Source | Relation | Target | Đánh giá |
| --- | --- | --- | --- |
| `Problem` | `affects` | `Stakeholder` | Hợp lý nếu hiểu là business pain tác động tới stakeholder. |
| `CrossCuttingRule` | `affects` | `Module` | Quá rộng. Rule có thể govern, constrain, apply hoặc require change; `affects` không nói rõ loại tác động. |
| `Stakeholder` | `affected_by` | `Problem` | Mirror/passive của `Problem --affects--> Stakeholder`. |
| `ModuleBoundary` | `affected_by` | `RiskRecord` | Target chưa có entity type definition thật, đồng thời `affected_by` quá passive. |

Phương án thay thế:

- Giữ `Problem --affects--> Stakeholder` nếu relation type `affects` được định nghĩa chặt là "impact quan sát được từ business pain tới stakeholder".
- Bỏ `Stakeholder --affected_by--> Problem` khỏi slot canonical.
- Với `CrossCuttingRule -> Module`, không dùng `affects` mặc định. Chọn relation theo intent:
  - `governs` nếu rule quy định module phải tuân thủ;
  - `constrains` nếu rule giới hạn hành vi module;
  - `applies_to` nếu rule chỉ nêu phạm vi áp dụng.
- Với `ModuleBoundary -> RiskRecord`, trước tiên phải tạo/định nghĩa `RiskRecord`; sau đó cân nhắc hướng `RiskRecord --impacts--> ModuleBoundary` hoặc `ModuleBoundary --mitigates--> RiskRecord` tùy ý nghĩa thật.

## Finding 4 - Nhóm Support / Satisfaction

Rating: High.

Slot hiện có:

| Source | Relation | Target | Đánh giá |
| --- | --- | --- | --- |
| `Capability` | `supports` | `BusinessRequirement` | Gần với `BusinessRequirement --satisfied_by--> Capability`, dễ trùng semantic. |
| `Screen` | `supports` | `Feature` | Gần với `Feature --exposed_via--> Screen`, dễ trùng semantic. |
| `CrossCuttingRule` | `supports` | `QualityObjective` | Target `QualityObjective` chưa có definition thật. |

Vấn đề:

- `supports` là verb rất rộng.
- Query "cái gì thỏa requirement" khác query "cái gì hỗ trợ requirement".
- Query "feature xuất hiện qua screen nào" khác query "screen support feature nào".
- Nếu giữ `supports`, AI sẽ dùng như relation cứu hỏa cho mọi thứ "có liên quan tích cực".

Phương án thay thế:

- Requirement coverage dùng `satisfied_by`.
- Feature/UI exposure dùng `exposed_via`.
- Quality objective nên có model riêng:
  - tạo entity type `QualityObjective` nếu cần;
  - dùng relation dứt khoát như `satisfied_by`, `enforced_by` hoặc `measured_by` tùy query intent;
  - không dùng `supports` nếu không định nghĩa được điều kiện tạo edge.
- Nếu vẫn giữ `supports`, phải giới hạn meaning: chỉ dùng khi Source tạo điều kiện cho Target đạt được mục tiêu nhưng không đủ để satisfy/implement/verify Target.

## Finding 5 - Nhóm Scope / Applicability

Rating: Medium/High.

Slot hiện có:

| Source | Relation | Target | Đánh giá |
| --- | --- | --- | --- |
| `Scope` | `applies_to` | `Application` | Mirror với `Application --has_scope--> Scope`. |
| `BusinessRule` | `applies_to` | `Process` | Hợp lý nếu rule áp dụng cho process. |
| `Invariant` | `applies_to` | `DomainEntity` | Hợp lý nếu invariant áp dụng cho entity. |
| `AccessibilityRequirement` | `applies_to` | `Screen` | Hợp lý nếu requirement áp dụng cho screen. |
| `Release` | `aligns_with` | `Scope` | Quá lỏng; không biết release deliver, target hay comply với scope. |
| `Application` | `has_scope` | `Scope` | Hợp lý nếu Application là root owner của scope. |

Phương án thay thế:

- Không giữ cả `Application --has_scope--> Scope` và `Scope --applies_to--> Application` như canonical slot.
- Đề xuất giữ `Application --has_scope--> Scope`.
- `applies_to` chỉ dùng cho rule/requirement/invariant áp dụng vào target chịu ràng buộc.
- `Release --aligns_with--> Scope` nên đổi sang relation có query intent rõ hơn nếu relation này thật sự cần:
  - `targets_scope` nếu release được planned theo scope;
  - `delivers_scope` nếu release hiện thực một scope;
  - `constrained_by` nếu scope giới hạn release.

## Finding 6 - Nhóm Constraint

Rating: Medium.

Slot hiện có:

| Source | Relation | Target | Đánh giá |
| --- | --- | --- | --- |
| `BusinessConstraint` | `constrains` | `Process` | Hợp lý. |
| `NonFunctionalRequirement` | `constrains` | `Feature` | Hợp lý nếu NFR giới hạn cách feature được build. |
| `ModuleBoundary` | `constrains` | `Module` | Hợp lý nếu boundary giới hạn module. |
| `DomainEntity` | `constrained_by` | `Invariant` | Passive direction. |
| `ValueObject` | `constrained_by` | `Invariant` | Passive direction. |
| `StateOwner` | `constrained_by` | `ModuleBoundary` | Passive direction. |

Vấn đề:

- `constrains` và `constrained_by` cùng tồn tại, dễ sinh mirror.
- Passive direction làm query "constraint nào tác động đến target nào" phải chạy cả hai hướng.

Phương án thay thế:

- Ưu tiên canonical direction: constraint source -> constrained target.
- Đề xuất:
  - `Invariant --constrains--> DomainEntity`
  - `Invariant --constrains--> ValueObject`
  - `ModuleBoundary --constrains--> StateOwner`
- `constrained_by` chỉ nên là derived inverse, không là slot instance mặc định.

## Finding 7 - Nhóm Usage / Participation / Topology

Rating: Medium.

Slot hiện có:

| Source | Relation | Target | Đánh giá |
| --- | --- | --- | --- |
| `UseCase` | `uses` | `Capability` | Chấp nhận được nếu use case cần capability để hoàn tất. |
| `InteractionFlow` | `uses` | `Interface` | Target `Interface` chưa có definition thật. Verb `uses` còn rộng. |
| `Stakeholder` | `participates_in` | `Process` | Hợp lý vì stakeholder tham gia process. |
| `Module` | `participates_in` | `InteractionFlow` | Mirror tiềm năng với `InteractionFlow --involves--> Module`. |
| `InteractionFlow` | `involves` | `Module` | Hợp lý hơn để mô tả flow architecture. |
| `Navigation` | `connects` | `Screen` | Quá chung; nếu là route/navigation graph nên dùng verb rõ hơn. |
| `ExternalSystem` | `integrates_with_context` | `Application` | Tên relation lạ, hơi dài, nhưng target cụ thể. |

Phương án thay thế:

- Với architecture flow, giữ `InteractionFlow --involves--> Module`.
- Không lưu thêm `Module --participates_in--> InteractionFlow` cho cùng fact.
- `Navigation --connects--> Screen` nên đổi thành `routes_to` hoặc `links_to` nếu dùng để query screen graph.
- `InteractionFlow --uses--> Interface` chỉ giữ sau khi có entity type `Interface`; nếu không, bỏ khỏi canonical slot.
- `ExternalSystem --integrates_with_context--> Application` có thể giữ nếu định nghĩa là external system nằm trong ecosystem context của application, nhưng nên cân nhắc tên ngắn và rõ hơn như `integrates_with`.

## Finding 8 - Nhóm Refinement / Derivation / Mapping

Rating: High cho relation có `may_*`, Medium cho phần còn lại.

Slot hiện có:

| Source | Relation | Target | Đánh giá |
| --- | --- | --- | --- |
| `Problem` | `leads_to` | `BusinessRequirement` | Chấp nhận được nếu problem dẫn đến requirement. |
| `BusinessRequirement` | `derived_from` | `Problem` | Mirror tiềm năng với `Problem --leads_to--> BusinessRequirement`. |
| `Process` | `informs` | `UseCase` | Quá lỏng nhưng có thể chấp nhận nếu định nghĩa rõ. |
| `UseCase` | `refined_in` | `UserFlow` | Hợp lý nếu UserFlow là refinement của UseCase. |
| `BusinessRule` | `may_refine_to` | `Invariant` | Không nên là canonical vì có uncertainty. |
| `Invariant` | `refined_from` | `BusinessRule` | Mirror tiềm năng với refine direction. |
| `Stakeholder` | `may_map_to` | `Persona` | Không nên là canonical vì có uncertainty. |
| `Persona` | `maps_from` | `Stakeholder` | Mirror tiềm năng. |

Vấn đề:

- `may_*` trái với rule "nghi ngờ = reject".
- Candidate mapping/refinement thuộc workbench/proposal, không thuộc canonical graph.
- `derived_from` và `leads_to` có thể cùng mô tả một đường trace business -> product.

Phương án thay thế:

- Candidate relation không ghi vào canonical `relations:`.
- Nếu chưa chắc, ghi trong workbench hoặc field proposal, không tạo edge.
- Khi đã chốt:
  - dùng `maps_to` hoặc `maps_from`, chỉ một hướng;
  - dùng `refines_to` hoặc `refined_from`, chỉ một hướng;
  - không dùng `may_*` trong canonical app graph.

## Finding 9 - Nhóm Composition / Ownership

Rating: Medium.

Slot hiện có:

| Cặp | Đánh giá | Hướng đề xuất |
| --- | --- | --- |
| `Scenario --composes--> Process` và `Process --part_of--> Scenario` | Mirror composition. | Giữ container -> part: `Scenario --composes--> Process`. |
| `Release --includes--> Feature` và `Feature --included_in--> Release` | Mirror release membership. | Giữ `Release --includes--> Feature`. |
| `Module --owns--> StateOwner` và `StateOwner --owned_by--> Module` | Mirror ownership. | Giữ `Module --owns--> StateOwner`. |
| `Aggregate --contains--> DomainEntity` và `DomainEntity --member_of--> Aggregate` | Mirror aggregate membership. | Giữ `Aggregate --contains--> DomainEntity`. |
| `Journey --contains--> UserFlow` | Hợp lý. | Giữ nếu không có inverse slot. |

Tác động:

- Nếu cả hai hướng đều được instance ghi, graph bị duplicate fact.
- Query "owner của X là gì" nên derive từ owner -> owned, không cần stored inverse.

Phương án thay thế:

- Container/owner -> contained/owned là canonical.
- Inverse là derived, không lưu thành relation canonical ở instance.

## Finding 10 - Nhóm Vocabulary / Language

Rating: Medium.

Slot hiện có:

| Source | Relation | Target | Đánh giá |
| --- | --- | --- | --- |
| `GlossaryTerm` | `related_term` | `DomainConcept` | Quá yếu; "related" không cho biết term định nghĩa, đặt tên hay ánh xạ concept. |
| `DomainConcept` | `specializes` | `GlossaryTerm` | Không tự nhiên; concept thường không specialize term. |

Vấn đề:

- Query vocabulary cần biết term nào định nghĩa concept nào.
- `related_term` là relation rộng tương tự tag.
- `specializes` giữa DomainConcept và GlossaryTerm dễ sai semantic.

Phương án thay thế:

- Chốt một model ngôn ngữ rõ:
  - `GlossaryTerm --names--> DomainConcept`
  - hoặc `DomainConcept --defined_by_term--> GlossaryTerm`
- Không dùng `related_term` cho canonical trace quan trọng.
- `specializes` chỉ dùng giữa concept với concept hoặc term với term nếu có hierarchy thật.

## Finding 11 - Valid Triple Duplicate

Rating: Medium.

Có 15 valid triple xuất hiện cả trong layer-local file và `cross-layer/valid-triples.md`.

Ví dụ:

- `Application --has_scope--> Scope`
- `BusinessRequirement --derived_from--> Problem`
- `Problem --leads_to--> BusinessRequirement`
- `Process --informs--> UseCase`
- `Release --aligns_with--> Scope`
- `UseCase --refined_in--> UserFlow`

Tác động:

- Không rõ file nào là source of truth.
- Khi sửa một nơi dễ quên nơi còn lại.
- Validator phải dedupe hoặc dễ báo sai.

Phương án thay thế:

- Layer-local valid triple chỉ chứa relation trong cùng layer.
- `cross-layer/valid-triples.md` chỉ chứa relation nối khác layer.
- Nếu muốn index tổng hợp, tạo README/index không phải source of truth.

## Finding 12 - Relation Type Meaning Còn Placeholder

Rating: Medium.

Có 56/78 relation type còn meaning dạng placeholder như:

```text
Source liên hệ với Target theo semantic `supports`.
```

Vấn đề:

- Relation type tồn tại nhưng không hướng dẫn khi nào tạo edge.
- AI có thể dùng verb theo cảm giác.
- Valid triple có thể pass nhưng semantic vẫn sai.

Phương án thay thế:

Mỗi relation type nên có tối thiểu:

```text
meaning
query intent
create edge when
do not use when
canonical direction rule
inverse behavior
valid usage
```

Không đổi tên relation chỉ vì văn phong. Chỉ đổi hoặc tách relation khi query intent khác nhau thật.

## Finding 13 - App Instance Chưa Có YAML `relations:` Canonical

Rating: High nếu mục tiêu là query tự động; Medium nếu hiện chỉ dùng docs để đọc.

Schema hiện yêu cầu relation canonical nằm trong YAML frontmatter `relations:` của entity instance. Nhưng scan trong `docs/app` chủ yếu thấy `Related Entities` dạng prose/link, ví dụ các module, boundary, flow trong `docs/app/05-architecture`.

Tác động:

- Người đọc vẫn hiểu được.
- Tooling/query tự động không có graph edge chuẩn để dùng.
- Impact analysis vẫn phải dựa vào text search/link parsing.

Phương án thay thế:

- Sau khi relation template sạch, migrate `Related Entities` rõ ràng sang YAML `relations:`.
- Body `## Related Entities` hoặc `## Relations` chỉ giữ phần giải thích cho người đọc.
- Link nào không có slot hợp lệ thì không chuyển thành canonical edge.

## Phương Án Chuẩn Hóa Đề Xuất

### Phase 1 - Strict Target Entity Type

Mục tiêu:

- Không còn target trong `relations_template` mà thiếu entity type definition thật.

Nghiệm thu:

- `[x]` Mọi `Target Entity Type` trong `relations_template` resolve được tới definition thật trong scope canonical relation hiện tại.
- `[x]` Không có target dự kiến hoặc target "future" trong slot canonical hiện tại.
- `[ ]` Validator có check target type tồn tại, không chỉ check relation type và valid triple.

### Phase 2 - Canonical Direction

Mục tiêu:

- Mỗi fact chỉ có một hướng lưu canonical.

Việc cần làm:

- Review và bỏ các slot mirror/passive:
  - `affected_by`
  - `constrained_by`
  - `included_in`
  - `owned_by`
  - `member_of`
  - các cặp `may_map_to/maps_from`, `may_refine_to/refined_from`

Nghiệm thu:

- `[ ]` Không còn cặp slot mô tả cùng một fact ở hai hướng.
- `[ ]` Relation type inverse được ghi là derived inverse nếu chỉ phục vụ tra ngược.
- `[ ]` Entity instance không phải ghi relation ở cả hai đầu.

### Phase 3 - Siết Meaning Relation Type

Mục tiêu:

- Relation type không còn meaning placeholder.

Ưu tiên:

- `affects`
- `supports`
- `applies_to`
- `uses`
- `constrains`
- `informs`
- `aligns_with`
- `related_term`
- `participates_in`
- `involves`

Nghiệm thu:

- `[ ]` Mỗi relation type có meaning rõ.
- `[ ]` Mỗi relation type có query intent.
- `[ ]` Mỗi relation type có anti-pattern thực tế.
- `[ ]` Không còn câu placeholder kiểu `Source liên hệ với Target theo semantic X`.

### Phase 4 - Dọn Valid Triple Source Of Truth

Mục tiêu:

- Không duplicate valid triple giữa layer-local và cross-layer.

Việc cần làm:

- Cross-layer file chỉ giữ relation khác layer.
- Layer file chỉ giữ relation trong cùng layer.
- Nếu cần tổng quan, dùng README/index không phải source of truth.

Nghiệm thu:

- `[ ]` Unique valid triple count bằng tổng valid triple count.
- `[ ]` Không có triple duplicate giữa `cross-layer` và layer file.
- `[ ]` Tooling không cần dedupe source of truth.

### Phase 5 - Migrate App Instance Relations

Mục tiêu:

- `docs/app` có graph query được qua YAML `relations:`.

Việc cần làm:

- Convert link trong `Related Entities` sang `relations:` nếu slot hợp lệ.
- Link không có slot hợp lệ giữ prose.
- Không tạo relation mới chỉ vì link đang tồn tại.

Nghiệm thu:

- `[ ]` Entity instance quan trọng có `relations:` canonical.
- `[ ]` Body `## Relations` chỉ giải thích, không thay canonical edge.
- `[ ]` Impact query có thể đi qua YAML thay vì text search.

## Nguyên Tắc Chốt Để Tránh Lệch

- Không đổi relation name vì văn phong.
- Chỉ đổi/tách relation khi query intent khác.
- Không dùng relation canonical cho candidate, nghi ngờ, proposal.
- Không dùng target chưa có entity type definition.
- Không lưu cả relation xuôi và relation ngược cho cùng một fact.
- Không dùng `supports`, `affects`, `related_term`, `aligns_with` như quan hệ cứu hỏa.
- `relations_template` là gate đầu tiên; valid triple và relation type là gate tiếp theo.
- `Related Entities` không thay thế YAML `relations:`.

## Đề Xuất Thứ Tự Sửa Nếu Triển Khai

Thứ tự an toàn nhất:

1. Fix target entity type chưa tồn tại.
2. Bỏ mirror/passive slots.
3. Siết meaning relation type.
4. Dọn duplicate valid triples.
5. Migrate `docs/app` instance sang YAML `relations:`.

Không nên bắt đầu bằng rename hàng loạt relation. Nếu rename trước khi chốt query intent, graph sẽ đẹp tên hơn nhưng vẫn khó query.
