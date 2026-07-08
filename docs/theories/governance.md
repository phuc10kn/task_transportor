# Theory System Governance

## Mục đích

File này quản trị ở mức `theory system`, không phải chỉ một theory group riêng lẻ.

Nó trả lời:

```text
Theory Group boundary được xác định như thế nào?

Khi nào tạo Theory Group mới?

Khi nào không tạo Group mới?

Khi nào phải split Theory Group?

Làm sao kiểm soát overlap giữa các Theory Groups?
```

File này không thay thế `governance.md` của từng theory group.

Phân vai:

```text
docs/theories/README.md
→ root index + routing

docs/theories/governance.md
→ governance chung của theory system

docs/theories/<theory>/governance.md
→ governance riêng của một theory group
```

---

## Theory Group Boundary

Theory Group boundary phải là:

```text
problem-space boundary
```

không phải:

```text
folder boundary
layer boundary
team boundary
code module boundary
```

Mỗi Theory Group nên sở hữu:

```text
1 câu hỏi lõi
+ 1 problem space ổn định
+ 1 cụm reasoning có thể tái dùng
```

Ví dụ:

```text
Modular Architecture
→ module, boundary, ownership

Hub-mediated Integration
→ tại sao flow phải đi qua core hub

Canonical State Governance
→ canonical truth là gì, owner là ai
```

Nếu một group bắt đầu trả lời nhiều câu hỏi lõi khác bản chất,
đó là dấu hiệu boundary đang sai.

---

## Theory Boundary Matrix

Khi tạo Theory Group mới hoặc review Theory Group hiện có,
phải điền tối thiểu 4 trường:

```text
Owns
Excludes
Depends on
Typical impact areas
```

Ý nghĩa:

```text
Owns
→ reasoning space mà Theory Group này thật sự sở hữu

Excludes
→ những thứ dễ bị nhét nhầm vào group nhưng thực ra không thuộc nó

Depends on
→ Theory Group khác mà group này cần dựa vào

Typical impact areas
→ layer hoặc app areas thường bị ảnh hưởng nếu theory này đổi
```

Matrix này không thay thế full Theory.

Nó là công cụ governance để:

```text
kiểm soát scope
phát hiện overlap
phát hiện split timing
giảm việc tạo theory trùng nhau
```

### Theory Boundary Matrix v1

Matrix v1 cho wave `fill theory cho toàn bộ app`:

| Theory | Owns | Excludes | Depends on | Typical impact areas |
| --- | --- | --- | --- | --- |
| `TH-MODULAR` | Module boundary, ownership, public surface, import/cross-module discipline | `System -> CIS -> System`, canonical truth model, dry-run gate, job/journal policy | none | `05-architecture`, `07-implementation`, một phần `06-technical` |
| `TH-HUBFLOW` | Hub-mediated integration model, inbound-to-core-first, no direct system-to-system bypass | Module internals, canonical branch structure, retry mechanics | none | `00-context`, `01-business`, `02-product`, `05-architecture` |
| `TH-CANON` | Canonical truth, source snapshot vs canonical branch, owner of operational truth | Module boundary generic, hub topology generic, outbound sync gate detail | `TH-HUBFLOW` | `00-context`, `04-domain`, `05-architecture`, `06-technical`, `10-decisions` |
| `TH-AI-GOV` | AI draft/propose/analyze role, human final authority, transport-vs-business boundary | Model/provider detail, prompt payload format, sync gate itself | `TH-CANON` | `01-business`, `02-product`, `05-architecture`, `06-technical`, `09-operation` |
| `TH-SYNC-SAFE` | Dry-run, readiness, external write guardrail, stale preview semantics | Retry policy detail, journal schema, canonical ownership generic | `TH-CANON`, `TH-HUBFLOW` | `01-business`, `02-product`, `05-architecture`, `08-quality`, `09-operation` |
| `TH-OPS-TRACE` | Traceability, recoverability, retry as operation, audit/journal reasoning | Dry-run gate logic, module boundary logic, canonical branch semantics | `TH-HUBFLOW`, một phần `TH-CANON` | `01-business`, `06-technical`, `08-quality`, `09-operation` |

