# Theory Governance Lite — Repo-native Model

## 1. Mục tiêu

Theory Governance Lite là hệ thống quản lý các lý thuyết mà project:

* tin là hữu ích;
* sử dụng làm nền tảng suy luận;
* tự tổng hợp và điều chỉnh;
* có thể phản biện;
* có thể thay đổi theo thời gian.

Toàn bộ hệ thống:

```text
- lưu bằng Markdown;
- nằm cùng Git repository với source code;
- được versioning bằng Git;
- được AI Agent đọc và hỗ trợ quản lý;
- không sử dụng database riêng;
- không xây knowledge graph phức tạp;
- không lưu toàn bộ tài liệu nguồn.
```

Theory Governance Lite không phải:

```text
document management system
knowledge base tổng quát
research library
citation database
RAG system
general-purpose theory platform
```

Nó là:

> **Một lớp lý thuyết sống cùng project, làm nền tảng cho Business, Architecture, Technical Design và các quyết định phát triển.**

---

# 2. Mô hình tổng thể

Hệ thống có ba tầng chính:

```text
PURE THEORY
     ↓
PROJECT DOCUMENTATION
     ↓
SOURCE CODE
```

Cụ thể:

```text
docs/theories/
        ↓ informs

docs/business/
docs/architecture/
docs/technical/
docs/...
        ↓ governs

source code
```

Ý nghĩa:

```text
Theory
→ Project tin điều gì và vì sao

Project Documentation
→ Project áp dụng Theory đó như thế nào

Source Code
→ Implementation hiện tại của các rule đã được định nghĩa
```

---

# 3. Ranh giới quan trọng nhất

## Theory không phải Project Documentation

Không được trộn:

```text
Theory
+
Project-specific rules
+
Folder structure
+
Class names
+
Implementation details
```

vào cùng một tài liệu.

Phải tách:

```text
Theory Layer
→ lý thuyết thuần

Project Documentation Layer
→ cách project áp dụng lý thuyết

Implementation Layer
→ code thực tế
```

Ví dụ:

```text
Theory:

Shared infrastructure có thể tồn tại
nếu nó không sở hữu business policy.
```

Đây là lý thuyết.

Còn:

```text
Architecture:

spec-graph là shared platform module.

spec-graph được phép:
- graph persistence;
- graph querying;
- shared traversal.

spec-graph không được phép:
- sở hữu business decision;
- chứa module-specific policy.
```

Đây là cách project áp dụng Theory.

Còn:

```text
src/modules/spec-graph/
```

là implementation.

---

# 4. Folder structure tổng thể

```text
docs/
│
├── theories/
│   │
│   ├── README.md
│   │
│   ├── modular-architecture/
│   │   ├── README.md
│   │   ├── theory.md
│   │   └── governance.md
│   │
│   ├── ai-knowledge-governance/
│   │   ├── README.md
│   │   ├── theory.md
│   │   └── governance.md
│   │
│   └── specification-evolution/
│       ├── README.md
│       ├── theory.md
│       └── governance.md
│
├── business/
│   └── ...
│
├── architecture/
│   ├── module-boundaries.md
│   ├── shared-platform.md
│   └── ai-governance.md
│
├── technical/
│   └── ...
│
├── implementation/
│   └── ...
│
└── ...
```

Không tạo:

```text
docs/theories/<theory>/application.md
```

vì cách áp dụng Theory phải nằm trong đúng layer của project.

Ví dụ:

```text
Business application
→ docs/business/

Architecture application
→ docs/architecture/

Technical application
→ docs/technical/

Implementation convention
→ docs/implementation/
```

---

# 5. Vai trò của từng layer

## `docs/theories/`

Trả lời:

```text
Project tin điều gì?

Tại sao project tin điều đó?

Những principle nào đang được sử dụng?

Có tension hoặc vấn đề chưa giải quyết nào?

Theory này chịu ảnh hưởng từ đâu?

Theory đã bị challenge thế nào?

Tại sao Theory thay đổi?
```

Theory không định nghĩa chi tiết implementation.

---

## `docs/business/`

Trả lời:

```text
Business cần gì?

Business vận hành như thế nào?

Business rule nào phải được tuân thủ?

Stakeholder cần đạt mục tiêu gì?

Theory nào ảnh hưởng đến cách định nghĩa business?
```

---

## `docs/architecture/`

Trả lời:

