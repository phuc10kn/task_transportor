---
name: graph-materialize
description: Materialize a small canonical docs/app graph slice from an approved project trace need.
---

# graph-materialize

Materialize relation canonical trong `docs/app` theo [DEC-002 App Graph Materialization Policy](../../app/10-decisions/01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/README.md). Skill này là standard-agent workflow, không thay source of truth của decision hoặc meta.

## Workflow

```text
Task Progress:
- [ ] Đọc [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn)
- [ ] Đọc DEC-002 và docs/app scope liên quan
- [ ] Viết trace query: actor, start entity, câu hỏi, quyết định/review được hỗ trợ
- [ ] Liệt kê evidence prose/code cho từng fact dự kiến materialize
- [ ] Resolve relation type, valid triple, relation slot và target instance
- [ ] Chọn vertical slice nhỏ nhất đủ trả lời query
- [ ] Ghi một canonical direction cho mỗi fact; ghi rõ edge cố ý không thêm
- [ ] Nâng instance chạm scope theo entity-instance/v1
- [ ] Chạy meta-validate (semantic/boundary/evidence) + trace-impact
- [ ] (Optional local) verify:entity-type-contract, verify:entity-instance, verify:relations, verify:references theo path đã đổi
- [ ] Chạy verify docs nếu đụng guide links
```

## Trace Contract

```md
## graph-materialize result

### Trace need
- Actor:
- Start entity:
- Query:
- Decision/review supported:

### Materialized edges
- Source --relation--> Target

### Intentionally prose-only
- Fact:
- Reason: no evidence / no slot / no valid triple / semantic not precise

### Evidence
- Edge:
- Source evidence:

### Validation
- Relation type:
- Valid triple:
- Slot:
- Target instance:
- Reverse query:
```

## Guardrails

- Không convert mọi link trong `Related Entities` thành `relations:`.
- Không ghi dual/inverse edge chỉ để query ngược.
- Không tạo Module-to-Flow `participates_in` hoặc Module-to-Boundary `governed_by` cho architecture fact đã có canonical source direction.
- Không dùng `CrossCuttingRule --affects--> Module` chỉ vì module xuất hiện trong Scope.
- Không thêm Boundary-to-Flow relation nếu chưa có predicate, slot và valid triple riêng.
- Khi meta contract thiếu, dừng ở prose và báo đúng gap; không tự sửa `docs/meta` nếu task không yêu cầu.
