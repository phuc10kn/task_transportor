# Mandatory Rules

Các rule bắt buộc khi agent đọc hoặc sửa documentation.

---

## Rule 1 — Theory Ownership

```text
Theory là project-owned synthesis.
```

Không phải bản copy của tài liệu bên ngoài.

---

## Rule 2 — Pure Theory Boundary

```text
docs/theories/
```

không chứa project-specific implementation detail.

---

## Rule 3 — Application Location

Cách áp dụng Theory phải nằm trong `docs/app/` theo đúng layer responsibility:

```text
01-business/
02-product/
04-domain/
05-architecture/
06-technical/
07-implementation/
...
```

---

## Rule 4 — No Theory Duplication

Không copy toàn bộ Theory sang app docs.

Dùng:

```text
stable ID + reference + derived rules
```

Ví dụ trong entity frontmatter:

```yaml
theory_basis:
  - TH-MOD-03
```

---

## Rule 5 — Git Owns History

Không tạo revision system riêng.

```text
Git = Theory revision history
```

---

## Rule 6 — Decision Explains Why

```text
Git diff  → what changed
Decision  → why changed
```

---

## Rule 7 — Challenge Does Not Invalidate Theory

```text
Challenge ≠ Theory invalid
```

Theory tiếp tục có hiệu lực cho tới khi có Decision thay đổi nó.

---

## Rule 8 — Progressive Disclosure

Agent không đọc toàn bộ Theory theo mặc định.

```text
Task Docs → Theory README → Full Theory → Governance
```

Chỉ mở rộng context khi cần. Xem [reading-strategy.md](reading-strategy.md).

---

## Agent authority boundary

```text
Agent output = proposal / draft / candidate
Agent output ≠ canonical mutation
```

Agent có thể: read, analyze, compare, propose, draft Challenge.

Agent không được tự ý:
- chốt canonical Theory change
- resolve Challenge
- tạo Relation Type mới khi Meta chưa canonical
- bịa Entity Type schema khi Meta chưa chốt

---

## Relation rules

```text
Không tự tạo Relation Type trong App docs.
```

Canonical Relation Type: `docs/meta/02-relation-types/`

Trước khi relation được chốt trong Meta, chỉ ghi:

```text
Related Entities
Possible Trace Direction
Open Relation Question
```