```text
System được cấu trúc thế nào?

Boundary nằm ở đâu?

Module phụ thuộc nhau thế nào?

State được quản lý ở đâu?

Theory nào làm nền tảng cho các architecture rule?
```

---

## `docs/technical/`

Trả lời:

```text
Technology nào được chọn?

Technical constraint nào tồn tại?

Cơ chế cụ thể hoạt động thế nào?

Theory và architecture nào dẫn tới technical solution này?
```

---

## Source code

Trả lời:

```text
Rule hiện được implement thế nào?
```

Source code không phải nơi duy nhất giữ architecture knowledge.

---

# 6. Pure Theory là gì?

Pure Theory trong hệ thống này không có nghĩa là:

```text
lý thuyết học thuật nguyên bản
```

Nó cũng không có nghĩa:

```text
copy nguyên Modular Monolith
copy nguyên DDD
copy nguyên Deep Module
```

Pure Theory là:

> **Lý thuyết do project tự sở hữu, được tổng hợp từ kiến thức bên ngoài, kinh nghiệm, phản biện và định hướng riêng, nhưng chưa chứa chi tiết áp dụng cụ thể vào cấu trúc project.**

Ví dụ project đọc:

```text
Modular Monolith
Deep Module
Information Hiding
DDD
project experience
```

Sau đó tổng hợp thành:

```text
Module boundary quan trọng hơn folder structure.

Business behavior phải có owner rõ ràng.

Deep module được ưu tiên hơn shallow module.

Internal complexity phải được che giấu.

Shared infrastructure có thể tồn tại
nếu nó không sở hữu business policy.

Physical data ownership là contextual,
không phải universal requirement.
```

Đây là Pure Theory của project.

Nó không cần giống hoàn toàn bất kỳ tài liệu bên ngoài nào.

Nó có thể:

```text
use
adapt
reject
contradict
```

các quan điểm bên ngoài.

---

# 7. Cấu trúc mỗi Theory

Mỗi Theory dùng folder riêng:

```text
docs/theories/<theory-name>/
├── README.md
├── theory.md
└── governance.md
```

Ví dụ:

```text
docs/theories/modular-architecture/
├── README.md
├── theory.md
└── governance.md
```

Ba file có trách nhiệm hoàn toàn khác nhau.

---

# 8. `README.md` — Agent-optimized Theory Index

`README.md` là entry point chính cho AI Agent.

Mục tiêu:

> **Cho Agent hiểu Theory với lượng token thấp nhất có thể.**

Agent không nên phải đọc toàn bộ `theory.md` cho mọi task.

Ví dụ:

```md
# Modular Architecture Theory

ID: TH-MODULAR

## Purpose

Định nghĩa cách project hiểu về module,
module boundary và module ownership.

## Core Positions

- TH-MOD-01: Behavioral ownership is primary.
- TH-MOD-02: Module boundary matters more than uniform structure.
- TH-MOD-03: Prefer deep modules.
- TH-MOD-04: Internal implementation must remain hidden.
- TH-MOD-05: Infrastructure sharing is contextual.

## Key Tensions

- Shared infrastructure may weaken module boundaries.
- Flexible internal structure may reduce code discoverability.
- Behavioral ownership may conflict with strict data ownership.

## Read Full Theory When

Read `theory.md` when:

- designing new module boundaries;
- challenging module ownership;
- resolving shared infrastructure conflicts;
- changing module architecture principles;
- reviewing whether the Theory itself is still valid.

## Governance

Read `governance.md` when:

- introducing external knowledge;
- opening or resolving a challenge;
- changing the Theory;
- reviewing historical decisions.
```

Rule:

```text
Normal task
→ README.md

Need deeper reasoning
→ theory.md

Need history or challenge
→ governance.md
```

---

# 9. `theory.md` — Full Pure Theory

`theory.md` chứa nội dung lý thuyết đầy đủ.

Nó phải trả lời:

```text
Theory này đang giải quyết câu hỏi gì?

Project hiện giữ position nào?

Các principle chính là gì?

Tại sao?

Các tension nào vẫn tồn tại?
```

Cấu trúc đề xuất:

```md
# <Theory Name>

## Question

## Position

## Principles

## Reasoning

## Boundaries

## Tensions

## Open Questions
```

Không bắt buộc Theory nào cũng phải có đầy đủ mọi section.

---

# 10. Ví dụ `theory.md`

````md
# Modular Architecture Theory

