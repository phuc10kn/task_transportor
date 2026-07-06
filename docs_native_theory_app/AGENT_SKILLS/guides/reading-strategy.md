# Reading Strategy — Progressive Disclosure

Agent không đọc toàn bộ `docs/`. Mở rộng context chỉ khi cần.

## Nguyên tắc

```text
read narrow first
expand context only when necessary
```

---

## Level 1 — Task Docs

Task bình thường: đọc đúng layer/concern/entity liên quan.

```text
Task
    ↓
docs/app/README.md
    ↓
Relevant Layer (ví dụ 05-architecture/)
    ↓
Relevant Concern (ví dụ structure/)
    ↓
Relevant Entity Type (ví dụ modules/)
    ↓
Relevant Entity Instance (ví dụ MOD-001-orders/)
```

Ví dụ task architecture:

```text
docs/app/05-architecture/
```

Không cần đọc business, UI, operation nếu task không liên quan.

---

## Level 2 — Theory Summary

Khi app docs reference stable Theory ID (ví dụ `TH-MOD-05`):

```text
docs/theories/<theory-slug>/README.md
    ↓
docs/theories/<theory-slug>/agent.md
```

`agent.md` chứa: core positions, stable IDs, short rules, boundaries, review checklist.

Agent **mặc định** dừng ở Level 2 cho theory tasks thông thường.

---

## Level 3 — Full Theory

Chỉ đọc `theory.md` khi:

```text
cần hiểu sâu reasoning
có conflict
có challenge
cần sửa Theory
cần tạo architecture/business rule mới từ principle
```

`theory.md` chứa: Question, Position, Principles, Reasoning, Boundaries, Tensions, Open Questions.

---

## Level 4 — Governance

Chỉ đọc `governance.md` khi:

```text
cần biết tại sao Theory thay đổi
cần xử lý Challenge
cần thêm ReferenceNote
cần tạo Decision liên quan Theory
```

`governance.md` quản lý: Reference Notes, Challenges, Decisions.

Git giữ **what changed**; Governance giữ **why changed**.

---

## Meta docs

Không cần đọc toàn bộ Meta cho mọi app task.

Chỉ đọc Meta khi:

```text
tạo Entity Type mới
tạo Relation mới
validate structure
kiểm tra broken references
review documentation model
resolve placement ambiguity
```

Luồng:

```text
docs/meta/README.md
    ↓
01-entity-types/ (khi cần)
    ↓
02-relation-types/ (khi cần)
    ↓
03-rules/ (khi cần)
    ↓
04-conventions/ (khi cần)
```

---

## Token optimization

- Root README ngắn — chỉ routing
- Layer README chỉ scope và concern list
- Entity instance giữ canonical detail
- Theory có `agent.md` riêng cho agent
- Dùng stable ID thay prose lặp lại
- Không copy reasoning nhiều nơi
