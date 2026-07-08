# Documentation Meta Model

> Canonical root của hệ documentation hiện tại là `docs/`.

## Mục đích

`docs/meta/` định nghĩa luật của documentation system.

Meta trả lời:

```text
Loại Entity nào được phép tồn tại?

Relation Type nào tồn tại?

Entity Type nào được nối với nhau?

Relation direction là gì?

Validation rule nào phải được tuân thủ?

Naming, ID, folder và metadata được viết thế nào?
```

Meta không chứa application knowledge cụ thể.

Meta không chứa Pure Theory.

---

# Documentation Governance

Các rule governance từ legacy business docs được hấp thụ ở mức meta như rule vận hành documentation, không còn là business source riêng.

Ownership theo layer:

- `docs/meta`: doc-system owner hoặc repo maintainer, vì đây là luật cấu trúc tài liệu.
- `docs/theories`: theory owner hoặc architecture/knowledge owner, vì đây là reasoning nền.
- `docs/app/00-context` đến `docs/app/04-domain`: product/business/domain owner phối hợp tech lead khi behavior đổi.
- `docs/app/05-architecture` đến `docs/app/07-implementation`: tech lead hoặc module owner.
- `docs/app/08-quality` và `docs/app/09-operation`: quality/ops owner phối hợp tech lead.
- `docs/app/10-decisions`: người chốt decision chịu trách nhiệm ghi rationale; reviewer kiểm tra impact cross-layer.

Khi nào bắt buộc cập nhật docs:

- actor, scope, workflow, rule chặn, lifecycle, integration role hoặc operational policy đổi;
- code/schema/API đổi làm docs technical/implementation/operation không còn đúng;
- một decision mới thay thế decision cũ;
- theory boundary, routing hoặc challenge đổi.

Review tối thiểu:

- Ưu tiên sửa file hiện có trước khi tạo file mới nếu vẫn cùng một chủ đề.
- Không đưa code/schema/API detail vào business layer.
- Không đưa app-specific detail vào pure theory.
- Mỗi thay đổi cross-layer phải kiểm tra `theory_basis`, `decision_basis` và relation/reference liên quan.
- Nếu chưa chắc tầng đúng, dùng `NOTE-OPEN` hoặc decision/challenge thay vì âm thầm nhét vào file gần nhất.

---

# Vai trò

```text
docs/meta/
→ định nghĩa luật

docs/theories/
→ cung cấp nguyên lý suy luận

docs/app/
→ chứa application knowledge
```

Mô hình:

```text
Meta
    ↓ defines

Documentation Structure
+
Entity Types
+
Relations
+
Validation
+
Conventions
```

---

# Cấu trúc

```text
docs/meta/
├── README.md
├── 00-schemas/
├── 01-entity-types/
├── 02-relation-types/
├── 03-rules/
└── 04-conventions/
```

Các folder được đánh số vì có dependency logic.

```text
Schemas
    ↓
Entity Types
    ↓
Relation Types
    ↓
Rules
    ↓
Conventions
```

Đây là thứ tự đọc hợp lý.

Không phải runtime pipeline.

---

# `00-schemas/`

## Mục đích

Định nghĩa contract Markdown cho entity instance, entity type definition, relation type definition, valid triple rule và cơ chế `structure extends`.

Đọc trước khi tạo file mới:

```text
docs/meta/00-schemas/
```

Schema không chứa app knowledge cụ thể. Schema chỉ nói file phải có field/section nào và extension được phép làm gì.

---

# `01-entity-types/`

## Mục đích

Định nghĩa loại documentation entity nào được phép tồn tại.

Hiện `01-entity-types/` là registry canonical cho layers `00-context` đến `04-domain`. Các type ở layers `05+` có thể còn nằm layer-local trong `docs/app` cho tới khi có decision promote/migrate riêng, nhưng vẫn phải tuân thủ schema tại `00-schemas/entity-type-definition.md`.

Ví dụ:

```text
Problem
Goal
Process
Feature
Screen
Module
Risk
Incident
```

Mỗi Entity Type có thể định nghĩa:

```text
name
meaning
layer
concern
instance criteria
required fields
optional fields
ID pattern
lifecycle
relations_template
validation expectations
```

Schema chi tiết nằm ở:

```text
docs/meta/00-schemas/entity-type-definition.md
docs/meta/00-schemas/structure-extends.md
```

