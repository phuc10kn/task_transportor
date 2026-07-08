# Valid Triples — 03-interface

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| AccessibilityRequirement | `applies_to` | Screen | 0..n |
| DesignSystem | `governs` | UIComponent | 0..n |
| Form | `contained_in` | Screen | 0..n |
| Form | `submits_via` | Interaction | 0..n |
| Interaction | `occurs_on` | Screen | 0..n |
| Interaction | `transitions_to` | UIState | 0..n |
| Journey | `contains` | UserFlow | 0..n |
| Journey | `for_audience` | Persona | 0..n |
| Navigation | `connects` | Screen | 0..n |
| Persona | `maps_from` | Stakeholder | 0..n |
| Persona | `undertakes` | Journey | 0..n |
| Screen | `composed_of` | UIComponent | 0..n |
| Screen | `supports` | Feature | 0..n |
| UIComponent | `follows` | DesignSystem | 0..n |
| UIComponent | `used_in` | Screen | 0..n |
| UIState | `displayed_on` | Screen | 0..n |
| UIState | `triggered_by` | Interaction | 0..n |
| UserFlow | `implements` | UseCase | 0..n |
| UserFlow | `traverses` | Screen | 0..n |

## validation

- Relation Type phải tồn tại trong `02-relation-types/`
- Direction phải đúng canonical
- Instance cụ thể ghi trong entity README hoặc frontmatter `relations:`
