# Phân tích đưa `custom_modular_monolith_theory` vào nền mới

## Mục tiêu

Tài liệu này phân tích bộ `docs/architecture/custom_modular_monolith_theory` theo mô hình của nền mới trong `docs_native_theory_app/`.

Mục tiêu không phải là copy nguyên folder cũ sang `theories/`, mà là tách đúng:

- phần nào là **Pure Theory**;
- phần nào là **app architecture / technical / implementation**;
- phần nào là **template / guideline vận hành tài liệu**;
- phần nào nếu vẫn muốn giữ ở tầng theory thì phải tách thành **theory khác**, không gộp chung vào `custom modular monolith`.

## Kết luận ngắn

Không nên nhét nguyên folder `custom_modular_monolith_theory` vào một theory duy nhất.

Lý do:

- folder cũ đang trộn cả **lý thuyết pattern**;
- **quy tắc áp dụng vào source code**;
- **template thiết kế module / flow**;
- **gợi ý runtime và integration**;
- **một số tiên đề không còn là modular monolith thuần**, mà là theory khác hoặc architecture rule của app.

Hướng đúng trong nền mới là:

1. Tạo một theory riêng, khuyến nghị slug:
   `docs_native_theory_app/theories/custom-modular-monolith/`
2. Chỉ đưa vào theory này các nội dung nói về:
   module ownership, public boundary, write ownership, read exception có kiểm soát, pragmatic hybrid, anti-pattern và evolution trigger của modular monolith.
3. Các phần về folder code, import rule, audit command, flow template, module template, transaction, retry, webhook, dry-run, job/journal, schema, controller rule cụ thể phải chuyển sang `app/*` hoặc `10-decisions/*`.
4. Một số nội dung generic nhưng không phải modular monolith core nên tách thành theory khác nếu muốn giữ ở tầng theory.

## Đích theory nên tạo trong nền mới

Khuyến nghị tạo:

`docs_native_theory_app/theories/custom-modular-monolith/`

Và phân vai như sau:

### `README.md`

Nên chứa:

- Theory ID, ví dụ `TH-MODULAR`;
- một câu chốt position của pattern;
- 5-8 core positions ngắn;
- ranh giới của theory này;
- khi nào cần đọc `agent.md`;
- khi nào cần đọc `theory.md`;
- app areas bị ảnh hưởng ở mức cao, ví dụ `architecture`, `implementation`, `technical`.

Không nên chứa:

- full reasoning dài;
- ví dụ code;
- tree `src/modules/...`;
- audit command;
- flow template;
- repo-specific module map.

### `agent.md`

Nên chứa:

- stable IDs cho các position chính;
- short rules;
- common violations;
- review checklist;
- dấu hiệu khi nào phải mở `theory.md`.

Nên là nơi đặt các rule kiểu:

- module khác không được đi xuyên vào internal implementation của owner;
- shared DB không đồng nghĩa shared ownership;
- cross-module write phải qua owner API;
- read exception phải explicit và có lý do;
- public API không được biến thành service locator.

### `theory.md`

Nên chứa full Pure Theory của pattern:

- pattern này là gì;
- vì sao không microservice ngay;
- vì sao không layered monolith thuần;
- pragmatic hybrid là gì;
- boundary nào phải strict;
- boundary nào có thể pragmatic;
- evolution trigger nào khiến phải siết chặt hơn;
- trade-off nào đang được chấp nhận.

### `governance.md`

Nên chứa:

- reference note thật sự ảnh hưởng tới theory;
- challenge của theory;
- decision thay đổi theory;
- lý do refine, keep, replace theory.

Không nên dùng `governance.md` để chứa:

- backlog cleanup của repo;
- phase migration plan;
- danh sách todo refactor;
- audit command hằng ngày.

## Những position nên đưa vào theory này

Các position dưới đây đủ “thuần theory” để trở thành lõi của `custom-modular-monolith`.

### Nhóm position cốt lõi

- `TH-MOD-01`: Một custom modular monolith là một application chạy trong một runtime/deployable chính nhưng được chia thành nhiều domain module có ownership rõ.
- `TH-MOD-02`: Shared database không đồng nghĩa shared ownership.
- `TH-MOD-03`: Cross-module write mặc định bị cấm; muốn đổi state của module khác phải đi qua owner API.
- `TH-MOD-04`: Read exception có thể tồn tại trong pragmatic hybrid, nhưng phải read-only, explicit, có lý do và có thể review lại.
- `TH-MOD-05`: Public module API là boundary của capability, không phải service locator hay facade mờ ownership.
- `TH-MOD-06`: Import boundary là tín hiệu đầu tiên để bảo vệ ownership.
- `TH-MOD-07`: Pattern này strict ở các điểm gây bug nặng như write ownership, public API ownership và deep import; có thể pragmatic ở một số read-only snapshot.
- `TH-MOD-08`: Evolution nên bắt đầu từ siết boundary và tách read/write concern trước khi extract service.