## Question

Một module tốt nên được xác định,
tổ chức và bảo vệ boundary như thế nào?

## Position

Module boundary quan trọng hơn
cấu trúc folder đồng nhất.

Một module tốt phải:

- có responsibility rõ ràng;
- che giấu internal complexity;
- expose public surface nhỏ;
- có ownership rõ đối với behavior.

Project không coi strict physical data ownership
là yêu cầu bắt buộc cho mọi module.

Shared infrastructure có thể tồn tại
nếu nó không sở hữu business policy.

## Principles

### TH-MOD-01 — Behavioral Ownership

Mọi business behavior quan trọng phải có owner rõ ràng.

Một behavior không nên được implement
rải rác trong nhiều module mà không có ownership.

### TH-MOD-02 — Boundary over Uniform Structure

Chất lượng module được đánh giá chủ yếu bằng boundary,
không phải bằng việc mọi module có cùng folder structure.

Một module nhỏ không cần bắt buộc có:

- domain/
- application/
- infrastructure/

### TH-MOD-03 — Deep Module Preference

Một module tốt nên che giấu nhiều complexity
sau một public surface nhỏ.

Ưu tiên:

```text
small interface
+
high hidden complexity
````

hơn:

```text
large interface
+
thin implementation
```

### TH-MOD-04 — Information Hiding

Internal implementation của module
không phải contract cho module khác.

Module khác chỉ nên phụ thuộc vào public surface.

### TH-MOD-05 — Contextual Infrastructure Sharing

Shared infrastructure được phép tồn tại.

Điều kiện:

```text
shared infrastructure
≠
shared business ownership
```

Một shared capability không nên sở hữu
business policy của nhiều module.

### TH-MOD-06 — Data Ownership is Contextual

Physical table ownership không phải lúc nào
cũng là boundary quan trọng nhất.

Trong một số hệ thống:

```text
behavior ownership
```

quan trọng hơn:

```text
physical storage ownership
```

Tuy nhiên việc shared data không được phép
làm mất responsibility boundary.

## Reasoning

Uniform folder structure có thể làm code dễ nhìn hơn,
nhưng không đảm bảo module thực sự có boundary.

Ngược lại, một module có internal structure khác biệt
vẫn có thể là module tốt nếu:

* public contract nhỏ;
* responsibility rõ;
* dependency được kiểm soát;
* internal complexity được che giấu.

Do đó Theory ưu tiên semantic boundary
hơn structural symmetry.

## Boundaries

Theory này không định nghĩa:

* folder cụ thể của project;
* module nào đang tồn tại;
* class nào thuộc module nào;
* database schema cụ thể;
* dependency rule cụ thể.

Những nội dung đó thuộc project documentation.

## Tensions

### Shared Infrastructure vs Module Autonomy

Shared infrastructure giúp giảm duplication
nhưng có thể tạo hidden coupling.

### Flexible Structure vs Discoverability

Không bắt buộc uniform folder structure
có thể làm code khó khám phá hơn.

### Behavioral Ownership vs Data Ownership

Một số cách hiểu Modular Monolith
coi strict data ownership là bắt buộc.

Theory này không hoàn toàn đồng ý với quan điểm đó.

## Open Questions

* Khi nào shared infrastructure bắt đầu trở thành shared business logic?
* Làm sao xác định module đang quá shallow?
* Khi nào data ownership phải trở thành strict boundary?

````

---

# 11. Rule cho `theory.md`

Không được chứa:

```text
src/modules/payment/
spec-graph/
UserRepository
OrderService
folder X phải nằm trong folder Y
class A gọi class B
````

Không được chứa project-specific application detail.

Ví dụ không nên viết:

```text
spec-graph phải là shared infrastructure module.
```

Đây là Architecture.

Trong Theory chỉ nên viết:

```text
Shared infrastructure có thể tồn tại
nếu không sở hữu business policy.
```

---

# 12. `governance.md` — Theory Evolution

`governance.md` quản lý:

```text
Reference Notes
Challenges
Decisions
```

Cấu trúc:

```md
# Governance

## Reference Notes

## Challenges

## Decisions
```

Git quản lý:

```text
what changed
when
who changed it
actual diff
```

Governance quản lý:

```text
why the Theory changed
```

Hai thứ không trùng nhau.

---

# 13. Reference Notes

ReferenceNote ghi lại:

> **Ảnh hưởng bên ngoài nào thực sự đi vào Theory.**

Không lưu toàn bộ tài liệu nguồn.

Không cần:

```text
full article
full paper
source snapshot
source version
retrieval chunk
exact line citation
```

Chỉ lưu:

```text
project đã học gì?
project giữ gì?
project sửa gì?
project phản đối gì?
```

Relation chỉ cần:

```text
used
adapted
rejected
conflicting
```

---

# 14. `used`

Project sử dụng gần như trực tiếp một ý tưởng.

Ví dụ:

```md
### REF-001 — Information Hiding

Relation: used

Reference:
Information Hiding

Influence:

Internal implementation phải được che giấu
khỏi consumer bên ngoài module.

Affected Theory:

- TH-MOD-04
```

---

# 15. `adapted`

Project giữ core idea nhưng thay đổi cách hiểu.

Ví dụ:

````md
### REF-002 — Deep Module

Relation: adapted

Influence:

Giữ nguyên tư tưởng:

```text
small interface
+
high hidden complexity
````

Adaptation:

Project không cho rằng mọi module
phải có cùng internal architecture.

Affected Theory:

* TH-MOD-02
* TH-MOD-03

````

---

# 16. `rejected`

Project đã xem xét và chủ động không áp dụng.

Ví dụ:

```md
### REF-003 — Strict Physical Data Ownership

Relation: rejected

External Position:

Mỗi module phải sở hữu hoàn toàn persistence của nó.

Project Position:

Behavioral ownership quan trọng hơn
physical storage ownership trong mọi trường hợp.

Reason:

Một số loại knowledge hoặc infrastructure
có tính cross-module tự nhiên.

Affected Theory:

- TH-MOD-05
- TH-MOD-06
````

---

# 17. `conflicting`

Một quan điểm bên ngoài đang mâu thuẫn với Theory,
nhưng conflict vẫn đáng theo dõi.

Ví dụ:

```md
### REF-004 — Shared Database Weakens Autonomy

Relation: conflicting

External Position:

Shared persistence làm giảm module autonomy.

Current Theory:

Infrastructure sharing có thể chấp nhận được
trong một số context.

Unresolved Tension:

Chưa có boundary rõ để xác định
khi nào shared persistence tạo coupling nguy hiểm.

Affected Theory:

- TH-MOD-05
- TH-MOD-06
```

Phân biệt:

```text
rejected
→ project đã có lập trường

conflicting
→ tension vẫn còn cần theo dõi
```

---

# 18. Challenge

Challenge là:

> **Một điểm của Theory đang bị nghi ngờ hoặc cần xem lại.**

Ví dụ:

```md
### CH-001 — Is Behavioral Ownership Enough?

Status: open

Question:

Behavioral ownership có đủ để giữ module boundary
khi nhiều module cùng sử dụng shared data hay không?

Context:

Một số architecture model cho rằng
strict data ownership là điều kiện bắt buộc.

Affected Theory:

- TH-MOD-05
- TH-MOD-06
```

Challenge không làm Theory mất hiệu lực.

```text
Challenge
≠
Theory invalid
```

Theory hiện tại vẫn được sử dụng
cho tới khi có Decision thay đổi nó.

Status tối giản:

```text
open
resolved
dismissed
```

---

# 19. Decision

Decision ghi lại:

> **Tại sao Theory được thay đổi hoặc giữ nguyên.**

Ví dụ:

```md
### DEC-003 — Keep Contextual Data Ownership

Status: accepted

Decision:

Tiếp tục giữ TH-MOD-06.

Behavioral ownership vẫn được xem là primary boundary.

Physical data ownership chỉ trở thành strict requirement
khi shared persistence tạo ra business coupling.

Reason:

Yêu cầu strict ownership trong mọi trường hợp
tạo complexity không cần thiết.

Resolves:

- CH-001

Affected Theory:

- TH-MOD-05
- TH-MOD-06
```

Decision giải thích:

```text
why
```

Git diff giải thích:

```text
what changed
```

---

# 20. Git là Theory Revision System

Bản Lite không cần entity riêng:

```text
TheoryRevision
```

vì:

```text
Markdown
+
Git
=
revision history
```

Git đã cung cấp:

```text
commit history
diff
author
timestamp
restore
branch
PR review
```

Không cần tạo:

```text
revision-001.md
revision-002.md
revision-003.md
```

Workflow:

```text
Current Theory
        ↓
Challenge / ReferenceNote
        ↓
Edit theory.md
        ↓
Record Decision
        ↓
Git commit
```

Ví dụ commit:

```text
theory(modular): clarify contextual data ownership
```

---

# 21. Root Theory Index

File:

```text
docs/theories/README.md
```

dùng để cho Agent biết toàn bộ Theory hiện có.

Ví dụ:

````md
# Project Theories

## Active Theories

### TH-MODULAR — Modular Architecture

Path:

```text
docs/theories/modular-architecture/
````

Purpose:

Định nghĩa cách project hiểu về module,
boundary và ownership.

Read when:

* designing module architecture;
* reviewing module boundaries;
* resolving shared infrastructure questions.

---

### TH-AI-GOV — AI Knowledge Governance

Path:

```text
docs/theories/ai-knowledge-governance/
```

Purpose:

Định nghĩa cách AI tham gia
vào việc thay đổi project knowledge.

Read when:

* designing AI workflows;
* reviewing agent permissions;
* modifying canonical knowledge flow.

````

Agent có thể bắt đầu từ file này.

---

# 22. Project Documentation áp dụng Theory thế nào?

Theory không tự govern code.

Project Documentation phải chuyển Theory thành:

```text
project context
constraints
rules
decisions
````

Ví dụ:

```text
Theory
→ Architecture Rule
→ Source Code
```

---

# 23. Ví dụ Theory → Architecture

Theory:

```text
TH-MOD-05

Shared infrastructure được phép tồn tại
nếu không sở hữu business policy.
```

Architecture:

```md
# Shared Platform Architecture

## Theory Basis

Derived from:

- TH-MOD-05

## Project Context

Project có shared specification graph
được nhiều business module sử dụng.

## Architecture Decision

`spec-graph` là shared platform module.

## Rules

### AR-GRAPH-01

spec-graph MAY provide:

- graph persistence;
- graph querying;
- graph traversal.

Derived from:

- TH-MOD-05

### AR-GRAPH-02

spec-graph MUST NOT own:

- business policy;
- module-specific decision;
- business workflow.

Derived from:

- TH-MOD-01
- TH-MOD-05
```

Theory không nhắc:

```text
spec-graph
```

Architecture mới nhắc.

---

# 24. Ví dụ Theory → Business

Theory:

```text
Human review nên tập trung vào
high-impact và irreversible decisions.
```

Business:

```md
# Business Governance

## Theory Basis

- TH-GOV-03

## Rules

### BG-GOV-01

Human approval MUST be required before:

- accepting a Business Specification;
- removing an accepted Business Rule;
- changing a critical business constraint.
```

---

# 25. Ví dụ Theory → Technical

Theory:

```text
Workflow state không nên được coi là canonical domain state.
```

Architecture:

```text
LangGraph owns workflow execution state.

PostgreSQL owns canonical knowledge state.
```

Technical:

```text
LangGraph checkpoint tables
không được query như canonical domain source.
```

Source code:

```text
CanonicalRepository
```

không đọc state trực tiếp từ workflow checkpoint.

---

# 26. Relation giữa Theory và Project Docs

Không copy toàn bộ Theory vào project docs.

Sai:

```text
architecture.md
→ copy 2.000 token Theory
→ thêm 5 rule
```

Đúng:

```text
architecture.md
→ reference Theory ID
→ thêm Project Context
→ thêm Derived Rules
```

Ví dụ:

```md
## Theory Basis

- TH-MOD-01
- TH-MOD-03
- TH-MOD-05
```

Sau đó:

```md
## Derived Rules
```

Agent chỉ đọc full Theory khi thực sự cần.

---

# 27. Stable ID

Theory position nên có stable ID.

Ví dụ:

```text
TH-MOD-01
TH-MOD-02
TH-MOD-03
```

Project rule cũng có stable ID:

```text
AR-MOD-01
AR-MOD-02
```

Relation:

```text
AR-MOD-01
    ↓ derived_from
TH-MOD-01
```

Lợi ích:

```text
traceability
agent targeting
precise review
lower token usage
impact analysis
```

Agent có thể báo:

```text
AR-MOD-02 appears inconsistent with TH-MOD-05.
```

Thay vì:

```text
Một đoạn architecture có vẻ không phù hợp
với một đoạn theory nào đó.
```

---

# 28. Agent Reading Strategy

