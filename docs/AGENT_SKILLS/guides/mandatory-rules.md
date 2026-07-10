# Mandatory Rules

Các rule bắt buộc khi agent đọc hoặc sửa documentation.

## Rule 1 - Guide Owns Operating Flow

Trước khi sửa docs, đọc [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn).

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

Chưa có workbench-support agent active. Standard agent không được chuyển task docs thường vào workbench.

Agent không được:

- ghi candidate thật vào workbench;
- promote từ workbench;
- dùng workbench như source of truth;
- lấy workbench làm nơi chứa note chưa rõ home.

## Rule 6 - Guide Packs Are Reusable Only

`docs/guide/reference/entity-maps/packs/` là reusable taxonomy/template xuyên dự án.

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

Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`.

Assumption và ContextConstraint không tự tạo outbound relation tới mọi entity. Chỉ tạo relation tới các premise này khi entity bị ảnh hưởng có slot cụ thể và valid triple cụ thể.

## Rule 10 - Type Contract Gate

Khi tạo/sửa entity type hoặc tạo instance mới, agent phải kiểm tra type có explicit `schema` và `## structure extends` theo `docs/meta/00-schemas/entity-type-definition.md`.

Type legacy chưa có instance chỉ là debt. Type legacy đang được sửa hoặc sắp có instance mới phải được chuẩn hóa trước; không tạo instance để né gate.

```text
npm run verify:entity-type-contract -- --type <canonical-entity-type-path>
npm run verify:entity-type-contract -- --instance <docs/app-instance-readme-path>
```

## Rule 11 - Project Graph Trace Policy

Khi materialize canonical relation trong `docs/app`, đọc `DEC-002 App Graph Materialization Policy` trước. Chỉ materialize vertical slice có trace query, evidence, relation type, valid triple, relation slot và target instance rõ.

Không convert mọi prose relation, không ghi dual edge để query ngược, và báo edge cố ý giữ prose cùng lý do.