---

## Khi tạo Theory Group mới

Chỉ tạo Theory Group mới khi có đủ:

```text
stable problem space
+ project-owned position
+ reusable reasoning foundation
```

Và khi:

```text
nó không fit sạch vào Theory Group đã có
```

Luồng kiểm tra chuẩn:

```text
Candidate idea
    ↓
Viết 1 câu hỏi lõi
    ↓
Điền Theory Boundary Matrix
    ↓
So với Theory Groups hiện có
    ↓
Nếu Owns chồng mạnh
    → không tạo group mới
    → thêm position/challenge/decision vào group cũ

Nếu problem space thực sự riêng
    → tạo Theory Group mới
```

Không tạo Theory Group mới chỉ vì:

```text
có một file mới
có một workflow mới
có một endpoint mới
có một schema mới
có một module mới
có một checklist mới
```

Những thứ đó thường thuộc:

```text
App Docs
Decisions
Implementation Rules
Reference / Template
```

---

## Khi split Theory Group

Split Theory Group khi thấy một hoặc nhiều dấu hiệu sau:

```text
1. Group trả lời hơn 1 câu hỏi lõi khác bản chất.

2. Owns và Excludes chồng mạnh với group khác.

3. Typical impact areas tách thành 2 cụm gần như độc lập.

4. Governance challenge tách thành 2 nhánh tranh luận khác nhau.

5. Phải liên tục nói:
"phần này thực ra không hẳn thuộc theory này".
```

Khi đó:

```text
đừng mở rộng group cũ vô hạn
→ tách problem space
→ tạo group mới hoặc chuyển một phần reasoning sang group phù hợp hơn
```

Split không có nghĩa Theory cũ sai.

Nó thường chỉ có nghĩa:

```text
scope ban đầu đã quá rộng
hoặc project đã tiến hóa đủ để cần boundary rõ hơn
```

---

## Khi không tạo Group mới

Không tạo Theory Group mới nếu candidate chỉ là:

```text
một position mới của Theory Group cũ
một challenge mới của Theory Group cũ
một decision mới của Theory Group cũ
một app-specific rule
một implementation rule
```

Lúc đó nên:

```text
thêm stable position
hoặc thêm challenge
hoặc thêm decision
vào Theory Group hiện có
```

---

## Relation với Meta

Rule tạo/split Theory Group không thuộc `docs/meta/`.

Meta chỉ nên định nghĩa:

```text
ID format
reference format
folder/file convention
validation rule liên quan đến theory reference
```

Meta không quyết định:

```text
project nên có bao nhiêu Theory Groups
Theory Group nào đủ lớn để split
Theory nào sở hữu reasoning nào
```

Những thứ đó thuộc:

```text
Theory system governance
```

và canonical chỗ giữ là file này.

---

## Provenance Policy

Theory system hiện tại đã được materialize vào root theory governance, 6 theory folders, `docs/app/10-decisions` và `docs/app_variants/custom_modular_monolith`.

Kết luận hiện hành:

- 6 theory core đã được materialize và là active theory set hiện tại.
- Tài liệu import hoặc ghi chú trung gian không còn là execution source.
- Reasoning hiện hành nằm trong root governance này, 6 theory folder, `docs/app/10-decisions` và `docs/app_variants/custom_modular_monolith`.
- Theory governance chỉ giữ reasoning reusable; app-specific code path, schema, route, runtime và template chi tiết phải ở `docs/app/*`, `docs/app_variants/*` hoặc `docs/meta/*`.

Nếu sau này phát hiện một reasoning quan trọng chỉ tồn tại trong Git history hoặc ghi chú trung gian, không copy thẳng vào theory. Phải phân loại trước:

```text
Pure Theory
App Decision
Meta Governance
App-specific Documentation
Historical Provenance
Scratch Analysis
```

Sau đó mới nhập vào đúng home.
