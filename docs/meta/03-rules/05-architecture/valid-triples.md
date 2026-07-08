# Valid Triples - 05-architecture

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| Module | `governed_by` | ModuleBoundary | 0..n |
| Module | `participates_in` | InteractionFlow | 0..n |
| Module | `owns` | StateOwner | 0..n |
| ModuleBoundary | `constrains` | Module | 0..n |
| InteractionFlow | `involves` | Module | 0..n |
| StateOwner | `shared_via` | DataFlow | 0..n |
| StateOwner | `constrained_by` | ModuleBoundary | 0..n |
| DataFlow | `moves` | StateOwner | 0..n |
| DeploymentUnit | `hosts` | Module | 0..n |
| CrossCuttingRule | `affects` | Module | 0..n |

## validation

- Relation Type phải tồn tại trong `02-relation-types/`
- Direction phải đúng canonical
- Entity instance chỉ ghi relation trong YAML frontmatter `relations:` theo slot đã có trong entity type `relations_template`
