
================================================================================
# FILE: docs/theories/README.md
================================================================================

# Project Theories

## Mục đích

`docs/theories/` chứa các Pure Theory mà project sử dụng làm nền tảng suy luận.

Theory trả lời:

```text
Project tin điều gì?

Tại sao project tin điều đó?

Principle nào đang được sử dụng?

Tension nào đang tồn tại?

Theory chịu ảnh hưởng từ đâu?

Theory bị challenge thế nào?

Tại sao Theory thay đổi?
```

Theory không mô tả trực tiếp ứng dụng cụ thể.

---

## Vai trò

Mô hình tổng thể:

```text
External Knowledge
        ↓
Project-owned Theory
        ↓
App Documentation
        ↓
Source Code
        ↓
Observed Reality
        ↓
Challenge / Decision
        ↓
Theory Evolution
```

Theory là nền tảng chung cho toàn bộ:

```text
Context
Business
Product
UI
Domain
Architecture
Technical
Implementation
Quality
Operation
Decisions
```

Theory không thuộc riêng một layer.

---

# Pure Theory

Pure Theory không có nghĩa là:

```text
copy nguyên tài liệu học thuật

copy nguyên DDD

copy nguyên Modular Monolith

copy nguyên Deep Module
```

Pure Theory là:

> Knowledge do project sở hữu, được tổng hợp từ external knowledge, kinh nghiệm, phản biện và project reality, nhưng chưa chứa application-specific detail.

Theory có thể:

```text
use
adapt
reject
conflict with
```

external knowledge.

---

# Ranh giới

Không được trộn:

```text
Theory
+
Project-specific Application
+
Implementation Detail
```

Phải tách:

```text
Theory
→ principle

App Documentation
→ project-specific application

Source Code
→ implementation
```

Ví dụ:

```text
Theory:

Shared infrastructure có thể tồn tại
nếu không sở hữu business policy.
```

App Documentation:

```text
spec-graph là shared platform unit.
```

Implementation:

```text
src/modules/spec-graph/
```

---

# Cấu trúc

```text
docs/theories/
├── README.md
├── governance.md
│
└── <theory>/
    ├── README.md
    ├── agent.md
    ├── theory.md
    └── governance.md
```

Ví dụ:

```text
docs/theories/
├── modular-architecture/
├── hub-mediated-integration/
├── canonical-state-governance/
├── human-governed-ai-assistance/
├── safe-external-synchronization/
└── recoverable-operations/
```

Các Theory ngang hàng.

Không đánh số folder Theory nếu không có dependency đọc bắt buộc.

---

# `README.md`

## Vai trò

`README.md` là index và routing entry point của một Theory.

Nó trả lời nhanh:

```text
Theory này là gì?
Theory giải quyết problem space nào?
Core positions là gì?
Khi nào Agent cần đọc?
File nào cần mở tiếp?
```

Nên chứa:

```text
Theory ID
Purpose
Core Positions
Key Tensions
Read agent.md when
Read theory.md when
Read governance.md when
```

README không copy toàn bộ Theory.

---

# `agent.md`

## Vai trò

`agent.md` là bản nén tối ưu cho AI Agent.

Mục tiêu:

```text
maximum relevant knowledge
minimum token cost
```

Nên chứa:

```text
stable Theory IDs
core positions
short rules
boundaries
common violations
review checklist
read-more triggers
```

Agent mặc định đọc:

```text
Theory README
    ↓
agent.md
```

Không mặc định đọc full `theory.md`.

---

# `theory.md`

## Vai trò

`theory.md` chứa full Pure Theory.

