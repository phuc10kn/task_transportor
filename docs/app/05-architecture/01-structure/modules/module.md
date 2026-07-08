# Module

| Field | Value |
|-------|-------|
| **name** | Module |
| **layer** | `05-architecture` |
| **concern** | `01-structure` |
| **folder** | `modules/` |
| **ID pattern** | `MOD-{NNN}-{slug}` |

## meaning

Architectural unit sở hữu capability và responsibility rõ trong custom modular monolith.

## architectural value

Type này giúp tách:

- owner business capability;
- owner business state;
- public boundary của capability đó;
- phần implementation được phép thay đổi bên trong.

## instance criteria

Khi một phần của hệ thống có owner, public boundary và trách nhiệm đủ ổn định để trace lâu dài.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, responsibility, owner

## optional fields

public_surface, owned_state, inbound_dependencies, outbound_dependencies, theory_basis, decision_basis

## lifecycle

proposed -> active -> deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| governed_by | `governed_by` | ModuleBoundary | false | 0..n |
| participates_in | `participates_in` | InteractionFlow | false | 0..n |
| owns | `owns` | StateOwner | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Module != source folder thuần
- Module phải mô tả ownership, không chỉ mô tả package

## questions a good instance should answer

- Module này tồn tại để bảo vệ boundary nào?
- Nó sở hữu capability gì mà module khác không được cướp?
- Nó sở hữu state gì, và state nào nó không được đụng write?
- Public API của nó là gì?
- Nó đang là core module, integration module hay read-model component?

## anti-pattern signals

- Chỉ mô tả folder tree mà không nói ownership.
- Dùng module như facade proxy cho logic của module khác.
- Dùng shared DB để biện minh cho cross-module write.
