# TH-HUBFLOW - Full Theory

## Question

Vì sao một hệ tích hợp nên buộc dữ liệu đi qua core hub thay vì nối trực tiếp từng cặp system với nhau?

## Position

Hub-mediated integration được chọn khi project cần một nơi trung tâm để:

- chuẩn hóa input;
- giữ state trung gian có nghĩa;
- áp chính sách review hoặc kiểm soát;
- quyết định khi nào outbound được phép xảy ra.

Nếu bỏ core hub, mỗi cặp tích hợp sẽ phải tự gánh các quyết định đó. Kết quả là logic bị nhân bản và khó kiểm soát.

## Principles

### `TH-HUBFLOW-01` - No direct bypass

Khi dữ liệu cần được chuẩn hóa, review, học mapping hoặc audit, đường đi đúng là `System -> Core Hub -> System`, không phải đường tắt giữa hai hệ ngoài.

### `TH-HUBFLOW-02` - Inbound first

Inbound phải được đưa vào lõi trước để hệ thống có một điểm quan sát và xử lý thống nhất trước khi tạo hiệu ứng tiếp theo.

### `TH-HUBFLOW-03` - Core is not a pass-through cache

Một hub có nghĩa khi nó sở hữu logic trung gian, state vận hành hoặc quyết định về readiness. Nếu chỉ relay payload, nó là overhead chứ không phải kiến trúc.

### `TH-HUBFLOW-04` - Outbound follows core governance

Outbound phải là hệ quả của state và policy bên trong core, không phải phản ứng cơ học ngay khi nhận inbound.

### `TH-HUBFLOW-05` - Adapters are not final authorities

Adapter ngoài chỉ nên lo giao tiếp kỹ thuật với external system. Quyết định nghiệp vụ cuối cùng phải sống ở core.

## Reasoning

Point-to-point integration hấp dẫn vì bắt đầu nhanh. Nhưng nó nhanh bằng cách bỏ qua nơi chứa reasoning chung. Khi số flow tăng, project bắt đầu trả giá:

- mỗi integration tự giữ logic riêng;
- khó audit vì không có checkpoint trung tâm;
- khó áp guardrail nhất quán;
- khó thay hệ ngoài mà không lan change dây chuyền.

Core hub tạo thêm một chặng, nhưng đổi lại nó tạo ra nơi hợp nhất policy và feedback loop. Đó là điểm mà project có thể nói “vì sao hệ thống cho phép hoặc chặn bước tiếp theo”.

## Boundaries

Theory này không quyết định:

- canonical state được tổ chức ra sao;
- module nào sở hữu storage nào;
- dry-run hay retry hoạt động chi tiết thế nào.

Nó chỉ quyết định shape của integration reasoning: mọi đường quan trọng phải đi qua lõi trung gian có nghĩa.

## Tensions

- Đi qua hub làm flow dài hơn, nhưng đổi lại tạo khả năng kiểm soát.
- Core quá mỏng sẽ không đủ giá trị; core quá tham lam có thể hấp thụ cả những thứ không nên thuộc về nó.
- Một hub generic quá mức dễ trở thành nơi chất đống mọi logic không owner.

## Evolution

Theory này nên được giữ chừng nào project còn cần:

- chuẩn hóa dữ liệu đa nguồn;
- review và gating trước outbound;
- audit và feedback loop tập trung.

Nếu một dòng dữ liệu thật sự không cần bất kỳ processing trung gian nào, project có thể cân nhắc ngoại lệ. Nhưng ngoại lệ đó phải được chứng minh rõ, không phải dùng làm đường mặc định.

## Open questions

- Khi nào một integration đủ đơn giản để không cần full hub governance?
- Khi nào core hub nên tách thành nhiều hub chuyên trách mà vẫn không rơi về point-to-point chaos?