Nó có thể gồm:

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
cần deep reasoning
có conflict
cần tạo principle mới
cần sửa Theory
cần challenge Theory
cần giải quyết tension
```

---

# `governance.md`

## Vai trò

`governance.md` quản lý Theory evolution.

Có thể chứa:

```text
Reference Notes
Challenges
Decisions
```

Git giữ:

```text
what changed
when
who
diff
```

Governance giữ:

```text
why Theory changed
```

---

# Reference Notes

Reference Note ghi lại external influence thực sự đi vào Theory.

Không dùng Theory Governance như research library.

Không cần lưu:

```text
mọi article đã đọc
mọi paper đã xem
full source snapshot
toàn bộ citation database
```

Chỉ ghi khi external knowledge thực sự:

```text
used
adapted
rejected
conflicting
```

---

# Challenge

Challenge là:

> Một điểm của Theory đang bị nghi ngờ hoặc cần xem lại.

```text
Challenge
≠
Theory Invalid
```

Theory hiện tại tiếp tục có hiệu lực cho tới khi có Decision thay đổi.

Status tối thiểu:

```text
open
resolved
dismissed
```

---

# Theory Decision

Theory Decision giải thích:

```text
tại sao giữ Theory
tại sao sửa Theory
tại sao loại bỏ position
```

Luồng:

```text
Reference / Project Reality
        ↓
Challenge
        ↓
Analysis
        ↓
Decision
        ↓
Keep / Refine / Replace Theory
```

---

# Stable ID

Theory position nên có stable ID.

Ví dụ:

```text
TH-MOD-01
TH-MOD-02
TH-KNOW-03
```

Stable ID phục vụ:

```text
traceability
precise review
agent targeting
repository search
impact analysis
```

---

# Theory → App

Theory không tự govern source code.

Theory cần được áp dụng thông qua App Documentation.

```text
Theory
    ↓

App Context
+
App-specific Rule
+
Decision
    ↓

Implementation
```

Ví dụ:

```text
TH-MOD-05
    ↓ influences

Architecture Unit
    ↓ implemented by

Code
```

Exact Relation Type chỉ canonical khi được Meta định nghĩa.

---

# Theory Basis

App Entity có thể reference Theory:

```yaml
theory_basis:
  - TH-MOD-03
```

Không copy:

```text
2.000 token Theory
```

vào entity.

Dùng:

```text
Theory ID
+
Project Context
+
App-specific Application
```

---

# Theory không reference App cụ thể

Theory không nên nói:

```text
MOD-001
spec-graph
OrderModule
src/modules/payment/
```

nếu đó là application-specific detail.

Direction chính:

```text
App Entity
    ↓ references
Theory
```

không phải:

```text
Theory
    ↓ stores list of all App Entities
