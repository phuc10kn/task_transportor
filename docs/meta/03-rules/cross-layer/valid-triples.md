# Valid Triples — cross-layer

Relations giữa các layer khác nhau (00-context → 04-domain).

| Source | Relation | Target | Notes |
|--------|----------|--------|-------|
| Problem | `leads_to` | BusinessRequirement | business → product |
| BusinessRequirement | `derived_from` | Problem | product → business |
| Process | `informs` | UseCase | business → product |
| Stakeholder | `may_map_to` | Persona | business → ui |
| Persona | `maps_from` | Stakeholder | ui → business |
| UseCase | `refined_in` | UserFlow | product → ui |
| Feature | `exposed_via` | Screen | product → ui |
| BusinessRule | `may_refine_to` | Invariant | business → domain |
| Invariant | `refined_from` | BusinessRule | domain → business |
| GlossaryTerm | `related_term` | DomainConcept | context → domain |
| DomainConcept | `specializes` | GlossaryTerm | domain → context |
| Release | `aligns_with` | Scope | product → context |
| Application | `has_scope` | Scope | context internal |
| Application | `runs_in` | Environment | context internal |
| ExternalSystem | `integrates_with_context` | Application | context internal |
| Module | `depends_on` | Module | architecture (05+) — reserved |
| Decision | `supersedes` | Decision | decisions (10) — reserved |

## generic targets

| Source | Relation | Target | Notes |
|--------|----------|--------|-------|
| Assumption | `affects` | _any Entity_ | ghi rõ ID instance trong prose |
| ContextConstraint | `constrains` | _layer / entity_ | ghi scope cụ thể |

## theory và decision references

Không dùng Relation Type graph cho Theory/Decision. Dùng frontmatter theo [04-conventions/theory-reference.md](../../04-conventions/theory-reference.md) và [decision-reference.md](../../04-conventions/decision-reference.md).

## forbidden (examples)

| Pattern | Reason |
|---------|--------|
| Screen --derived_from--> Problem | skip layers without intermediate trace |
| DomainEntity --exposed_via--> Feature | wrong direction / wrong semantic |
| Free relation name not in 02-relation-types | not canonical |