Không cho Agent đọc toàn bộ `docs/`.

Dùng progressive disclosure.

## Level 1 — Task Docs

Task bình thường:

```text
đọc đúng docs của layer liên quan
```

Ví dụ architecture task:

```text
docs/architecture/
```

---

## Level 2 — Theory Summary

Khi project docs reference:

```text
TH-MOD-05
```

Agent có thể đọc:

```text
docs/theories/modular-architecture/README.md
```

---

## Level 3 — Full Theory

Chỉ đọc:

```text
theory.md
```

khi:

```text
cần hiểu sâu reasoning
có conflict
có challenge
cần sửa Theory
cần tạo architecture rule mới
```

---

## Level 4 — Governance

Chỉ đọc:

```text
governance.md
```

khi:

```text
cần biết tại sao Theory thay đổi
cần xử lý Challenge
cần thêm ReferenceNote
cần tạo Decision
```

---

# 29. Agent Skill Model

Bản Lite không cần Agent System phức tạp.

Chỉ cần các skills hỗ trợ đọc và sửa Markdown.

---

## `theory-find`

Mục tiêu:

```text
Tìm Theory liên quan tới task hiện tại.
```

Input:

```text
task
project context
```

Read:

```text
docs/theories/README.md
```

Output:

```text
relevant theory IDs
relevant paths
whether full theory is needed
```

---

## `theory-review`

Mục tiêu:

```text
Kiểm tra Project Documentation hoặc code
có mâu thuẫn với Theory hay không.
```

Read:

```text
relevant project docs
relevant Theory README
full theory only when necessary
```

Output:

```text
violation
possible violation
theory tension
missing rule
```

---

## `theory-challenge`

Mục tiêu:

```text
Tạo Challenge khi Theory có vấn đề.
```

Trigger:

```text
new external knowledge
project experience
code conflict
architecture conflict
unresolved tension
```

Output:

```text
draft Challenge
```

Không tự sửa Theory.

---

## `theory-refine`

Mục tiêu:

```text
Đề xuất thay đổi Theory.
```

Read:

```text
README.md
theory.md
governance.md
relevant project context
```

Output:

```text
proposed Theory patch
affected Theory IDs
affected project docs
reasoning
```

---

## `theory-impact`

Mục tiêu:

```text
Tìm project docs nào có thể bị ảnh hưởng
khi Theory thay đổi.
```

Ví dụ:

```text
TH-MOD-05 changed
```

Search:

```text
docs/
```

for:

```text
TH-MOD-05
```

Output:

```text
architecture files
business files
technical files
rules requiring review
```

Không cần graph database.

Stable IDs + repository search là đủ cho bản Lite.

---

# 30. End-to-end workflow: External Knowledge

```text
External Knowledge
        ↓
Is it relevant?
        │
        ├── No
        │    ↓
        │   Ignore
        │
        └── Yes
              ↓
        ReferenceNote
              ↓
    Does it challenge Theory?
        │
        ├── No
        │    ↓
        │   Record influence
        │
        └── Yes
              ↓
          Challenge
              ↓
           Analysis
              ↓
          Decision
              │
              ├── Keep Theory
              │
              └── Change Theory
                       ↓
                  Edit theory.md
                       ↓
                  Impact Review
                       ↓
             Update Project Docs
                       ↓
                    Git Commit
```

---

# 31. End-to-end workflow: Project Reality

```text
Source Code
        ↓
Agent / Human Review
        ↓
Mismatch found
        ↓
Determine mismatch type
```

Trường hợp 1:

```text
Code
≠
Project Rule

→ code sai
→ sửa code
```

Trường hợp 2:

```text
Project Rule
≠
Theory

→ project docs có thể sai
→ review rule
```

Trường hợp 3:

```text
Project Reality
≠
Theory

→ Theory có thể sai hoặc thiếu
→ open Challenge
```

Luồng đầy đủ:

```text
Theory
↓
Project Documentation
↓
Code
↓
Observed Reality
↓
Challenge
↓
Decision
↓
Theory or Project Docs change
```

---

# 32. Nguyên tắc bắt buộc

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

Cách áp dụng Theory phải nằm trong:

```text
business/
architecture/
technical/
implementation/
...
```

theo đúng responsibility.

---

## Rule 4 — No Theory Duplication

Không copy toàn bộ Theory sang project docs.

Dùng:

```text
stable ID
+
reference
+
derived rules
```

