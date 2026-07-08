---
id: MOD-008
slug: projects
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
---

# MOD-008 - Projects

## Meaning

Module giữ project profile và integration config. Nó là nơi user bật tắt sync, giữ reference env/config và điều phối một số operation theo project.

## Responsibility

- CRUD project.
- Enable hoặc disable sync.
- Giữ config tích hợp và reference env keys.
- Trigger sync mapping values cho project.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Projects/ProjectsApi.js`, `src/modules/Projects/http/routes.js` |
| Owned state | `projects` |
| Main consumers | `Backlog`, `Jira`, `Dashboard` |
| Main role | context và enablement cho integration flows |

## Rules / constraints

- Project config không nằm rải rác trong module integration.
- Enable/disable sync phải do owner `Projects` quyết định.
- Env binding là part của project integration state, không phải concern của Dashboard.

## Related Entities

- [MOD-002-backlog](../../modules/MOD-002-backlog/README.md) - dùng project config để pull inbound
- [MOD-007-jira](../../modules/MOD-007-jira/README.md) - dùng project config để sync outbound
- [SO-004-project-integration-state](../../../04-state/state-owners/SO-004-project-integration-state/README.md) - state owner tương ứng

## Evidence

- `src/modules/Projects/ProjectsApi.js`
- `src/modules/Projects/application/setProjectSyncEnabled.js`
- `src/modules/Projects/application/syncCisMappingValuesFromTarget.js`
