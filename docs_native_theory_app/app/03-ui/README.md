# 03 — UI

## Mục đích

`03-ui/` mô tả cách người dùng nhìn thấy, hiểu và tương tác với Product.

Layer này trả lời:

- Người dùng nào tương tác với UI?
- Trải nghiệm tổng thể diễn ra thế nào?
- Người dùng đi qua những bước nào?
- Screen và navigation được tổ chức ra sao?
- UI được cấu thành từ những phần nào?
- Interaction và state được thể hiện thế nào?
- Accessibility và design consistency được quản lý ra sao?

UI không mô tả chi tiết:

```text
business reality
product requirement
domain model
architecture
technical mechanism
source code
```

UI chuyển từ:

```text
Product Behavior
```

sang:

```text
User Experience
+
Interaction Model
+
Visual Structure
```

---

# Cấu trúc

`03-ui/` dùng mô hình:

```text
Layer
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```

Cấu trúc:

```text
03-ui/
├── README.md
├── audience/
├── experience/
├── structure/
├── composition/
├── interaction/
├── quality/
└── system/
```

Trong đó:

```text
audience
experience
structure
composition
interaction
quality
system
```

là các Concern.

Ví dụ:

```text
03-ui/
└── structure/
    └── screens/
        └── SCR-001-reconciliation-dashboard/
            └── README.md
```

Trong đó:

```text
03-ui
= Layer

structure
= Concern

screens
= Entity Type

SCR-001-reconciliation-dashboard
= Entity Instance
```

---

# 1. Audience

## Mục đích

`audience/` quản lý những kiểu người dùng có ý nghĩa đối với UI.

Concern này trả lời:

- Ai sử dụng giao diện?
- Họ có mục tiêu gì?
- Họ có mức độ kinh nghiệm nào?
- Họ sử dụng thiết bị hoặc context nào?
- Họ có nhu cầu accessibility nào?
- UI phải thích nghi với khác biệt nào?

Entity Type phổ biến:

```text
personas/
user-groups/
accessibility-profiles/
```

Ví dụ:

```text
audience/
└── personas/
    └── PER-001-finance-manager/
        └── README.md
```

Một Persona có thể mô tả:

```text
name
role
goals
needs
pain points
experience level
usage context
devices
accessibility needs
related business roles
```

Persona không phải Stakeholder.

Phân biệt:

```text
Stakeholder
→ một bên có lợi ích hoặc ảnh hưởng trong Business

Persona
→ một kiểu người dùng được mô hình hóa để thiết kế UI
```

Một Stakeholder có thể tương ứng với nhiều Persona.

Một Persona cũng có thể đại diện cho nhiều Business Role gần nhau.

---

# 2. Experience

## Mục đích

`experience/` quản lý trải nghiệm end-to-end của người dùng.

Concern này trả lời:

- Người dùng muốn đạt mục tiêu gì?
- Họ đi qua những bước lớn nào?
- Có điểm chạm nào?
- Có friction nào?
- UI hỗ trợ hành trình đó ra sao?

Entity Type phổ biến:

```text
journeys/
user-flows/
```

Ví dụ:

```text
experience/
├── journeys/
│   └── JNY-001-review-financial-health/
│       └── README.md
│
└── user-flows/
    └── FLOW-001-review-reconciliation/
        └── README.md
```

---

## Journey

Journey mô tả trải nghiệm end-to-end ở mức rộng.

Một Journey có thể bao gồm:

```text
goal
stages
touchpoints
user expectations
pain points
emotions
channels
outcomes
```

Journey có thể vượt qua nhiều:

```text
screen
feature
channel
session
```

Ví dụ:

```text
JNY-001 — Review Financial Health
```

có thể bao gồm:

```text
Receive Alert
    ↓
Open Dashboard
    ↓
Inspect Discrepancy
    ↓
Review Details
    ↓
Take Action
```

---

## User Flow

User Flow mô tả đường đi cụ thể qua UI để đạt một mục tiêu.

Một User Flow có thể mô tả:

```text
entry point
steps
decisions
branches
screens
exit states
error paths
```

Ví dụ:

```text
FLOW-001 — Review Reconciliation Result
```

Phân biệt:

```text
Journey
= trải nghiệm end-to-end rộng

User Flow
= đường đi cụ thể trong UI
```

---

# 3. Structure

## Mục đích

`structure/` quản lý cách UI được tổ chức và điều hướng.

Concern này trả lời:

- Có những Screen nào?
- Người dùng đi từ đâu đến đâu?
- Navigation hierarchy là gì?
- Screen nào là entry point?
- Screen nào thuộc cùng một khu vực?

