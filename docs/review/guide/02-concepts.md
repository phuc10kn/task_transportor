# Review — `docs/guide/concepts/`

Ngày: 2026-07-12  
Context: [00-overview.md](00-overview.md)  
Phạm vi: 7 file Markdown trong `concepts/`

## 1. Vai trò

| Nguồn | Vai trò |
| --- | --- |
| README gốc | “Mô hình nền: layer, entity, relation, theory, decision.” |
| `concepts/README.md` | Giải thích mô hình chung; danh sách khái niệm mơ hồ cần đọc file tương ứng. |

## 2. Inventory

| File | Nội dung cốt |
| --- | --- |
| `README.md` | Index 6 concept file |
| `documentation-architecture.md` | Meta → Theories → App → Reality; bảng ranh giới folder |
| `layer-model.md` | 11 layer + câu hỏi; không phải pipeline; path instance; slim README |
| `entity-model.md` | Layer→Concern→Type→Instance; khi nào không tạo entity |
| `relation-model.md` | Relation type / triple / slot / instance; **1 fact = 1 direction**; reverse derived |
| `theory-and-decision-model.md` | Theory vs app application vs decision |
| `validation-and-lifecycle.md` | 5 nhóm validation; lifecycle thuộc meta local |

## 3. Đối chiếu tiêu chí overview

### 3.1 Pure vs project

| Quan sát | Kết quả |
| --- | --- |
| Không CIS / Backlog / Jira / `task_transportor` | Sạch |
| `layer-model` câu hỏi khớp overview pure (không “Module, boundary, flow?”) | Sạch sau cleanup |
| Ví dụ architecture dùng `<entity-type-folder>` generic, không `Module` | Tốt |
| `theory-and-decision` ví dụ “External write cần guardrail” → app concrete | Generic đúng mức |

### 3.2 Ownership

- Schema/convention trỏ `docs/meta/` — đúng.
- `validation-and-lifecycle`: status vocabulary ở meta; **guide không định nghĩa temporary-record lifecycle** — khớp DEC-001 và overview.
- `relation-model` là doctrine chung; không nhúng triple meta cụ thể (đúng sau khi overview bỏ cross-layer type list).

### 3.3 Điều hướng

Index folder đầy đủ; handoff concepts sâu từ README gốc / `documentation-architecture` đã có (CO-01 đã remediate, gỡ khỏi finding).

### 3.4 Portability

- Path `docs/app/<layer>/<concern>/...` là convention framework.
- Không npm script.
- Portable cao trong họ project dùng cùng documentation system.

### 3.5 Completeness vs hứa README

| Khái niệm README liệt kê | Có file? |
| --- | --- |
| Layer, Concern | `layer-model`, `entity-model` |
| Entity Type / Instance | `entity-model` |
| Relation Type / Valid Triple | `relation-model` |
| Theory / Decision | `theory-and-decision-model` |
| Validation / Lifecycle | `validation-and-lifecycle` |

**Đủ.** Không thiếu concept được hứa.

### 3.6 Alignment doctrine Q1 / DEC-002

`relation-model.md` đã có:

- 1 fact = 1 canonical direction;
- không mirror hai README;
- heuristic container→member, cause→impact, rule→governed, flow→participant;
- reverse = search / derived / tooling;
- `implements` exception product/UI.

**Khớp** hướng đã chốt ở `docs/review/review.md` (Business/Domain Direction). Concepts là nơi doctrine sống đúng chỗ; workflows còn thiếu pointer về đây (xem review workflows).

### 3.7 Chất lượng

- Văn bản rõ, tiếng Việt có dấu ổn (trong phạm vi đã đọc).
- `documentation-architecture` cleanup hướng layer README nhẹ — khớp slim workflow.
- Không phát hiện broken link nội bộ tới unit-structure/meta trong các file đã đối chiếu.

## 4. Finding còn mở

Không còn finding mở. CO-01 đã remediate và gỡ khỏi bảng.

### CO-02 (Ghi nhận) — `entity-model` ví dụ architecture path

```text
05-architecture → 01-structure → <entity-type-folder> → <ENTITY-ID>
```

Trung tính; OK. Không nâng severity.

### CO-03 (Ghi nhận tích cực) — Không nhúng Q1 type names

Concepts không liệt kê `motivates`/`part_of` dual — tránh drift với meta sau khi chốt Q1.

## 5. Điểm mạnh

1. **Lõi trí tuệ** của guide: tách model khỏi app truth.
2. `relation-model` là nguồn doctrine canonical-direction đáng tin.
3. Ranh giới theory/decision/app rõ, có bảng “khi nào dùng cái nào”.
4. Validation 5 nhóm + trace checklist ngắn — đủ để handoff workflow.

## 6. Verdict folder

**Rất tốt / nền tảng.** Không còn finding mở. Đây là folder **sạch pure** nhất trong 6 folder cấp 1 — dùng làm chuẩn đối chiếu khi review `reference/` và `examples/`.