```

Impact analysis có thể dùng repository search.

---

# Root Theory Index

File này là root index cho Agent.

Mỗi active Theory nên có:

```text
Theory ID
Name
Path
Purpose
Read When
Status
```

Active theory set v1:

| Theory ID | Name | Path | Purpose | Read When | Status |
| --- | --- | --- | --- | --- | --- |
| `TH-MODULAR` | Modular Architecture | `modular-architecture/` | Định nghĩa cách project hiểu module, boundary và ownership. | Khi thiết kế/review module boundary, ownership, public surface. | active |
| `TH-HUBFLOW` | Hub-mediated Integration | `hub-mediated-integration/` | Định nghĩa vì sao integration phải đi qua core hub thay vì point-to-point. | Khi giải thích hoặc route flow `System -> Core Hub -> System`. | active |
| `TH-CANON` | Canonical State Governance | `canonical-state-governance/` | Định nghĩa canonical truth, source snapshot, owner và operational state. | Khi phân biệt source snapshot, canonical state, workflow/read model. | active |
| `TH-AI-GOV` | Human-governed AI Assistance | `human-governed-ai-assistance/` | Định nghĩa vai trò AI propose/analyze và human final authority. | Khi thiết kế AI draft, review, approval, provider/transport boundary. | active |
| `TH-SYNC-SAFE` | Safe External Synchronization | `safe-external-synchronization/` | Định nghĩa guardrail cho outbound write, dry-run, readiness và stale preview. | Khi thiết kế dry-run, pre-check, external write gate, stale preview. | active |
| `TH-OPS-TRACE` | Recoverable Operations and Traceability | `recoverable-operations/` | Định nghĩa traceability, recoverability, retry và audit/journal reasoning. | Khi thiết kế job, retry, audit, journal, recoverability. | active |

`planned`, `materialized`, `active`, `deprecated`, `superseded` được định nghĩa trong `docs/meta/04-conventions/status-vocabulary.md`.

---

# Theory System Governance

Rule tạo mới, split và quản trị boundary của Theory Groups được giữ canonical ở:

- [governance.md](./governance.md)

Đọc file đó khi:

- cần quyết định có nên tạo Theory Group mới hay không;
- cần kiểm tra một Theory Group đang quá lớn hay chưa;
- cần điền `Theory Boundary Matrix`;
- cần phân biệt thứ gì thuộc Theory Group hiện có và thứ gì phải tách ra group khác.

---

# Agent Reading Strategy

## Level 1 — Root Index

```text
docs/theories/README.md
```

Dùng để tìm Theory liên quan.

---

## Level 2 — Theory Summary

```text
<theory>/README.md
```

Dùng để hiểu nhanh Theory.

---

## Level 3 — Agent Knowledge

```text
<theory>/agent.md
```

Dùng cho normal reasoning và review.

---

## Level 4 — Full Theory

```text
<theory>/theory.md
```

Chỉ đọc khi cần deep reasoning.

---

## Level 5 — Governance

```text
<theory>/governance.md
```

Chỉ đọc khi cần:

```text
history
challenge
external influence
Theory change
```

---

# Theory Workflow

## External Knowledge

```text
External Knowledge
        ↓
Relevant?
    ┌───┴───┐
    │       │
   No      Yes
    │       │
 Ignore    ▼
      Reference Note
             ↓
      Challenges Theory?
        ┌────┴────┐
        │         │
       No        Yes
        │         │
        ▼         ▼
 Record Influence
              Challenge
                  ↓
               Decision
             ┌────┴────┐
             │         │
            Keep      Change
                        ↓
                  Edit Theory
                        ↓
                  Impact Review
                        ↓
                 Update App Docs
```

---

## Project Reality

```text
Source Code
        ↓
Observed Reality
        ↓
Mismatch
        ↓
Determine mismatch type
```

Possible outcomes:

```text
Code wrong
→ fix code

App docs wrong
→ update App docs

Theory questionable
→ open Challenge
```

---

# Relation với Meta

Theory structure cũng phải tuân theo documentation system.

Meta có thể định nghĩa:

```text
Theory-related ID conventions
Theory reference format
allowed relation to App Entities
validation rules
```

Tuy nhiên Meta không định nghĩa:

```text
Theory phải tin điều gì
Theory content cụ thể
Theory reasoning
```

---

# Canonical Source

```text
Markdown
+
Git
=
canonical Theory source
```

Không cần database riêng.

Search index hoặc graph có thể được derive từ Markdown.

---

# Không tạo Theory khi

Không tạo một Theory mới chỉ vì:

```text
đọc được một article hay
framework có concept mới
cần lưu note
cần lưu link
cần document một Decision
```

Theory nên tồn tại khi project cần một:

```text
stable problem space
+
project-owned position
+
reusable reasoning foundation
```

---

# Anti-patterns

Không:

```text
giant project-theory.md

copy internet article thành Theory

đặt application detail trong Theory

copy full Theory sang App docs

đọc toàn bộ Theory cho mọi task

lưu mọi nguồn đã đọc

tạo Theory ID giả

chỉnh Theory mà không review impact
```

---

# Nguyên tắc cuối cùng

```text
Theory
→ project-owned reasoning foundation

README
→ routing

agent.md
→ compressed operational knowledge

theory.md
→ full reasoning

governance.md
→ evolution

Git
→ revision history

App Docs
→ application of Theory
```
