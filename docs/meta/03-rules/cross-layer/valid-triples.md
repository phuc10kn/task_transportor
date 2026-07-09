# Valid Triples — cross-layer

Relations giữa các layer khác nhau.

Cross-layer valid triple là source of truth cho relation nối entity type thuộc hai layer khác nhau. Layer-local valid triple chỉ chứa relation trong cùng layer.

| Source | Relation | Target | Cardinality | Notes |
|--------|----------|--------|-------------|-------|
| BusinessRequirement | `derived_from` | Problem | 0..n | product → business |
| Persona | `maps_from` | Stakeholder | 0..n | ui → business |
| UserFlow | `implements` | UseCase | 0..n | ui → product |
| Feature | `exposed_via` | Screen | 0..n | product → ui |
| Invariant | `refined_from` | BusinessRule | 0..n | domain → business |
| DomainConcept | `specializes` | GlossaryTerm | 0..n | domain → context |

## broad premise trace

Không dùng pseudo target như `_any Entity_`, `_layer / entity_`, `entities` hoặc `layers/entities` trong valid triple.

Broad premise như Assumption hoặc ContextConstraint không tự tạo outbound relation tới mọi entity. Nếu một entity thật sự phụ thuộc hoặc bị ràng buộc bởi premise, entity đó phải có relation slot cụ thể tới Assumption/ContextConstraint và valid triple cụ thể. Nếu chưa có slot/triple cụ thể, ghi bằng field/section như `affected_entities`, `affected_layers`, `validation_method`, `review_trigger` hoặc `exceptions` trong premise.

## theory và decision references

Không dùng Relation Type graph cho Theory/Decision. Dùng frontmatter theo [04-conventions/theory-reference.md](../../04-conventions/theory-reference.md) và [decision-reference.md](../../04-conventions/decision-reference.md).

## forbidden (examples)

| Pattern | Reason |
|---------|--------|
| Screen --derived_from--> Problem | skip layers without intermediate trace |
| DomainEntity --exposed_via--> Feature | wrong direction / wrong semantic |
| Free relation name not in 02-relation-types | not canonical |