Entity Type không chứa instance cụ thể của app.

Sai:

```text
MOD-001 Orders
```

Đúng:

```text
Module

Definition:
Một architecture unit có responsibility và boundary rõ.
```

---

## Entity Type phải đủ rõ

Một candidate chỉ nên trở thành Entity Type khi:

```text
có meaning ổn định

có nhiều instance tiềm năng

có schema chung

có identity riêng

có relation hoặc lifecycle riêng khi cần
```

Không tạo Entity Type chỉ vì:

```text
có một file

methodology có concept đó

folder structure mẫu có nó

framework dùng tên đó
```

---

# `02-relation-types/`

## Mục đích

Định nghĩa vocabulary cho relations.

Relation Type trả lời:

```text
Hai entity liên hệ với nhau theo meaning nào?
```

Ví dụ candidate:

```text
depends_on
derived_from
supersedes
```

Nhưng một relation chỉ canonical khi được định nghĩa tại đây.

Mỗi Relation Type nên có:

```text
name
meaning
canonical direction
inverse relation nếu có
allowed semantic
anti-patterns
examples
non-examples
```

Schema chi tiết nằm ở:

```text
docs/meta/00-schemas/relation-type-definition.md
```

---

## Direction

Direction phải ổn định.

Ví dụ:

```text
A
    --relation-->
B
```

khác với:

```text
B
    --inverse_relation-->
A
```

Hệ thống nên có một canonical direction.

Inverse relation có thể được derive.

---

## Không tạo relation tùy ý

Không được tự viết:

```text
realizes
supports
governs
implements
owns
contains
maps_to
```

và mặc định chúng là canonical.

Một từ chỉ trở thành Relation Type khi:

```text
meaning được định nghĩa

direction được định nghĩa

valid usage được định nghĩa
```

---

# `03-rules/`

## Mục đích

Định nghĩa những combination hợp lệ.

Mô hình:

```text
Source Entity Type
+
Relation Type
+
Target Entity Type
```

Ví dụ:

```text
<Type A>
    --<Relation>-->
<Type B>
```

Rules có thể định nghĩa:

```text
valid source type
valid target type
relation slot
cardinality
required relation
forbidden relation
cross-layer constraint
validation condition
```

Schema chi tiết nằm ở:

```text
docs/meta/00-schemas/valid-triple-rule.md
```

---

## Rules không phải Theory

Meta Rule:

```text
Feature được phép relation tới Screen
bằng một Relation Type đã định nghĩa.
```

Theory:

```text
UI structure nên giảm cognitive load.
```

Hai thứ khác nhau.

---

## Rules không phải App Rule

Meta Rule:

```text
Module may depend_on Module.
```

App Rule:

```text
MOD-001 không được phụ thuộc MOD-003.
```

Meta định nghĩa schema của knowledge.

App docs định nghĩa knowledge cụ thể.

---

# `04-conventions/`

## Mục đích

Định nghĩa cách documentation được viết và tổ chức.

Có thể chứa:

```text
ID conventions
folder naming
file naming
metadata format
status vocabulary
README structure
date format
reference format
note format
```

---

## Folder Naming

Khuyến nghị hiện tại:

```text
kebab-case
```

Ví dụ:

```text
entity-types
relation-types
cross-cutting
release-readiness
```

Không trộn:

```text
entity_types
entity-types
EntityTypes
```

---

## Numbering

Thêm số khi có:

```text
thứ tự đọc
dependency
pipeline logic
```

Ví dụ:

```text
01-entity-types/
02-relation-types/
03-rules/
04-conventions/
```

Không thêm số cho collection ngang hàng.

Ví dụ:

```text
theories/
├── modular-architecture/
├── knowledge-evolution/
└── ai-governance/
```

---

# Meta không chứa gì?

Không chứa:

```text
Business Problem cụ thể

Feature cụ thể

Screen cụ thể

Module cụ thể

Technology cụ thể

Theory content

Architecture Decision

Source code
```

Meta chỉ định nghĩa:

```text
cái gì được phép tồn tại

nó có meaning gì

nó được liên kết thế nào

nó phải tuân convention nào
```

---

# Quan hệ với App

`docs/app/` sử dụng Meta.

```text
Meta
    ↓ defines

Layer
Concern
Entity Type
Relation Type
Validation
Convention
```

