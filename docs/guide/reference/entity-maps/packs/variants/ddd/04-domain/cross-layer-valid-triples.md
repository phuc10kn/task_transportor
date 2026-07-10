# Valid Triples - DDD Cross-Layer

Các cross-layer triple thuộc DDD tactical base. Relation type và target canonical của project thuộc `docs/meta/` trước khi app ghi entity relation.

| Source | Relation | Target | Cardinality |
| --- | --- | --- | --- |
| DomainConcept | `specializes` | GlossaryTerm | 0..n |
| Invariant | `refined_from` | BusinessRule | 0..n |

Source relation definitions:

- [specializes](relation-types/cross-layer/specializes.md)
- [refined_from](relation-types/cross-layer/refined_from.md)
