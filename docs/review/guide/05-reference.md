# Review — `docs/guide/reference/`

Ngày: 2026-07-12  
Context: [00-overview.md](00-overview.md)  
Phạm vi: ~110 file Markdown — review theo lớp: top-level → entity-maps → packs → variants

## 1. Vai trò

| Nguồn | Vai trò |
| --- | --- |
| README gốc | “Bảng tra cứu, reusable pack và link tới canonical docs.” |
| `reference/README.md` | Bảng tra ngắn; **không định nghĩa canonical rule mới.** |

Đây là folder **nặng nhất** của guide. Cần tách:

1. Reference cheat sheet (top-level)
2. Entity-maps reading (default + variants)
3. Packs source (universal + methodology)

## 2. Cấu trúc lớp

```text
reference/
├── README.md, canonical-map, folder-map, folder-structure,
│   layer-readme-template, relation-cheatsheet, status-and-notes
└── entity-maps/
    ├── overview.md, 00–10.md, README.md
    ├── variants/          ← reading overlay
    └── packs/             ← stable reusable source
        ├── universal/
        └── variants/{ddd, modular-monolith}/
```

## 3. Top-level cheat sheets

| File | Vai trò | Đánh giá |
| --- | --- | --- |
| `folder-structure.md` | Universal Layer→Concern | **Mạnh** — anti-pattern DDD/MM vào universal rõ; 07 có concern folder |
| `folder-map.md` | Route theo loại knowledge / câu hỏi | Tốt; giả định `docs/app/<layer>` |
| `canonical-map.md` | SoT map | Đã rút về layer/home; không shortcut concern architecture con |
| `relation-cheatsheet.md` | Gate validate edge | Tốt; pure meta |
| `layer-readme-template.md` | Template slim | Generic |
| `status-and-notes.md` | Delegate meta | Đúng ownership; cực ngắn |

## 4. Entity-maps (reading layer)

### 4.1 Overview & README

| Kiểm tra | Kết quả |
| --- | --- |
| Overview = pure/default, không nhúng variant column | Đạt |
| Câu hỏi layer = layer-model | Đạt |
| Cross-layer không liệt kê type methodology | Đạt |
| Sơ đồ cây `entity-maps/README.md` | `packs/` nest đúng dưới `entity-maps/` |

### 4.2 Default maps `00–10`

| Nhóm | Pattern | Đánh giá |
| --- | --- | --- |
| `00–05` | Concern lens + universal pack; type thuộc meta | Đúng thiết kế pure |
| `04–05` | Variants optional tách riêng | Đúng |
| `06, 08, 09` | Concern + generic taxonomy + Status | OK |
| `07` | **Không** taxonomy trong guide | Đạt Q3 |
| `10` | Concern / decision mechanism | OK |
| Status trên `00–05` | Đồng nhất với `06–10` | Đạt |

### 4.3 Variants reading views

| Variant | Layer | Placement |
| --- | --- | --- |
| DDD | `04-domain` | Đúng |
| Modular monolith | `05-architecture` | Đúng; không phủ `07` |

Dual `variants/` (view) vs `packs/variants/` (source): có note phân biệt trong `entity-maps/README.md` — giữ dual tree có chủ ý.

## 5. Packs

### 5.1 Universal

| Kiểm tra | Kết quả |
| --- | --- |
| Không pack taxonomy `07-implementation` | Đạt |
| Spot-check: không còn type `StateOwner` / `ModuleBoundary` / `InteractionFlow` trong universal | Đạt |
| Generic taxonomy ở `06`, `08`, `09` | Đúng catalog |
| Ví dụ folder universal `05` | Trung tính (`services/`, `agents/`, hoặc `modules/` nếu chọn modular) |

### 5.2 Methodology packs

| Pack | Đánh giá |
| --- | --- |
| Modular-monolith `05-architecture` | Đúng chỗ; ownership meta/app nêu rõ |
| DDD `04-domain` | Graph/triples domain OK; `constrains.md` chỉ Invariant→DomainEntity\|ValueObject |

## 6. Đối chiếu tiêu chí overview

| Tiêu chí | Verdict reference |
| --- | --- |
| Pure vs project | Không tên app; methodology leakage đã cleanup |
| Ownership | Rõ meta/app/packs |
| Navigation | Tốt |
| Portability | Cheat sheet giả định `docs/app` layout |
| Completeness | 07 boundary nhất quán nhiều file |
| Contradictions | Không còn contradiction remediation đang mở |

## 7. Finding còn mở

Không còn finding REF mở trong phạm vi remediation. REF-01…REF-07 đã remediate và gỡ khỏi bảng.

## 8. Điểm mạnh

1. `folder-structure.md` là backbone universal đáng tin.
2. Cleanup universal khỏi architecture variant types — thành công.
3. `07-implementation` boundary document nhất quán (map + packs README + overview).
4. Default maps 00–05 không còn dump meta type graph — khớp ownership entity-maps.

## 9. Verdict folder

**Đạt.** Không còn finding REF mở. Folder reference vẫn là backbone nặng nhất của guide.
