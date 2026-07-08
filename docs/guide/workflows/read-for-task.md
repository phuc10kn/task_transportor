# Read For Task

## Nguyên tắc

```text
read narrow first
expand only when needed
```

## Workflow

```text
1. Xác định task thuộc layer nào.
2. Đọc docs/app/README.md nếu chưa biết layer map.
3. Đọc layer README liên quan.
4. Mở concern/entity type/entity instance liên quan.
5. Follow theory_basis hoặc decision_basis nếu task cần reasoning.
6. Follow Related Entities nếu cần trace impact.
7. Mở docs/meta nếu cần validate structure/relation/convention.
```

## Output Sau Khi Đọc

Sau workflow đọc, phải kết luận được:

- canonical home của nội dung cần đọc hoặc sửa;
- layer/concern/entity type liên quan nếu task chạm `docs/app`;
- schema/unit structure cần dùng nếu task tạo hoặc sửa knowledge unit;
- relation hoặc valid triple cần kiểm tra nếu task có impact;
- workflow tiếp theo cần dùng: `write-docs`, `trace-impact`, `slim-layer-readme` hoặc `promote-candidate`.

Nếu chưa kết luận được các điểm trên, dừng ở `docs/guide/reference/canonical-map.md` và `docs/guide/reference/folder-structure.md` trước khi sửa file.

## Khi nào đọc guide

Đọc guide khi:

- chưa hiểu hệ docs;
- cần biết đặt nội dung ở đâu;
- cần trace relation;
- cần cleanup docs rời rạc;
- cần promote candidate.

Không cần đọc guide cho mọi task code nhỏ nếu bạn đã biết đường đi.

## Khi nào đọc theory

Đọc theory summary khi app docs có `theory_basis`.

Chỉ đọc full `theory.md` khi:

- có conflict;
- cần deep reasoning;
- cần sửa theory;
- cần tạo/challenge principle.
