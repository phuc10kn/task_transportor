# Valid Triples — 02-product

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| AcceptanceCriterion | `accepts` | Feature | 0..n |
| AcceptanceCriterion | `accepts` | FunctionalRequirement | 0..n |
| BusinessRequirement | `derived_from` | Problem | 0..n |
| BusinessRequirement | `satisfied_by` | Capability | 0..n |
| Capability | `delivered_by` | Feature | 0..n |
| Capability | `supports` | BusinessRequirement | 0..n |
| Feature | `exposed_via` | Screen | 0..n |
| Feature | `implements` | Capability | 0..n |
| FunctionalRequirement | `specifies` | Feature | 0..n |
| FunctionalRequirement | `verified_by` | AcceptanceCriterion | 0..n |
| NonFunctionalRequirement | `constrains` | Feature | 0..n |
| Release | `aligns_with` | Scope | 0..n |
| Release | `includes` | Feature | 0..n |
| UseCase | `implemented_by` | Feature | 0..n |
| UseCase | `refined_in` | UserFlow | 0..n |
| UseCase | `uses` | Capability | 0..n |

## validation

- Relation Type phải tồn tại trong `02-relation-types/`
- Direction phải đúng canonical
- Entity instance chỉ ghi relation trong YAML frontmatter `relations:` theo slot đã có trong entity type `relations_template`
