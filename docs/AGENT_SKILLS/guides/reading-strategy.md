# Reading Strategy

Agent không đọc toàn bộ `docs/`. Mở rộng context theo nhu cầu.

## Level 0 - Operating Flow

Luôn bắt đầu bằng [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn).

Nếu task cụ thể, đọc thêm workflow liên quan:

- `docs/guide/workflows/read-for-task.md`;
- `docs/guide/workflows/sync-product-change.md` khi task từ code/incident/product behavior;
- `docs/guide/workflows/write-docs.md`;
- `docs/guide/workflows/trace-impact.md`;
- `docs/guide/workflows/validate-after-change.md`;
- `docs/guide/workflows/slim-layer-readme.md`;

## Level 1 - Task Docs

Đọc đúng layer/concern/entity liên quan.

```text
task
-> docs/app/README.md
-> relevant layer README
-> relevant concern/entity type
-> relevant entity instance
```

Không đọc layer không liên quan task.

## Level 2 - Meta

Đọc meta khi:

- tạo hoặc sửa unit;
- validate path;
- validate relation;
- validate ID;
- resolve placement ambiguity.

```text
docs/meta/README.md
-> docs/meta/00-schemas/
-> docs/meta/01-entity-types/
-> docs/meta/02-relation-types/
-> docs/meta/03-rules/
-> docs/meta/04-conventions/
```

## Level 3 - Theory Summary

Khi app docs reference `theory_basis`, đọc:

```text
docs/theories/<slug>/README.md
docs/theories/<slug>/agent.md
```

Không mở full `theory.md` nếu summary đủ.

## Level 4 - Full Theory And Governance

Chỉ đọc `theory.md` hoặc `governance.md` khi:

- có conflict;
- cần deep reasoning;
- cần sửa/refine theory;
- cần tạo challenge;
- cần trace impact khi theory đổi.

## Guide Packs

Chỉ đọc `docs/guide/reference/entity-maps/packs/` khi cần reusable taxonomy/template. Không coi pack là app truth nếu `docs/app/` hoặc `docs/meta/` đã có canonical home.

## Workbench

Khi project đã kích hoạt Workbench và canonical home chưa rõ, đọc `docs/workbench/README.md` + policy local, rồi dùng [use-workbench.md](../../guide/workflows/use-workbench.md) / `workbench-intake`. Không dùng Workbench như canonical truth.