Entity Type phổ biến:

```text
screens/
navigation-models/
navigation-items/
routes/
```

Ví dụ:

```text
structure/
├── screens/
│   └── SCR-001-reconciliation-dashboard/
│       └── README.md
│
└── navigation-models/
    └── NAV-001-main-navigation/
        └── README.md
```

---

## Screen

Screen là một đơn vị giao diện có mục đích rõ ràng.

Một Screen có thể mô tả:

```text
purpose
primary users
supported use cases
supported features
entry conditions
main content
available actions
states
navigation relations
```

Ví dụ:

```text
SCR-001 — Reconciliation Dashboard
```

Screen không nên mô tả chi tiết source component tree.

---

## Navigation Model

Navigation Model mô tả cách người dùng di chuyển giữa các vùng UI.

Có thể bao gồm:

```text
global navigation
local navigation
hierarchy
entry points
exit points
back behavior
deep linking
```

Navigation không đồng nghĩa với routing kỹ thuật.

Phân biệt:

```text
UI Navigation
→ người dùng di chuyển thế nào

Technical Routing
→ framework xử lý route thế nào
```

---

# 4. Composition

## Mục đích

`composition/` quản lý cách UI được cấu thành từ các phần nhỏ hơn.

Concern này trả lời:

- Screen được tạo từ những phần nào?
- Component nào có thể tái sử dụng?
- Form nào tồn tại?
- Composition boundary ở đâu?
- Phần nào là UI primitive, phần nào là product-specific?

Entity Type phổ biến:

```text
components/
forms/
layouts/
patterns/
```

Ví dụ:

```text
composition/
├── components/
│   └── CMP-001-discrepancy-summary/
│       └── README.md
│
└── forms/
    └── FORM-001-adjustment-request/
        └── README.md
```

---

## Component

Component là một đơn vị UI có trách nhiệm rõ ràng.

Một Component có thể mô tả:

```text
purpose
inputs
outputs
states
variants
usage rules
parent screens
accessibility requirements
```

Không document mọi code component.

Chỉ tạo UI Entity khi component có knowledge value.

Ví dụ nên document:

```text
Complex Data Grid
Approval Panel
Financial Summary Card
Workflow Stepper
```

Không nhất thiết document:

```text
Button
Spacer
Divider
```

nếu chúng chỉ là primitive thông thường.

---

## Form

Form là một cấu trúc interaction dùng để thu thập hoặc thay đổi dữ liệu.

Một Form có thể mô tả:

```text
purpose
fields
field groups
validation expectations
submission behavior
error behavior
success behavior
related use cases
```

Form không chứa validation implementation detail.

---

# 5. Interaction

## Mục đích

`interaction/` quản lý cách UI phản ứng với hành động và trạng thái.

Concern này trả lời:

- Người dùng có thể làm gì?
- UI phản hồi thế nào?
- Loading, empty, error và success được thể hiện ra sao?
- State transition nào người dùng có thể quan sát?
- Feedback được cung cấp thế nào?

Entity Type phổ biến:

```text
interactions/
ui-states/
feedback-patterns/
transitions/
```

Ví dụ:

```text
interaction/
├── interactions/
│   └── INT-001-approve-adjustment/
│       └── README.md
│
└── ui-states/
    └── UIST-001-reconciliation-loading/
        └── README.md
```

---

## Interaction

Interaction mô tả một hành vi giữa người dùng và UI.

Một Interaction có thể mô tả:

```text
trigger
precondition
user action
system response
feedback
state change
failure behavior
related screens
```

Ví dụ:

```text
INT-001 — Approve Adjustment
```

Interaction không phải Use Case.

Phân biệt:

```text
Use Case
→ actor đạt mục tiêu gì với Product

Interaction
→ UI phản ứng thế nào với một hành động cụ thể
```

---

## UI State

UI State mô tả trạng thái có ý nghĩa mà người dùng nhìn thấy.

Ví dụ:

```text
loading
empty
partial
success
error
disabled
read-only
pending
```

Một UI State có thể mô tả:

```text
trigger
visual meaning
available actions
exit conditions
related screen
related interaction
```

Không nên chỉ document happy path.

Các state quan trọng thường gồm:

```text
loading
empty
error
partial data
permission denied
offline
```

---

# 6. Quality

## Mục đích

`quality/` quản lý các yêu cầu chất lượng riêng của UI.

Concern này trả lời:

- UI có sử dụng được không?
- Accessibility requirement nào tồn tại?
- Responsive behavior ra sao?
- Visual consistency được kiểm soát thế nào?
- Interaction có đủ rõ ràng không?

