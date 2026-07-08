# Mandatory Rules

Các rule bắt buộc khi agent đọc hoặc sửa documentation.

## Rule 1 - Guide Owns Operating Flow

Trước khi sửa docs, đọc:

```text
docs/guide/README.md#luồng-vận-hành-chuẩn
```

`docs/AGENT_SKILLS` không thay `docs/guide`.

## Rule 2 - Meta Owns Schema And Rules

Không tự tạo:

- schema name;
- metadata field;
- entity type;
- relation slot;
- relation type;
- valid triple;
- ID prefix;
- cardinality.

Nếu thiếu rule/schema, dừng và báo `NOTE-OPEN` hoặc explicit request để sửa `docs/meta`.

## Rule 3 - App Owns App Truth

App-specific behavior, scope, rule, architecture, quality và operation của CIS nằm trong `docs/app`.

Không đưa app truth vào `docs/guide`, `docs/meta`, `docs/theories` hoặc `docs/AGENT_SKILLS`.

## Rule 4 - Theory Boundary

`docs/theories` chứa pure theory/reasoning foundation.

Không copy full theory vào app docs. App docs chỉ reference stable theory ID hoặc derived rule cần thiết.

## Rule 5 - Workbench Is Inactive

`docs/workbench` hiện chưa được đi vào hoạt động.

Agent không được:

- ghi candidate thật vào workbench;
- promote từ workbench;
- dùng workbench như source of truth;
- lấy workbench làm nơi chứa note chưa rõ home.

## Rule 6 - App Variants Are Reusable Only

`docs/app_variants` là reusable taxonomy/template.

Muốn áp dụng vào app phải đi qua `docs/guide/workflows/write-docs.md` và canonical home trong `docs/app` hoặc `docs/meta`.

## Rule 7 - Agent Authority Boundary

```text
Agent output = proposal / draft / validation report
Agent output != canonical approval
```

Agent có thể đọc, phân tích, draft và đề xuất. Agent không tự chốt decision, theory change hoặc meta rule nếu user chưa yêu cầu rõ.

## Rule 8 - Progressive Disclosure

Không đọc toàn bộ `docs/` theo mặc định.

```text
read narrow first
expand only when needed
```

Chi tiết: [reading-strategy.md](reading-strategy.md).

## Rule 9 - Relation Discipline

Không tự tạo relation slot hoặc relation type trong app docs.

Canonical relation slot nằm trong entity type `relations_template`:

```text
docs/meta/01-entity-types/
```

Canonical relation type:

```text
docs/meta/02-relation-types/
```

Valid triple:

```text
docs/meta/03-rules/
```

Entity instance chỉ được ghi relation vào slot đã có.

Khi thiếu slot, relation type hoặc valid triple, reject relation khỏi entity instance. Không ghi relation nghi ngờ trong entity README.
