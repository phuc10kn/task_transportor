---
schema: decision/v1
id: DEC-002
slug: app-graph-materialization-policy
title: App Graph Materialization Policy
status: accepted
summary: task_transportor chỉ materialize app relation để trả lời trace need cụ thể bằng fact đã có evidence và meta contract hợp lệ.
affected_layers:
  - 05-architecture
  - 10-decisions
affected_entities:
  - Module
  - ModuleBoundary
  - InteractionFlow
  - StateOwner
  - CrossCuttingRule
theory_basis:
  - TH-CANON
  - TH-MODULAR
  - TH-SYNC-SAFE
review_triggers:
  - Có trace query lặp lại nhưng graph hiện tại không trả lời đủ.
  - Cần relation type, valid triple hoặc relation slot mới.
  - Evidence prose không còn khớp với graph canonical.
  - Muốn materialize CrossCuttingRule hoặc DataFlow mới.
---

# DEC-002 - App Graph Materialization Policy

## Status

accepted

Ngày chốt: 2026-07-10.

## Decision

`task_transportor` chỉ materialize relation trong `docs/app/` khi relation đó trả lời một trace need cụ thể và pass đầy đủ evidence + meta contract.

Mỗi đề xuất phải nêu:

```text
Ai cần trace?
Start entity là gì?
Query cần trả lời điều gì?
Kết quả query dùng để quyết định/review việc gì?
Evidence fact nằm ở đâu?
Relation type, valid triple và slot nào cho phép edge?
```

Rule thực thi:

1. Không tự động chuyển toàn bộ prose `Related Entities` thành `relations:`.
2. Một fact chỉ có một canonical direction; reverse trace dùng repository search, derived inverse hoặc tooling.
3. Materialize theo vertical slice nhỏ nhất đủ trả lời query, không theo toàn layer.
4. Không suy diễn target hoặc predicate chỉ để nối graph.
5. Khi thiếu relation type, valid triple hoặc slot, giữ prose và mở review/decision; không tạo edge nghịch.
6. Mỗi Markdown link trong `Related Entities` phải được gắn `Canonical relation` hoặc `Context/evidence`; nhãn canonical chỉ hợp lệ khi có direct edge incident trong `relations:`, direction vẫn nằm ở source YAML và nhãn không tự tạo edge mới.

Architecture direction hiện hành:

```text
InteractionFlow --involves--> Module
InteractionFlow --changes--> StateOwner
ModuleBoundary --constrains--> Module
Module --owns--> StateOwner
StateOwner --shared_via--> DataFlow
DataFlow --moves--> StateOwner
DeploymentUnit --hosts--> Module
CrossCuttingRule --constrains--> Module
CrossCuttingRule --constrains--> StateOwner (chỉ khi Statement ràng buộc state trực tiếp)
CrossCuttingRule --constrains--> StateOwner
```

Không materialize `Module --participates_in--> InteractionFlow` hoặc `Module --governed_by--> ModuleBoundary` cho cùng fact.

Query canonical graph dùng `npm run architecture:trace -- --from <ID>`. Reverse trace được derive trong memory bởi CLI, không được ghi thành inverse edge trong instance document.

## Context

App architecture trước đây chủ yếu trace qua prose và Markdown link. Outbound Jira safety slice là materialization đầu tiên để trả lời query impact của Jira dry-run/sync.

Slice này ghi canonical edge cho:

- AF-006/AF-007 -> module participant;
- MB-006 -> module Jira bị ràng buộc;
- Cis, Mapping, Anomaly, Sync -> state owner tương ứng.

Link Boundary-to-Flow và dependency Module-to-Module giữ `Context/evidence` khi không có contract canonical tương ứng. Mọi link trong `Related Entities` đã được phân loại; chỉ frontmatter `relations:` mới tạo canonical edge.

Sau review core graph, policy này materialize toàn bộ fact đã có evidence cho `InteractionFlow`, `Module`, `ModuleBoundary`, `StateOwner`, `DataFlow`, `DeploymentUnit` và `CrossCuttingRule`: participant flow, state có thể thay đổi, constraint, ownership, state input expose, data destination, deployable host và rule constraint. [Architecture clean baseline](architecture-clean-baseline.md) giữ scope 43 instance và 129 edge đã được chốt.

## Theory Basis

- `TH-CANON`: canonical fact cần owner, direction và evidence rõ.
- `TH-MODULAR`: boundary, module ownership và public interaction phải không bị mirror mơ hồ.
- `TH-SYNC-SAFE`: outbound side effect cần trace được guardrail, execution owner và state liên quan.

## Affected Layers

- `05-architecture`: app entity instance và graph architecture được materialize theo policy này.
- `10-decisions`: giữ policy local, precedent và review trigger của project.

## Affected Entities

- `Module`, `ModuleBoundary`, `InteractionFlow`, `StateOwner`, `DataFlow`, `DeploymentUnit`, `CrossCuttingRule` là core graph đã được materialize trong baseline hiện tại.
- CrossCuttingRule dùng `constrains`, không dùng `affects`; StateOwner chỉ là target khi Statement ràng buộc state đó trực tiếp.

`CCR-004` dùng `constrains` tới module trong Scope đã được Statement xác nhận, không dùng `affects`. `affects` vẫn đòi impact trực tiếp, quan sát được và không phải predicate chung cho scope kiến trúc.

## Alternatives Considered

### Materialize Toàn Bộ `Related Entities`

Loại vì prose có thể là dependency, evidence, context hoặc câu hỏi mở; không phải tất cả đều là fact relation canonical.

### Ghi Cả Hai Chiều Để Query Thuận Tiện

Loại vì tạo duplicate fact và làm mất distinction giữa direction canonical với reverse query.

### Chỉ Giữ Prose, Không Materialize Graph

Loại vì không đáp ứng được trace impact đáng tin cho outbound Jira safety path.

### Dùng `affects` Cho Mọi Cross-Cutting Scope

Loại vì `affects` không phải relation chung chung cho owner, observer, scope hoặc dependency.

## Consequences

- Graph tăng chậm hơn nhưng mỗi edge có query intent và evidence review được.
- Một trace need mới có thể kết thúc ở prose nếu contract chưa đủ; đó là kết quả hợp lệ, không phải lý do bypass meta.
- Agent phải báo edge cố ý không materialize cùng lý do, không chỉ báo edge đã thêm.
- Mỗi slice đã materialize là precedent local, không tự trở thành guide rule xuyên dự án.

## Review Triggers

- Một code review, incident hoặc release gate lặp lại trace query mà graph hiện tại không trả lời đủ.
- Cần Boundary-to-Flow relation, CrossCuttingRule relation hoặc DataFlow relation mới.
- Một dual/inverse được đề xuất là semantic độc lập thay vì reverse query.
- Evidence hoặc ownership của app thay đổi làm edge hiện có không còn đúng.
