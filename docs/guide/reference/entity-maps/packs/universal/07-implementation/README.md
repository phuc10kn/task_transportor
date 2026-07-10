# 07 - Implementation

`07-implementation/` mô tả cách Architecture và Technical Design được hiện thực thành source code.

Layer này trả lời:

- source code được tổ chức thế nào;
- contract ở cấp code được định nghĩa ra sao;
- behavior, data handling và external boundary được hiện thực thế nào;
- evolution, automation và coding rules được quản lý ra sao.

## Covered Universal Concerns

- `01-organization/`
- `02-contracts/`
- `03-behavior/`
- `04-data-handling/`
- `05-external-boundaries/`
- `06-evolution/`
- `07-automation/`
- `08-coding-rules/`

## Universal Boundary

Implementation đứng giữa Technical và source code thật:

- Technical nói dùng mechanism nào.
- Implementation nói mechanism đó được tổ chức ra sao trong code.

Layer này không giữ:

- business problem;
- product scope;
- operation runbook.

## Concern Guide

| Concern | Trả lời | Không chứa |
| --- | --- | --- |
| `01-organization/` | Source code, package, module, app/library và public/internal structure được tổ chức thế nào. | Architecture rationale dài. |
| `02-contracts/` | Code-level public API, port, type, schema, message hoặc event contract được định nghĩa thế nào. | User-facing product API contract nếu chưa gắn source code. |
| `03-behavior/` | Use case, command, query, handler, service, workflow, processor hoặc controller behavior được hiện thực ra sao. | Business process nguyên thủy. |
| `04-data-handling/` | Code đọc, ghi, map, serialize, validate, cache hoặc transform dữ liệu thế nào. | Domain meaning hoặc technical storage selection. |
| `05-external-boundaries/` | Code đi qua boundary với external system, SDK, upstream/downstream, OS/device hoặc package consumer/provider ra sao. | Context ecosystem overview. |
| `06-evolution/` | Migration, compatibility, refactor, rollout support hoặc source evolution được tổ chức thế nào. | Cross-layer decision rationale. |
| `07-automation/` | Codegen, script, CI helper, repetitive task automation hoặc AI-assisted coding rule nằm ở đâu. | Generic agent skill không gắn repo. |
| `08-coding-rules/` | Import rule, style, lint, module boundary rule và review rule của source code. | Documentation meta rule. |

## Rename Rationale

- `04-data-handling/` rộng hơn data access: bao phủ repository, file/object handling, serializer, mapper, cache adapter hoặc dataset reader/writer.
- `05-external-boundaries/` rộng hơn integration: bao phủ mọi ranh giới code với external dependency, upstream/downstream system, SDK, package consumer/provider hoặc OS/device boundary.
