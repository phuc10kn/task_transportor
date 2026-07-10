# Entity Analysis Map — Overview

File này là **bản đồ chung** để đọc entity types và quan hệ giữa các layer.

Nó không thay `docs/meta`. Cạnh hợp lệ lấy từ:

```text
docs/meta/01-entity-types/   → entity type + relations_template
docs/meta/02-relation-types/ → meaning + direction
docs/meta/03-rules/          → valid triples
```

Khi map này mâu thuẫn meta, ưu tiên meta.

Index folder: [README.md](README.md).

## Mục đích

- định hướng task thuộc layer/concern nào;
- chọn chiều fact gốc trước khi thêm relation;
- tránh mirror/dual cùng một fact;
- biết khi nào đọc default map vs `variants/<name>/<layer>/`.

## Source, role và home

| Nguồn | Vai trò | Home |
| --- | --- | --- |
| Default layer map | Cửa vào theo layer: câu hỏi, concern, type/graph status | `entity-maps/NN-*.md` |
| Meta registry | Canonical entity type, relation type, valid triple active | `docs/meta/` |
| Universal origin model | Concern baseline và generic taxonomy tái dùng, không phụ thuộc methodology | [packs/universal/](packs/universal/README.md) |
| Variant map | Reading view: câu hỏi/status/graph khi phụ thuộc methodology/style; không sở hữu type pack | [variants/](variants/) |
| Methodology pack | Vocabulary/template phụ thuộc methodology; source nằm trong guide pack | [packs/variants/](packs/README.md) |

## Stack layer như lens phân tích

```mermaid
flowchart TB
  L00[00-context]
  L01[01-business]
  L02[02-product]
  L03[03-interface]
  L04[04-domain]
  L05[05-architecture]
  L06[06-technical]
  L07[07-implementation]
  L08[08-quality]
  L09[09-operation]
  L10[10-decisions]

  L00 --> L01
  L01 --> L02
  L02 --> L03
  L02 --> L04
  L04 --> L05
  L05 --> L06
  L06 --> L07
  L05 --> L08
  L07 --> L09
  L00 --> L10
  L05 --> L10
```

Thứ tự trên là **thứ tự đọc/hiểu**, không phải pipeline bắt buộc.

| Layer | Câu hỏi | Default map | Variant (nếu có) |
| --- | --- | --- | --- |
| `00-context` | Bối cảnh, scope, premise? | [00-context.md](00-context.md) | — |
| `01-business` | Problem, goal, process, rule? | [01-business.md](01-business.md) | — |
| `02-product` | Capability, feature, use case? | [02-product.md](02-product.md) | — |
| `03-interface` | Touchpoint UI/operator? | [03-interface.md](03-interface.md) | — |
| `04-domain` | Meaning và invariant? | [04-domain.md](04-domain.md) | [variants/ddd/04-domain/](variants/ddd/04-domain/README.md) |
| `05-architecture` | Module, boundary, flow? | [05-architecture.md](05-architecture.md) | [variants/modular-monolith/05-architecture/](variants/modular-monolith/05-architecture/README.md) |
| `06-technical` | Mechanism/runtime/schema? | [06-technical.md](06-technical.md) | — |
| `07-implementation` | Code/public API? | [07-implementation.md](07-implementation.md) | — (chưa có stable methodology variant/graph) |
| `08-quality` | Acceptance/verify? | [08-quality.md](08-quality.md) | — |
| `09-operation` | Run/recover/observe? | [09-operation.md](09-operation.md) | — |
| `10-decisions` | Vì sao chọn hướng này? | [10-decisions.md](10-decisions.md) | — |

Chi tiết folder/concern: [folder-structure.md](../folder-structure.md).  
Câu hỏi layer: [layer-model.md](../../concepts/layer-model.md).

## Mô hình knowledge unit

```mermaid
flowchart LR
  Layer --> Concern
  Concern --> EntityType
  EntityType --> EntityInstance
  EntityType --> RelationSlot
  RelationSlot --> RelationType
  RelationType --> ValidTriple
  EntityInstance --> EntityRelation
```

| Unit | Canonical home |
| --- | --- |
| Entity type | `docs/meta/01-entity-types/` |
| Relation type | `docs/meta/02-relation-types/` |
| Valid triple | `docs/meta/03-rules/` |
| Relation slot | `relations_template` trong entity type |
| Entity relation | YAML `relations:` trong instance `docs/app/**` |

Cheat sheet: [relation-cheatsheet.md](../relation-cheatsheet.md).

## Doctrine chiều fact (chung)

```text
1 fact = 1 canonical direction
```

- Không mirror cùng một fact ở hai README chỉ để đọc hai chiều.
- Reverse query mặc định: search / derived inverse / tooling.
- Chỉ tạo relation chiều kia khi **semantic độc lập** và có **query first-class** riêng.
- File relation type mới/sửa: `inverse: none` + `inverse kind: derived` trừ khi pair thật sự độc lập.

Realization đã chốt (product/UI):

```text
concrete --implements--> abstract

Feature  --implements--> Capability
UserFlow --implements--> UseCase
```

Không dual-write chiều ngược (`delivered_by`, `implemented_by`) cho cùng họ fact này.

Chi tiết: [relation-model.md](../../concepts/relation-model.md).

## Cầu cross-layer (canonical triples hiện có)

```mermaid
flowchart LR
  BR[Product.BusinessRequirement] -->|derived_from| P[Business.Problem]
  Persona[Interface.Persona] -->|maps_from| Stakeholder[Business.Stakeholder]
  UserFlow[Interface.UserFlow] -->|implements| UseCase[Product.UseCase]
  Feature[Product.Feature] -->|exposed_via| Screen[Interface.Screen]
  Invariant[Domain.Invariant] -->|refined_from| BusinessRule[Business.BusinessRule]
  DomainConcept[Domain.DomainConcept] -->|specializes| GlossaryTerm[Context.GlossaryTerm]
```

Triples cụ thể: `docs/meta/03-rules/cross-layer/valid-triples.md`.

Rule:

1. Đọc default map của layer trước.
2. Nếu project đã chọn methodology variant cho layer → mở `variants/<name>/<layer>/`, rồi route sang source pack.
3. Cross-layer chỉ khi có valid triple trong meta.
4. Theory/Decision không đi qua relation graph; dùng `theory_basis` / `decision_basis`.

## Cách dùng trong task

```text
1. Xác định layer → mở entity-maps/NN-*.md (có mermaid).
2. Nếu có variant cho layer đó → đọc variant view, rồi source pack mà view route tới.
3. Kiểm tra slot + triple trong docs/meta trước khi thêm relation.
4. Chọn một chiều fact gốc; chiều ngược = derived trừ khi chứng minh độc lập.
```

Workflow: [read-for-task.md](../../workflows/read-for-task.md), [write-docs.md](../../workflows/write-docs.md), [trace-impact.md](../../workflows/trace-impact.md).

## Ngoài phạm vi overview

- Chi tiết lens từng layer → file `NN-*.md` / variant layer.
- Instance app trong `docs/app`.
- Danh sách đầy đủ valid triple (đọc meta).