Entity Type phổ biến:

```text
accessibility-requirements/
usability-rules/
responsive-rules/
ui-quality-criteria/
```

Ví dụ:

```text
quality/
└── accessibility-requirements/
    └── A11Y-001-keyboard-navigation/
        └── README.md
```

Một Accessibility Requirement có thể mô tả:

```text
statement
scope
affected users
affected screens
expected behavior
validation method
standard reference
```

Ví dụ:

```text
All primary actions must be accessible
without requiring a pointing device.
```

UI Quality không thay thế `08-quality/`.

Phân biệt:

```text
03-ui / quality
→ quality requirement thuộc riêng UI experience

08-quality
→ verification, validation và assurance toàn hệ thống
```

---

# 7. System

## Mục đích

`system/` quản lý những nền tảng dùng để giữ consistency cho toàn bộ UI.

Concern này trả lời:

- UI dùng design language nào?
- Token nào tồn tại?
- Pattern nào là canonical?
- Component nào là shared primitive?
- Rule nào giữ consistency giữa các screen?

Entity Type phổ biến:

```text
design-systems/
design-tokens/
ui-patterns/
component-libraries/
```

Ví dụ:

```text
system/
└── design-systems/
    └── DS-001-main-product-design-system/
        └── README.md
```

Một Design System có thể mô tả:

```text
principles
tokens
component categories
usage rules
composition rules
accessibility baseline
governance
```

Design System không phải frontend framework.

Phân biệt:

```text
Design System
→ UI language và consistency rules

Frontend Framework
→ technical mechanism
```

---

# Quan hệ giữa các Concern

Các Concern không tạo thành pipeline cứng.

Quan hệ điển hình:

```text
Persona
    ↓ experiences
Journey
```

```text
Journey
    ↓ contains
User Flow
```

```text
User Flow
    ↓ traverses
Screen
```

```text
Screen
    ↓ composed_of
Component
```

```text
Interaction
    ↓ changes
UI State
```

```text
Design System
    ↓ constrains
Component
```

```text
Accessibility Requirement
    ↓ constrains
Screen / Component / Interaction
```

Mô hình khái quát:

```text
Audience
    ↓
Experience

Experience
    ↓
Structure

Structure
    ↓
Composition

Interaction
    ↔
Structure + Composition

Quality
    ↓
All UI Concerns

System
    ↓
Structure + Composition + Interaction
```

Đây là relation knowledge.

Không phải thứ tự triển khai bắt buộc.

---

# Quan hệ với Context

UI nhận context từ:

```text
language
environment
scope
assumptions
constraints
```

Ví dụ:

```text
Glossary Term
    --clarifies-->
UI Label
```

```text
Environment Context
    --constrains-->
Responsive Behavior
```

```text
Scope
    --limits-->
UI Coverage
```

UI không copy lại Context.

---

# Quan hệ với Business

Business cung cấp:

```text
stakeholder
business role
process
scenario
goal
```

UI chuyển các input đó thành experience.

Ví dụ:

```text
Business Role
    --represented_by-->
Persona
```

```text
Business Process
    --supported_by-->
User Flow
```

```text
Business Scenario
    --experienced_as-->
Journey
```

Business không định nghĩa Screen.

---

# Quan hệ với Product

Product định nghĩa:

```text
what the product provides
```

UI định nghĩa:

```text
how the user experiences it
```

Quan hệ điển hình:

```text
Use Case
    --represented_by-->
User Flow
```

```text
Feature
    --represented_by-->
Screen
```

```text
Functional Requirement
    --realized_in-->
Interaction
```

```text
Acceptance Criterion
    --applies_to-->
UI State
```

Một Feature có thể có nhiều Screen.

Một Screen cũng có thể hỗ trợ nhiều Feature.

---

# Quan hệ với Domain

UI hiển thị và thao tác trên Domain meaning.

Ví dụ:

```text
Screen
    --presents-->
Domain Concept
```

```text
Form
    --captures-->
Domain Value
```

```text
UI State
    --reflects-->
Domain State
```

UI không nên tự định nghĩa Domain Rule.

---

# Quan hệ với Architecture

UI có thể tạo input cho Architecture.

Ví dụ:

```text
User Flow
    --requires-->
Architecture Interaction
```

```text
Screen
    --depends_on-->
Architecture Capability
```

```text
Offline Requirement
    --constrains-->
Architecture
```

Architecture không định nghĩa visual design.

---

# Quan hệ với Technical

Technical layer quyết định mechanism.

Ví dụ:

```text
UI Interaction
    --supported_by-->
Technical Interface
```