### Nhóm nội dung phụ trợ vẫn có thể ở theory này

- vì sao chưa cần microservices ngay;
- vì sao layered monolith thuần dễ mờ owner của state;
- anti-pattern: proxy API, shared DB thành shared ownership, read exception mở rộng vô tội vạ, `shared/` thành bãi chứa business logic;
- review questions như “owner thật của state này là ai?”.

## Những nội dung không nên nhét vào theory này

Có ba nhóm khác nhau.

### Nhóm 1: Không phải theory, mà là app architecture / technical / implementation

Các nội dung sau không nên sống trong `theories/custom-modular-monolith/`:

- module map thật của repo;
- tree source code kiểu `src/modules/<Domain>/...`;
- tên folder `application`, `domain`, `infrastructure`, `support`, `http`;
- import rule viết theo source tree cụ thể;
- `rg` self-audit command;
- transaction frame cụ thể;
- retry/backoff mechanism cụ thể;
- webhook ingest shape;
- dry-run flow cụ thể;
- job/journal mechanism cụ thể;
- flow template;
- module design template;
- compatibility wrapper rule gắn với route cũ;
- schema/table ownership thật của repo;
- read allowlist thật của repo.

### Nhóm 2: Vẫn là theory, nhưng không nên gộp vào theory modular monolith

Một số nội dung trong folder cũ là generic, có giá trị, nhưng không còn là lõi của `custom modular monolith`.

Nếu muốn giữ chúng ở tầng theory, nên tách thành theory khác, ví dụ:

- theory về **canonical core / canonical state**;
- theory về **hub-mediated integration** kiểu `System -> Core -> System`;
- theory về **safe outbound / dry-run before external write**;
- theory về **tách business capability và technical capability**;
- theory về **external adapter không sở hữu business state**.

### Nhóm 3: Template hoặc guideline vận hành docs

Các file template không phải pure theory.

Chúng là khung để tạo app doc hoặc review app doc:

- `module_design_template.md`;
- `flow_template.md`;
- một phần của `flow_examples.md`;
- một phần của `implement_rules.md`.

Loại này nên nằm ở:

- `app/05-architecture/*` nếu đang là knowledge của chính app;
- hoặc một khu meta/reference riêng của nền tài liệu nếu muốn tái dùng như template authoring.

## Nơi nên đặt các nội dung không thuộc theory

Theo cấu trúc của nền mới, đích đặt nên là:

### `app/05-architecture/`

Dùng cho:

- module structure ở mức hệ thống;
- boundary giữa các unit;
- interaction flow ở mức architecture;
- ownership của state;
- ownership và movement của data;
- concern cross-cutting như ownership discipline.

Các concern phù hợp nhất:

- `app/05-architecture/01-structure/`
- `app/05-architecture/02-boundaries/`
- `app/05-architecture/03-interactions/`
- `app/05-architecture/04-state/`
- `app/05-architecture/05-data/`
- `app/05-architecture/07-cross-cutting/`

### `app/06-technical/`

Dùng cho:

- persistence mechanism;
- transaction strategy;
- runtime execution mechanism;
- queue / scheduler / job mechanism;
- webhook interface;
- outbound communication mechanism;
- config mechanism;
- security mechanism.

Các concern phù hợp nhất:

- `app/06-technical/02-interfaces/`
- `app/06-technical/03-persistence/`
- `app/06-technical/04-communication/`
- `app/06-technical/06-execution/`
- `app/06-technical/07-configuration/`

### `app/07-implementation/`

Dùng cho:

- source organization;
- public code contracts;
- controller/use case orchestration rule;
- repository/data-access rule;
- external adapter placement;
- coding rules có thể kiểm tra được;
- audit command dùng cho engineer/agent.

Các concern phù hợp nhất:

- `app/07-implementation/01-organization/`
- `app/07-implementation/02-contracts/`
- `app/07-implementation/03-behavior/`
- `app/07-implementation/04-data-access/`
- `app/07-implementation/05-integration/`
- `app/07-implementation/06-evolution/`
- `app/07-implementation/07-automation/`
- `app/07-implementation/08-coding-rules/`

### `app/10-decisions/`

Dùng cho:

