# TH-MODULAR - Full Theory

## Question

Project nên hiểu module như thế nào để vừa delivery được trong một monolith, vừa không làm mất ownership và khả năng tiến hóa?

## Position

Custom modular monolith được chọn khi project cần một runtime đủ đơn giản để đi nhanh, nhưng vẫn cần boundary đủ mạnh để business capability không trộn vào nhau.

Trong theory này, `module` không phải là bài tập thẩm mỹ về folder. Nó là hợp đồng về:

- ai sở hữu hành vi;
- ai được quyết định state;
- điểm nào được công khai;
- điểm nào phải bị che giấu.

## Principles

### `TH-MOD-01` - Behavioral ownership là lõi

Boundary được xác định bởi hành vi và quyết định nghiệp vụ mà module sở hữu. Folder chỉ là biểu hiện phụ trợ.

### `TH-MOD-02` - Boundary quan trọng hơn uniform structure

Không cần ép mọi module giống hệt nhau nếu việc đó làm mờ owner hoặc kéo business rule ra khỏi nơi nên sống.

### `TH-MOD-03` - Prefer deep modules

Một module tốt hấp thụ complexity vào bên trong và chỉ lộ capability cần thiết. Public surface càng rộng, khả năng drift boundary càng cao.

### `TH-MOD-04` - Hide internal implementation

Consumer được quyền phụ thuộc vào contract công khai, không được phụ thuộc vào tổ chức nội bộ. Điều này giữ cho owner có quyền đổi implementation mà không gây dây chuyền.

### `TH-MOD-05` - Shared infrastructure là contextual

Shared infrastructure không xấu nếu nó chỉ cung cấp mechanism. Nó trở thành vấn đề khi bắt đầu giữ policy hoặc lifecycle nghiệp vụ thay cho owner module.

### `TH-MOD-06` - Data ownership là ownership theo hành vi ghi

Dữ liệu có thể ở cùng một database nhưng không vì thế mà mọi module đều là đồng-owner. Quyền ghi và quyền định nghĩa meaning của state mới là đường biên thực.

## Reasoning

Monolith không thất bại vì chạy chung process. Nó thất bại khi mọi capability trở thành tài nguyên chung không còn owner thật. Khi đó chi phí thay đổi tăng lên vì mỗi sửa đổi chạm vào nhiều vùng nghĩa cùng lúc.

Custom modular monolith chấp nhận pragmatic sharing ở runtime, deployment và storage, nhưng không chấp nhận pragmatic collapse ở ownership. Project có thể tạm giữ một app duy nhất, một queue nội bộ, hoặc shared DB. Điều không được đánh đổi là:

- owner của business rule;
- lối vào công khai của capability;
- ranh giới giữa read convenience và write authority.

## Boundaries

Theory này không sở hữu:

- vì sao flow phải đi qua core hub;
- canonical truth là gì;
- khi nào outbound write phải bị gate;
- retry, journal và recoverability phải làm ra sao.

Những phần đó thuộc theory khác vì chúng trả lời câu hỏi lõi khác.

## Tensions

- Cấu trúc càng đơn giản càng dễ bắt đầu, nhưng đơn giản giả có thể làm nợ boundary phình ra.
- Shared DB giúp đi nhanh ở giai đoạn đầu, nhưng nếu không có write discipline thì sẽ triệt tiêu owner boundary.
- Public API quá nhỏ có thể gây wrapper chồng chéo; public API quá rộng lại biến thành service locator.

## Evolution

Theory này không mặc định đẩy project sang microservice. Split runtime chỉ có ý nghĩa khi boundary nghiệp vụ đã đủ rõ và có áp lực thực sự như:

- scaling profile khác nhau;
- failure isolation cần tách;
- release cadence xung đột;
- boundary nội bộ đã ổn định đủ lâu.

Nếu boundary còn mờ, tách runtime sớm chỉ nhân bản vấn đề sang hạ tầng phân tán.

## Open questions

- Khi nào read allowlist nên được nâng thành explicit read model thay vì đọc trực tiếp owner storage?
- Khi nào một shared platform unit bắt đầu giữ business policy và phải bị đẩy về owner module?
- Tại ngưỡng nào một module “quá mỏng” cần bị nhập lại thay vì tiếp tục tồn tại như boundary giả?
