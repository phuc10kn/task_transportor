# Valid Triples — 04-domain

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| Aggregate | `contains` | DomainEntity | 0..n |
| Aggregate | `enforces` | Invariant | 0..n |
| DomainConcept | `models` | DomainEntity | 0..n |
| DomainConcept | `specializes` | GlossaryTerm | 0..n |
| DomainEntity | `constrained_by` | Invariant | 0..n |
| DomainEntity | `member_of` | Aggregate | 0..n |
| DomainEvent | `marks_transition` | Lifecycle | 0..n |
| DomainEvent | `raised_by` | Aggregate | 0..n |
| DomainPolicy | `applied_by` | DomainService | 0..n |
| DomainService | `operates_on` | DomainEntity | 0..n |
| Invariant | `applies_to` | DomainEntity | 0..n |
| Invariant | `refined_from` | BusinessRule | 0..n |
| Lifecycle | `describes` | DomainEntity | 0..n |
| Lifecycle | `emits` | DomainEvent | 0..n |
| ValueObject | `constrained_by` | Invariant | 0..n |
| ValueObject | `used_by` | DomainEntity | 0..n |

## validation

- Relation Type phải tồn tại trong `02-relation-types/`
- Direction phải đúng canonical
- Entity instance chỉ ghi relation trong YAML frontmatter `relations:` theo slot đã có trong entity type `relations_template`