- lựa chọn dùng modular monolith thay vì microservices trong context cụ thể;
- quyết định chấp nhận pragmatic read exception tới mức nào;
- quyết định dry-run là gate bắt buộc trước outbound write;
- quyết định module nào sở hữu canonical state nào;
- quyết định temporary compatibility wrapper còn giữ đến khi nào.

## Phân tích chi tiết theo từng file nguồn

### `overview.md`

Nên đưa vào theory:

- ý chính rằng đây là knowledge về pattern tổng quát;
- phân biệt pattern chung với repo-specific application;
- tinh thần “đọc pattern ở đây, đọc repo application ở architecture guide”.

Nên đặt ở đâu:

- phần rút gọn vào `theories/custom-modular-monolith/README.md`.

Không nên đưa nguyên file:

- thứ tự đọc 13 file của folder cũ;
- cấu trúc folder cũ;
- routing dựa trên folder cũ.

Phần đó nên để ở đâu:

- bỏ hẳn nếu đã chuyển sang cấu trúc 4 file của theory mới;
- hoặc giữ trong note migration tạm thời, không đưa vào theory.

### `theory.md`

Nên đưa vào theory:

- gần như toàn bộ reasoning chính của pattern;
- so sánh với microservices;
- so sánh với layered monolith;
- giải thích pragmatic hybrid;
- kết luận về khi nào pattern này phù hợp.

Nên đặt ở đâu:

- `theories/custom-modular-monolith/theory.md`;
- bản tóm tắt 1-2 đoạn đầu nên rút vào `README.md`.

Không nên giữ nguyên verbatim:

- cách trình bày cũ đang thiên về article dài;
- nên refactor thành position có stable ID và section rõ hơn.

### `knowledge_boundary.md`

Nên đưa vào theory:

- phần định nghĩa “theory này bao phủ gì”;
- phần định nghĩa “không bao phủ gì”;
- nguyên tắc cập nhật: đổi pattern chung thì sửa theory, đổi cách repo áp dụng thì sửa app docs.

Nên đặt ở đâu:

- boundary ngắn vào `README.md`;
- short rule vào `agent.md`;
- rule về evolution placement vào `governance.md`.

Không nên giữ nguyên dạng “folder policy” cũ:

- trong nền mới, boundary không còn là boundary của folder cũ mà là boundary của chính theory entity.

### `design_axioms.md`

Đây là file cần tách mạnh nhất.

Nên giữ trong theory `custom-modular-monolith`:

- Axiom 3: shared DB không đồng nghĩa shared ownership;
- Axiom 4: write ownership nghiêm hơn read ownership;
- Axiom 5: module API là boundary, không phải service locator;
- Axiom 10: giai đoạn đầu có thể cắt scope nhưng không cắt nền móng;

Nên đặt vào `agent.md` hoặc implementation rule:

- Axiom 6: controller không orchestration chéo domain.

Không nên nhét vào theory này:

- Axiom 1: system không đi tắt qua core;
- Axiom 2: core model không chỉ là cache;
- Axiom 7: external adapter không sở hữu business state;
- Axiom 8: job và journal là một phần của boundary;
- Axiom 9: dry-run là boundary an toàn cho outbound;
- Axiom 11: evolution không được phá product model lõi;
- Axiom 12: tách business capability và technical capability.

Các phần đó nên để ở đâu:

- nếu là repo application thật thì đưa vào `app/05-architecture/*`, `app/06-technical/*`, `app/10-decisions/*`;
- nếu muốn giữ ở tầng theory thì tách thành theory khác, không gộp chung vào modular monolith.

### `concepts.md`

Nên đưa vào theory:

- `Module`;
- `Public API`;
- `Owner API`;
- `Application database` với ý shared DB không đồng nghĩa shared ownership;
- `Read model` và `snapshot read` ở mức khái niệm;

Nên đặt ở đâu:

- phần định nghĩa ngắn vào `README.md`;
- phần định nghĩa đầy đủ vào `theory.md`;
- short glossary vận hành vào `agent.md`.

Không nên đưa nguyên khối vào theory này:

- `Canonical model` nếu đang mang nghĩa hub/canonical-state rộng hơn modular monolith;
- `Boundary tier` T0-T4 như taxonomy áp dụng.

Phần đó nên để ở đâu:

- `canonical model` nên sang theory khác hoặc `app/05-architecture/04-state/` và `05-data/`;
- `boundary tier` nên sang `app/05-architecture/02-boundaries/` như rule áp dụng của app.

### `module_structure.md`

Nên đưa vào theory:

- ý rằng module có public boundary và internal parts;
- ý rằng internal implementation không phải public surface.

Không nên đưa vào theory:

- tree `src/modules/<Domain>/`;
- tên folder `application`, `domain`, `infrastructure`, `support`, `http`;
- rule đặt `src/shared` và `src/infrastructure` theo source tree.

Phần đó nên để ở đâu:

- `app/07-implementation/01-organization/`;
- `app/07-implementation/02-contracts/`;
- một phần liên quan public surface có thể tham chiếu từ `app/05-architecture/01-structure/`.

### `boundary_model.md`

Nên đưa vào theory:

- import boundary;
- public API ownership;
- data write ownership;
- nguyên tắc read exception có tier/phân loại thay vì tự do;

Nên đưa vào `agent.md`:

- common violation: deep import;
- common violation: module A proxy logic của module B.

Không nên đưa nguyên dạng vào theory:

- controller ownership như coding rule cụ thể;
- code sample `require(...)`;
- transaction boundary frame;
- error and retry boundary chi tiết;
- data access tiers dùng như taxonomy áp dụng.

Phần đó nên để ở đâu:

- controller rule: `app/07-implementation/03-behavior/` hoặc `08-coding-rules/`;
- transaction: `app/06-technical/03-persistence/` hoặc `06-execution/`;
- retry/error boundary: `app/06-technical/04-communication/` và `06-execution/`;
- tier taxonomy: `app/05-architecture/02-boundaries/`.

### `data_ownership.md`

Nên đưa vào theory:

- owner write, consumer không write trực tiếp;
- read exception phải explicit, read-only, có allowlist, không copy business rule.

Không nên đưa vào theory:

- bảng template ownership như artifact áp dụng;
- allowlist thật của repo;
- cách điền bảng theo aggregate thật.

Phần đó nên để ở đâu:

- `app/05-architecture/04-state/`;
- `app/05-architecture/05-data/`.

### `flow_examples.md`

Không nên đưa vào theory này.

Lý do:

- đây là example flow shape;
- nó mô tả interaction pattern và runtime behavior;
- nó nằm gần architecture/technical hơn pure reasoning foundation.

Nên để ở đâu:

- `app/05-architecture/03-interactions/` nếu là flow thật của app;
- `app/06-technical/06-execution/` nếu nhấn vào runtime execution;
- nếu chỉ muốn giữ như example authoring thì tách thành reference/template ngoài theory.

### `module_design_template.md`

Không nên đưa vào theory này.

Lý do:

- đây là template để thiết kế hoặc document module;
- nó là khung authoring, không phải principle.

Nên để ở đâu:

- nếu dùng để document module thật của app: `app/05-architecture/01-structure/`;
- nếu dùng để mô tả source organization và public surface: liên kết thêm sang `app/07-implementation/01-organization/` và `02-contracts/`;
- nếu muốn tái dùng như template của nền tài liệu: đưa vào meta/reference, không đưa vào theory.

### `flow_template.md`

Không nên đưa vào theory này.

Lý do:

- đây là template design flow;
- nó nói “document flow như thế nào”, không nói “project tin điều gì”.

Nên để ở đâu:

- `app/05-architecture/03-interactions/` nếu đang mô tả flow architecture thật;
- hoặc meta/reference nếu muốn giữ như reusable authoring template.

### `evolution.md`

Nên đưa vào theory:

- ý rằng modular monolith phải hỗ trợ đi qua nhiều giai đoạn mà không rewrite từ đầu;
- trigger nào khiến phải strict hơn;
- giai đoạn nào nên thêm worker, read model, database boundary, service extraction.

Nên đặt ở đâu:

- section evolution/tensions trong `theory.md`;
- tóm tắt ngắn trong `README.md`.

Không nên biến thành plan của app:

- nếu đã là roadmap thật của project thì nó không còn là theory nữa.

Phần app-specific nên để ở đâu:

- `app/10-decisions/` nếu là lựa chọn kiến trúc có chủ đích;
- `app/07-implementation/06-evolution/` nếu là migration/source evolution;
- `app/09-operation/` nếu là rollout/runtime evolution.

### `tradeoffs_and_antipatterns.md`

Nên đưa vào theory:

- trade-off chấp nhận được;
- anti-pattern cốt lõi;
- review question mức principle.

Nên đặt ở đâu:

- trade-off vào `theory.md`;
- anti-pattern và review checklist vào `agent.md`.

Không cần tách sang app docs trừ khi:

- project quyết định thêm trade-off cụ thể chỉ đúng trong app này.

Khi đó phần app-specific nên vào:

- `app/10-decisions/`;
- hoặc `app/05-architecture/02-boundaries/`.

### `implement_rules.md`

Không nên đưa vào theory này.

Lý do:

