# Valid Triples — 00-context

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| Application | `has_scope` | Scope | 0..n |
| Application | `runs_in` | Environment | 0..n |
| Assumption | `affects` | entities | 0..n |
| ContextConstraint | `constrains` | layers/entities | 0..n |
| Environment | `hosts` | Application | 0..n |
| ExternalSystem | `integrates_with_context` | Application | 0..n |
| GlossaryTerm | `related_term` | DomainConcept | 0..n |
| Scope | `applies_to` | Application | 0..n |

## validation

- Relation Type phải tồn tại trong `02-relation-types/`
- Direction phải đúng canonical
- Entity instance chỉ ghi relation trong YAML frontmatter `relations:` theo slot đã có trong entity type `relations_template`