App docs tạo:

```text
Entity Instances
+
Concrete Relations
+
Project-specific Knowledge
```

---

# Quan hệ với Theory

Theory không bị Meta kiểm soát về nội dung.

Meta chỉ có thể kiểm soát:

```text
Theory ID format
Theory reference format
Theory-related relation validity
folder/file conventions
```

Meta không quyết định:

```text
Theory nào đúng
Project nên tin gì
Theory reasoning là gì
```

---

# Concern và Entity Type

Meta phải giữ distinction:

```text
Concern
= question-space

Entity Type
= type of thing
```

Ví dụ:

```text
structure
= Concern

modules
= Entity Type
```

Không đăng ký Concern như Entity Type nếu nó không có:

```text
instances
schema
identity
lifecycle
relations
```

---

# Validation Model

Validation có thể chia thành:

```text
Structural Validation
Semantic Validation
Relation Validation
Reference Validation
Convention Validation
```

---

## Structural Validation

Kiểm tra:

```text
Layer
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```

Ví dụ:

```text
Entity Instance không được nằm trực tiếp dưới Layer.
```

---

## Semantic Validation

Kiểm tra:

```text
Entity có đúng meaning của Entity Type không?

Entity có đúng Concern không?

Entity có overlap với type khác không?
```

---

## Relation Validation

Kiểm tra:

```text
Relation Type tồn tại không?

Source Type hợp lệ không?

Target Type hợp lệ không?

Direction đúng không?
```

---

## Reference Validation

Kiểm tra:

```text
Referenced Entity ID tồn tại không?

Theory ID tồn tại không?

Decision ID tồn tại không?
```

---

## Convention Validation

Kiểm tra:

```text
ID format
folder naming
file naming
metadata format
status vocabulary
```

---

# Workflow tạo Entity Type mới

```text
New knowledge kind appears
        ↓
Stable meaning?
    ┌───┴───┐
   No      Yes
    │        │
    ▼        ▼
Supporting   Multiple instances?
Doc         ┌────┴────┐
            No        Yes
            │          │
            ▼          ▼
         Section    Common schema?
                    ┌────┴────┐
                   No        Yes
                   │          │
                   ▼          ▼
                Re-model   Define Entity Type
                                ↓
                         Add to Meta
                                ↓
                         Define Relations
                                ↓
                         Define Rules
                                ↓
                         Validate Usage
```

---

# Workflow tạo Relation Type mới

```text
Need to connect two entities
        ↓
Existing Relation Type fits?
    ┌───┴───┐
   Yes      No
    │        │
    ▼        ▼
  Reuse   Define semantic need
                ↓
         Stable meaning?
            ┌───┴───┐
           No      Yes
            │        │
            ▼        ▼
       Use prose   Define Relation Type
                         ↓
                  Define direction
                         ↓
                  Define valid triples
                         ↓
                  Add validation
```

---

# Source of Truth

Meta canonical source là:

```text
Markdown trong Git
```

Không để:

```text
validator code
Graph DB schema
application database
```

trở thành nguồn duy nhất của Meta.

Code validator phải được derive từ hoặc đồng bộ với Meta.

---

# Agent Reading Strategy

Agent đọc Meta khi:

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
Task
    ↓
docs/meta/README.md
    ↓
Relevant Entity Type
    ↓
Relevant Relation Type
    ↓
Relevant Rule
    ↓
Convention khi cần
```

Không cần đọc toàn bộ Meta cho mọi App task.

---

# Trạng thái chưa chắc chắn

Khi Meta chưa chốt:

```text
không tự bịa schema

không tự bịa relation

không tự bịa ID prefix

không tự bịa cardinality
```

Dùng:

```text
NOTE-OPEN
NOTE-CANDIDATE
NOTE-CONFLICT
NOTE-DECISION
```

Candidate không được coi là canonical.

---

# Nguyên tắc cuối cùng

```text
01-entity-types
→ cái gì được phép tồn tại

02-relation-types
→ chúng có thể liên hệ bằng meaning nào

03-rules
→ combination nào hợp lệ

04-conventions
→ mọi thứ được viết và tổ chức thế nào
```

Tổng thể:

```text
Meta
= luật chơi

Theory
= nguyên lý suy luận

App
= knowledge cụ thể

Markdown
= canonical source

Git
= revision history
```