- đây là operational coding rule;
- nó được dùng để review source code;
- nó có command kiểm tra và mapping trực tiếp vào source tree.

Nên để ở đâu:

- `app/07-implementation/08-coding-rules/` cho các rule như import boundary, owner API, cấm copy business rule;
- `app/07-implementation/01-organization/` cho source layout;
- `app/07-implementation/02-contracts/` cho public API rule;
- `app/07-implementation/07-automation/` cho self-audit command hoặc enforce script.

Phần nào của file này có thể rút ngược lên theory:

- chỉ phần principle đằng sau rule, ví dụ “module khác chỉ đi qua public boundary”, “cross-module write phải qua owner”.

Không đưa các câu lệnh `rg` vào theory.

### `p2_cleanup_plan.md`

Không đưa vào theory.

Không đưa vào app foundation như knowledge lâu dài trừ khi nó được chuyển thành:

- decision;
- migration strategy;
- hoặc architecture debt record có giá trị bền.

Trong trạng thái hiện tại, đúng nhất là:

- giữ ngoài theory;
- nếu là cleanup plan thật của repo thì đặt ở `app/07-implementation/06-evolution/` hoặc hệ thống work/backlog riêng.

## Ma trận tóm tắt

| File nguồn | Có vào theory `custom-modular-monolith` không | Đích chính |
| --- | --- | --- |
| `overview.md` | Có một phần | `theories/.../README.md` |
| `theory.md` | Có, phần lớn | `theories/.../theory.md` |
| `knowledge_boundary.md` | Có một phần | `README.md`, `agent.md`, `governance.md` |
| `design_axioms.md` | Chỉ một phần | `theory.md`, `agent.md`, phần còn lại sang `app/*` hoặc theory khác |
| `concepts.md` | Có một phần lớn | `README.md`, `agent.md`, `theory.md` |
| `module_structure.md` | Chỉ phần khái niệm | `theory.md`, phần code layout sang `app/07-implementation/*` |
| `boundary_model.md` | Có một phần | `theory.md`, `agent.md`, phần runtime sang `app/05` và `app/06` |
| `data_ownership.md` | Có phần principle | `theory.md`, phần bảng áp dụng sang `app/05` |
| `flow_examples.md` | Không | `app/05-architecture/03-interactions/` hoặc reference |
| `module_design_template.md` | Không | `app/05-architecture/01-structure/` hoặc meta/reference |
| `flow_template.md` | Không | `app/05-architecture/03-interactions/` hoặc meta/reference |
| `evolution.md` | Có, phần lớn | `theory.md`, phần project-specific sang `app/10` hoặc `app/07` |
| `tradeoffs_and_antipatterns.md` | Có, phần lớn | `theory.md` và `agent.md` |
| `implement_rules.md` | Không | `app/07-implementation/08-coding-rules/` và `07-automation/` |
| `p2_cleanup_plan.md` | Không | `app/07-implementation/06-evolution/` hoặc work/backlog |

## Đề xuất cách migrate thực tế

Thứ tự migrate nên là:

1. Tạo theory mới `custom-modular-monolith`.
2. Rút lõi từ `theory.md`, `knowledge_boundary.md`, `concepts.md`, `boundary_model.md`, `evolution.md`, `tradeoffs_and_antipatterns.md`.
3. Tách `design_axioms.md` thành:
   phần modular-monolith core;
   phần app architecture;
   phần theory khác nếu cần.
4. Đưa `module_structure.md` và `implement_rules.md` sang `app/07-implementation/*`.
5. Đưa `data_ownership.md` và phần tier/allowlist của `boundary_model.md` sang `app/05-architecture/*`.
6. Đưa `flow_template.md`, `flow_examples.md`, `module_design_template.md` ra khỏi theory.
7. Chỉ sau khi split xong mới viết `agent.md` để tránh agent bị nhồi cả template và rule runtime không đúng scope.

## Kết luận cuối

Nếu mục tiêu là đưa bộ `custom_modular_monolith_theory` vào nền mới một cách đúng lớp, thì câu trả lời là:

- **không migrate theo folder-to-folder**;
- **phải migrate theo meaning-to-layer**.

Theory mới chỉ nên giữ phần reasoning bền vững của pattern modular monolith.

Mọi thứ mô tả:

- app này áp dụng pattern ra sao;
- source code tổ chức ra sao;
- flow chạy thế nào;
- runtime xử lý thế nào;
- audit kiểm tra bằng lệnh gì;

đều không nên nhét vào theory, mà phải đặt vào `app/05-architecture`, `app/06-technical`, `app/07-implementation`, hoặc `app/10-decisions` tùy bản chất.
