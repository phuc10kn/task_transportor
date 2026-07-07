# Theory File Structure

Mỗi Theory nằm trong `docs/theories/<slug>/`.

```text
docs/theories/<slug>/
├── README.md       # Agent-optimized index — đọc đầu tiên
├── agent.md        # Token-optimized: rules, checklist, boundaries
├── theory.md       # Full Pure Theory — chỉ khi cần deep reasoning
└── governance.md   # Reference Notes, Challenges, Decisions
```

---

## README.md

**Mục đích:** Agent hiểu nhanh Theory bằng ít token.

Nên chứa:

```text
stable ID (TH-XXX-NN)
one-line position
key principles (bullet)
boundaries (what theory is NOT)
links to agent.md, theory.md, governance.md
influenced app areas (high level)
```

Không copy toàn bộ `theory.md`.

---

## agent.md

**Mục đích:** Bản tối ưu token cho agent review hàng ngày.

Nên chứa:

```text
core positions
stable IDs
short rules
boundaries
common violations
review checklist
read-more triggers (khi nào mở theory.md)
```

Agent mặc định đọc:

```text
README.md → agent.md
```

---

## theory.md

**Mục đích:** Full Pure Theory.

Cấu trúc gợi ý:

```text
Question
Position
Principles
Reasoning
Boundaries
Tensions
Open Questions
```

Đọc khi:

```text
deep reasoning
conflict / challenge
sửa Theory (theory-refine)
tạo derived rule mới từ principle
```

**Không chứa:** project-specific implementation detail.

---

## governance.md

**Mục đích:** Theory evolution — tại sao Theory thay đổi.

Quản lý:

```text
Reference Notes   — external knowledge influence
Challenges        — open questions against theory
Decisions         — resolved changes to theory
```

```text
Git        → what changed, when, diff
governance → why changed
```

Đọc khi:

```text
xử lý Challenge (theory-challenge)
thêm ReferenceNote
tạo Decision liên quan Theory
theory-refine sau Decision
```

---

## Stable ID

Format gợi ý: `TH-<DOMAIN>-<NN>`

Ví dụ: `TH-MOD-05`, `TH-DOM-03`

Dùng trong app docs:

```yaml
theory_basis:
  - TH-MOD-05
```

Không dùng prose dài thay ID khi reference lặp lại.

---

## Progressive disclosure

| Level | File |
|-------|------|
| 1 | App task docs |
| 2 | README.md + agent.md |
| 3 | theory.md |
| 4 | governance.md |

---

## Pure Theory boundary

Theory folder **không** chứa:

```text
MOD-001 module detail
API endpoint specs
database schema
project-specific business rules
```

Những thứ đó thuộc `docs/app/` với `theory_basis` reference.
