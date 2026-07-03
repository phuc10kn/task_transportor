# Knowledge boundary

File này định nghĩa ranh giới tri thức của folder `custom_modular_monolith`.

Folder này không phải nơi ghi mọi spec sản phẩm, mọi endpoint, hay mọi column chi tiết. Folder này chỉ giữ kiến thức kiến trúc dùng để thiết kế và kiểm tra modular monolith của dự án.

## Những gì thuộc folder này

### 1. Lý thuyết kiến trúc

Bao gồm:

- Vì sao dự án chọn custom modular monolith.
- Vì sao không tách microservice sớm.
- Vì sao không dùng layered monolith thuần.
- Vì sao shared SQLite Lite vẫn cần ownership rõ.
- Vì sao strict mọi read qua API là quá tay trong Lite.
- Khi nào phải nâng strict hơn.

### 2. Ngôn ngữ module

Bao gồm:

- Module là gì.
- Domain ownership là gì.
- Bounded context là gì.
- Public API của module là gì.
- Owner API là gì.
- `application`, `domain`, `infrastructure`, `support`, `shared` khác nhau thế nào.

### 3. Boundary rules

Bao gồm:

- Import boundary.
- Controller/HTTP ownership.
- Public API ownership.
- Cross-module write ownership.
- Data access tiers.
- Transaction boundary.
- Error/retry boundary.
- AI/Translation technical boundary.

### 4. Data ownership

Bao gồm:

- Bảng/aggregate nào thuộc module nào.
- Module nào được write.
- Module nào được read.
- Read SQL chéo bảng nào được allowlist.
- Khi nào read exception phải chuyển thành owner API hoặc read model.

### 5. Flow design

Bao gồm:

- Cách thiết kế flow theo `System -> CIS -> System`.
- Flow nào phải có normalizer.
- Flow nào phải có job/journal.
- Flow nào phải dry-run trước outbound thật.
- Flow nào được phép direct HTTP và flow nào phải qua worker/job.

### 6. Evolution

Bao gồm:

- Lite, Medium, Full kế thừa modular monolith ra sao.
- Khi nào tách worker.
- Khi nào đổi DB.
- Khi nào tách module thành service.
- Contract nào không đổi khi runtime thay đổi.

### 7. Governance

Bao gồm:

- Checklist thiết kế module mới.
- Checklist thiết kế flow mới.
- Checklist review PR/task đụng `src/modules`.
- Audit command bắt buộc.
- Definition of Done boundary.

## Những gì không thuộc folder này

### Endpoint chi tiết

Endpoint chi tiết thuộc API contract hoặc phase plan. Folder này chỉ nêu rule kiến trúc:

- route thuộc module nào;
- route compatibility xử lý ra sao;
- action ghi nào cần audit;
- outbound nào cần pre-check/dry-run.

### Schema column đầy đủ

Schema chi tiết thuộc schema spec hoặc migration. Folder này chỉ nêu ownership:

- bảng nào thuộc module nào;
- module nào được write;
- read exception nào được phép.

### UI chi tiết

UI detail thuộc Admin UI docs hoặc workflow docs. Folder này chỉ nêu boundary:

- Issue Editor sửa canonical CIS như thế nào;
- Translation modal thuộc Translation ra sao;
- Jira sync modal không bypass dry-run/pre-check.

### Phase checklist sản phẩm

Phase checklist thuộc Lite/Medium/Full plans. Folder này chỉ nêu rule không được phá khi implement phase.

## Nguyên tắc cập nhật

Khi một quyết định ảnh hưởng tới modular monolith:

1. Cập nhật file phù hợp trong folder này.
2. Nếu quyết định ảnh hưởng product/API/schema, cập nhật thêm spec tương ứng bên ngoài.
3. File ngoài folder chỉ nên link về folder này cho theory/rules/explain.
4. Không tạo bản diễn giải modular monolith mới ở nơi khác.

## Dấu hiệu phải cập nhật folder này

Cần cập nhật folder này nếu có một trong các thay đổi:

- Thêm module mới.
- Đổi ownership bảng/aggregate.
- Thêm cross-module read exception.
- Thêm cross-module write path mới.
- Đổi rule compatibility route.
- Đổi cách Translation gọi AI.
- Đổi cách worker/job/journal vận hành.
- Tách worker/process/service.
- Đổi SQLite sang DB khác.
- Thêm external system mới ngoài Backlog/Jira.

