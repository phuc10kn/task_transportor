# Review — `docs/guide/unit-structure/`

Ngày: 2026-07-12  
Context: [00-overview.md](00-overview.md)  
Phạm vi: 8 file Markdown (README + 7 unit template)

## 1. Vai trò

| Nguồn | Vai trò |
| --- | --- |
| README gốc | Template YAML/Markdown cho knowledge unit |
| `unit-structure/README.md` | Skeleton khi tạo/sửa unit; **canonical schema ở `docs/meta/00-schemas/`** |

## 2. Inventory

| Unit | Path | Mục đích |
| --- | --- | --- |
| Index | `README.md` | Bảng unit → home → schema |
| Entity instance | `entity/README.md` | Frontmatter + body sections |
| Entity type | `entity-type/README.md` | Type definition + `relations_template` |
| Entity relations | `entity-relations/README.md` | Cách ghi `relations:` + review shape |
| Relation type | `relation-type/README.md` | Skeleton relation type + `inverse kind` |
| Valid triple | `valid-triple/README.md` | Bảng triple |
| Theory | `theory/README.md` | Theory package skeleton |
| Decision | `decision/README.md` | Decision unit skeleton |

## 3. Đối chiếu tiêu chí overview

### 3.1 Pure vs project

- Không CIS / product name.
- Ví dụ path dài trong entity-type đã bọc “chỉ khi local registry…” .
- Theory template: `excludes: app-specific module map` — boundary đúng.

### 3.2 Ownership

| Kiểm tra | Kết quả |
| --- | --- |
| README khẳng định schema ở meta | Đạt |
| Meta schema link ngược unit template | Bổ trợ, không SoT kép đầy đủ |
| Rủi ro drift skeleton `relation-type` ↔ meta schema | Thấp–Trung nếu sửa một phía |

### 3.3 Điều hướng

- Được README gốc nhánh “sửa docs” link tới.
- `workflows/README` đã link ngược.
- Link schema `../../../meta/00-schemas/*.md` — pattern đúng từ unit-structure.

### 3.4 Portability

- Template không phụ thuộc npm.
- Giả định `docs/app/**` + `docs/meta/**` — framework convention.

### 3.5 Completeness

Skeleton đủ dùng. US-01…US-04 đã remediate và gỡ khỏi finding (open relation question; structure extends note; `inverse kind`; path example wrap).

### 3.6 Q1 / inverse kind

| File | Align |
| --- | --- |
| `relation-type/README.md` | Markdown `inverse kind`; YAML comment — khớp meta |
| `entity-relations/README.md` | “Không mirror inverse…” — khớp Q1 |

### 3.7 Chất lượng

Không mojibake lớn trong phạm vi đã đọc.

## 4. Finding còn mở

| ID | Severity | Chi tiết |
| --- | --- | --- |
| **US-05** | Thấp | Path rút gọn trong entity-relations đôi khi thiếu prefix `docs/meta/` — dễ nhầm khi copy |

## 5. Điểm mạnh

1. Ownership skeleton vs schema rõ ngay README.
2. Entity-type template chi tiết (`relations_template`, structure extends).
3. Theory/decision boundary (pure vs app-specific) rõ.
4. Relation-type skeleton đã có `inverse kind` — khớp contract sau Q1.

## 6. Verdict folder

**Đạt.** Finding mở còn US-05 (Thấp). Folder này là cầu nối write-docs ↔ meta; hứa hẹn khớp nội dung template.
