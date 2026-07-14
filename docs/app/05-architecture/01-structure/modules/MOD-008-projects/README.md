---
schema: entity-instance/v1
id: MOD-008
slug: projects
title: Projects
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Module giữ project profile và integration config. Nó là nơi user bật tắt sync, giữ reference env/config và điều phối một số operation theo project.
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
relations:
  owns:
    - SO-004
---
# MOD-008 - Projects

## Summary

Module giữ project profile và integration config. Nó là nơi user bật tắt sync, giữ reference env/config và điều phối một số operation theo project.

## Meaning

Module giữ project profile và integration config. Nó là nơi user bật tắt sync, giữ reference env/config và điều phối một số operation theo project.

## Responsibility

- CRUD project.
- Enable hoặc disable sync.
- Giữ config tích hợp và reference env keys.
- Giữ Project identity/language config; không sở hữu translation glossary state.
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
- Glossary normalized thuộc `Translation`; Project Config không nhận hoặc serialize glossary legacy.

## Related Entities

- Context/evidence: [MOD-002-backlog](../../modules/MOD-002-backlog/README.md) - dùng project config để pull inbound
- Context/evidence: [MOD-007-jira](../../modules/MOD-007-jira/README.md) - dùng project config để sync outbound
- Canonical relation: [SO-004-project-integration-state](../../../04-state/state-owners/SO-004-project-integration-state/README.md) - state owner tương ứng


## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `src/modules/Projects/ProjectsApi.js`
- `src/modules/Projects/application/setProjectSyncEnabled.js`
- `src/modules/Projects/application/syncCisMappingValuesFromTarget.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
