# 06 - Technical

`06-technical/` mô tả các cơ chế kỹ thuật được dùng để hiện thực Architecture.

Layer này trả lời:

- hệ thống chạy trên nền tảng nào;
- technical interface nào được expose hoặc consume;
- state và storage được xử lý bằng cơ chế gì;
- exchange giữa các runtime component diễn ra ra sao;
- security, processing, configuration và performance được hiện thực kỹ thuật thế nào.

## Covered Universal Concerns

- `01-platforms/`
- `02-interfaces/`
- `03-state-and-storage/`
- `04-exchange/`
- `05-security/`
- `06-processing/`
- `07-configuration/`
- `08-performance/`

## Generic Entity-Type Taxonomy

Các entity type dưới từng concern là vocabulary generic tái dùng được, không phụ thuộc methodology cụ thể.

Chúng là stable template/reference; type, relation slot và valid triple active thuộc `docs/meta/` của từng project.

## Universal Boundary

Technical đứng giữa Architecture và Implementation:

- Architecture nói cần cơ chế gì.
- Technical nói dùng technology và mechanism nào.
- Implementation nói code được tổ chức ra sao.

Layer này không giữ:

- business rule;
- product scope;
- domain meaning;
- source code cụ thể.

## Concern Guide

| Concern | Trả lời | Không chứa |
| --- | --- | --- |
| `01-platforms/` | Runtime, framework, database engine, external platform hoặc AI/workflow platform nào được chọn. | Module ownership hoặc source layout. |
| `02-interfaces/` | API, webhook, CLI, protocol, file format hoặc event contract nào được expose/consume. | Controller/handler implementation. |
| `03-state-and-storage/` | State, database, cache, queue state, file storage, retention, migration và storage mechanism được xử lý thế nào. | Domain meaning hoặc architecture data ownership. |
| `04-exchange/` | HTTP, webhook, message, file, model/tool exchange, timeout, retry và delivery semantics ở mức kỹ thuật. | Business process hoặc UI flow. |
| `05-security/` | Auth, authorization, credential handling, secret, trust và technical security control. | Secret thật hoặc policy business dài. |
| `06-processing/` | Work processing, job, scheduler, command execution, pipeline step hoặc background task mechanism. | Incident response/runbook vận hành. |
| `07-configuration/` | Env var, config source, feature flag, default, override và runtime behavior được cấu hình ra sao. | Credential thật hoặc deploy-specific secret. |
| `08-performance/` | Timeout, limit, quota, throughput, latency, memory/resource budget và optimization mechanism. | Business KPI hoặc product promise nếu chưa có technical mechanism. |

## Rename Rationale

- `03-state-and-storage/` bao phủ state, storage, cache, queue state, file state và database mechanism; không ép project phải dùng database persistence theo nghĩa hẹp.
- `04-exchange/` bao phủ HTTP, webhook, message, file, tool hoặc model exchange; không ép một kiểu communication duy nhất.
- `06-processing/` bao phủ processing, work execution, pipeline step và command execution; không ép project phải có worker/service runtime cụ thể.