```text
UI State
    --sourced_from-->
Technical State Mechanism
```

```text
Design System
    --implemented_with-->
UI Technology
```

UI không nên ghi:

```text
React hook
Vue store
CSS framework
API endpoint
```

trừ khi đó là context cần thiết để giải thích design constraint.

---

# Quan hệ với Implementation

UI Entity có thể trace tới implementation.

Ví dụ:

```text
Screen
    --implemented_by-->
Frontend Module
```

```text
Component
    --implemented_by-->
Code Component
```

```text
Interaction
    --implemented_by-->
Handler
```

Không document mọi source component.

Chỉ giữ trace cho những phần có knowledge value.

---

# Quan hệ với Quality

UI cung cấp input cho verification và validation.

Ví dụ:

```text
Accessibility Requirement
    --verified_by-->
Accessibility Check
```

```text
Journey
    --validated_by-->
User Validation
```

```text
Interaction
    --verified_by-->
Interaction Test
```

Phân biệt:

```text
UI Quality Concern
→ yêu cầu chất lượng của UI

Quality Layer
→ cách kiểm tra và đảm bảo yêu cầu đó
```

---

# Quan hệ với Operation

Operation có thể cung cấp feedback ngược cho UI.

Ví dụ:

```text
Observed User Failure
    ↓
UI Defect
```

```text
Interaction Metric
    ↓
Journey Improvement
```

```text
Incident
    ↓
Error State Improvement
```

UI không chứa runtime monitoring detail.

---

# Quan hệ với Decisions

UI conflict có thể tạo Decision.

Ví dụ:

```text
Navigation Alternative
    --evaluated_by-->
Decision
```

```text
Accessibility Trade-off
    --motivates-->
Decision
```

```text
Design System Change
    --decided_by-->
Decision
```

Decision nên reference UI Entity liên quan.

---

# Quan hệ với Theory

UI Entity có thể reference Theory khi một principle thực sự ảnh hưởng đến:

```text
interaction design
information architecture
accessibility
design system
progressive disclosure
error handling
```

Ví dụ:

```yaml
theory_basis:
  - TH-UI-03
```

Không reference Theory mặc định cho mọi UI Entity.

---

# Nguyên tắc

## UI mô tả experience, không mô tả Product Requirement

Sai:

```text
Product must support reconciliation.
```

Đúng:

```text
The manager can inspect reconciliation results
through a dedicated review screen.
```

---

## Persona không phải Stakeholder

```text
Stakeholder
= business participant

Persona
= UI design representation of a user type
```

---

## Journey không phải User Flow

```text
Journey
= end-to-end experience

User Flow
= specific navigation path
```

---

## User Flow không phải Use Case

```text
Use Case
= actor goal at Product level

User Flow
= path through UI
```

---

## Screen không phải Feature

```text
Feature
= unit of product value

Screen
= unit of UI presentation and interaction
```

Một Screen có thể hỗ trợ nhiều Feature.

---

## Component không đồng nghĩa với Code Component

Chỉ document UI Component khi nó có:

```text
design meaning
shared behavior
important states
usage rules
cross-screen impact
```

---

## Interaction phải mô tả feedback

Một Interaction quan trọng phải trả lời:

```text
Người dùng làm gì?
UI phản hồi thế nào?
State thay đổi ra sao?
Nếu thất bại thì sao?
```

---

## Không chỉ document Happy Path

UI quan trọng phải xem xét:

```text
loading
empty
partial
error
permission denied
disabled
offline
```

khi phù hợp.

---

## Accessibility là requirement, không phải polish

Accessibility phải được xem như constraint thiết kế.

Không để tới cuối mới bổ sung.

---

## Design System không phải Component Dump

Design System phải giữ:

```text
principles
patterns
rules
consistency
governance
```

Không chỉ liệt kê component.

---

## Relation phải dùng canonical vocabulary

Không tự đặt relation tùy ý trong README.

Relation Type và valid combinations phải được định nghĩa trong:

```text
docs/meta/
```

---

# Tóm tắt

```text
03-ui/
├── audience/
│   → ai sử dụng UI
│
├── experience/
│   → người dùng trải nghiệm hành trình nào
│
├── structure/
│   → screen và navigation được tổ chức ra sao
│
├── composition/
│   → UI được cấu thành từ những phần nào
│
├── interaction/
│   → UI phản ứng với hành động và state thế nào
│
├── quality/
│   → UI phải đáp ứng yêu cầu chất lượng nào
│
└── system/
    → consistency toàn UI được quản lý thế nào
```

Mô hình:

```text
03-ui
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```