---

## Rule 5 — Git Owns History

Không tạo revision system riêng.

```text
Git
= Theory revision history
```

---

## Rule 6 — Decision Explains Why

```text
Git diff
→ what changed

Decision
→ why changed
```

---

## Rule 7 — Challenge Does Not Invalidate Theory

```text
Challenge
≠
Theory invalid
```

Theory tiếp tục có hiệu lực
cho tới khi có Decision thay đổi nó.

---

## Rule 8 — Progressive Disclosure

Agent không đọc toàn bộ Theory theo mặc định.

```text
Task Docs
→ Theory README
→ Full Theory
→ Governance
```

chỉ mở rộng context khi cần.

---

# 33. Anti-patterns

## Anti-pattern 1 — Giant Theory Document

Không:

```text
docs/theories/project-theory.md
```

chứa:

```text
business
architecture
AI
database
module
workflow
coding
```

Nên tách Theory theo problem space.

---

## Anti-pattern 2 — Theory as Copy of Internet Knowledge

Không:

```text
theory.md
= summary của Modular Monolith article
```

Theory phải là:

```text
project-owned position
```

---

## Anti-pattern 3 — Application inside Theory

Không:

```text
TH-MOD-05:

spec-graph nằm trong src/core/spec-graph.
```

Đó là Architecture.

---

## Anti-pattern 4 — Duplicated Why

Không lặp lại full reasoning trong:

```text
Theory
Architecture
Technical
Implementation
```

Theory giữ reasoning gốc.

Project docs chỉ reference và áp dụng.

---

## Anti-pattern 5 — Agent Reads Everything

Không:

```text
read all docs/theories/**
```

cho mọi task.

Dùng progressive loading.

---

## Anti-pattern 6 — Reference Hoarding

Không lưu mọi thứ đã đọc.

Chỉ tạo ReferenceNote khi nội dung bên ngoài:

```text
used
adapted
rejected
conflicting
```

với Theory thực tế.

---

# 34. Mô hình cuối cùng

```text
                    EXTERNAL KNOWLEDGE
                           │
                           ▼
                     ReferenceNote
                           │
                           ▼
┌───────────────────────────────────────────┐
│              PURE THEORY                  │
│                                           │
│ docs/theories/<theory>/                   │
│                                           │
│ README.md                                 │
│ → token-efficient summary                 │
│                                           │
│ theory.md                                 │
│ → full project-owned theory               │
│                                           │
│ governance.md                             │
│ → references                              │
│ → challenges                              │
│ → decisions                               │
└────────────────────┬──────────────────────┘
                     │
                     │ informs
                     ▼
┌───────────────────────────────────────────┐
│          PROJECT DOCUMENTATION            │
│                                           │
│ docs/business/                            │
│ docs/architecture/                        │
│ docs/technical/                           │
│ docs/...                                  │
│                                           │
│ → project context                         │
│ → concrete rules                          │
│ → constraints                             │
│ → decisions                               │
│ → references to Theory IDs                │
└────────────────────┬──────────────────────┘
                     │
                     │ governs
                     ▼
┌───────────────────────────────────────────┐
│              SOURCE CODE                  │
│                                           │
│ → current implementation                  │
└────────────────────┬──────────────────────┘
                     │
                     │ feedback
                     ▼
              Challenge / Decision
                     │
                     └──────→ Theory Evolution
```

---

# 35. Core definition

Theory Governance Lite cuối cùng là:

```text
Theory
→ Project tin điều gì và vì sao

Theory README
→ Agent hiểu nhanh Theory bằng ít token

Theory Governance
→ Theory chịu ảnh hưởng, bị challenge và thay đổi thế nào

Project Documentation
→ Theory được áp dụng vào project như thế nào

Source Code
→ Application rules được hiện thực hóa ra sao

Git
→ Toàn bộ hệ thống thay đổi thế nào theo thời gian

Agent Skills
→ Hỗ trợ tìm, đọc, review, challenge, refine và impact analysis
```

Tóm gọn:

```text
External Knowledge
        ↓
Project-owned Theory
        ↓
Business / Architecture / Technical Rules
        ↓
Source Code
        ↓
Project Reality
        ↓
Challenge
        ↓
Decision
        ↓
Theory Evolution
```

Đây là mô hình Theory Governance Lite dành cho một project, chạy hoàn toàn bằng Markdown, Git và Agent Skills.
