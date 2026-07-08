# Valid Triples — 01-business

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| BusinessConstraint | `constrains` | Process | 0..n |
| BusinessRule | `applies_to` | Process | 0..n |
| BusinessRule | `may_refine_to` | Invariant | 0..n |
| Goal | `addresses` | Problem | 0..n |
| Goal | `measured_by` | SuccessCriterion | 0..n |
| Metric | `input_to` | SuccessCriterion | 0..n |
| Metric | `measures` | Goal | 0..n |
| Policy | `generates` | BusinessRule | 0..n |
| Problem | `affects` | Stakeholder | 0..n |
| Problem | `leads_to` | BusinessRequirement | 0..n |
| Problem | `motivates` | Goal | 0..n |
| Process | `governed_by` | BusinessRule | 0..n |
| Process | `informs` | UseCase | 0..n |
| Process | `part_of` | Scenario | 0..n |
| Scenario | `composes` | Process | 0..n |
| Stakeholder | `may_map_to` | Persona | 0..n |
| Stakeholder | `participates_in` | Process | 0..n |
| SuccessCriterion | `validates` | Goal | 0..n |

## validation

- Relation Type phải tồn tại trong `02-relation-types/`
- Direction phải đúng canonical
- Entity instance chỉ ghi relation trong YAML frontmatter `relations:` theo slot đã có trong entity type `relations_template`
