# TH-CANON - Full Theory

## Question

Một hệ tích hợp trung gian nên quản lý operational truth như thế nào để vừa giữ được dữ liệu nguồn, vừa cho phép xử lý và ra quyết định nhất quán?

## Position

Project cần tách rõ ít nhất ba lớp state:

- snapshot từ hệ nguồn;
- canonical state mà hệ thống dùng để vận hành;
- state phụ trợ như review queue, workflow, journal hoặc read model.

Nếu các lớp này bị trộn, hệ thống sẽ không còn biết mình đang tin vào điều gì.

## Principles

### `TH-CANON-01` - Canonical state là operational truth

Canonical state là nhánh state mà các processing tiếp theo tin vào khi build output, quyết định readiness hay hiển thị tình trạng vận hành.

### `TH-CANON-02` - Source snapshot phải giữ riêng

Dữ liệu từ hệ nguồn có giá trị như bằng chứng và khả năng truy vết. Nó không nên bị mất đi chỉ vì project cần chỉnh sửa một branch vận hành.

### `TH-CANON-03` - Reviewed state không thay canonical state

Draft AI, review queue hay bất kỳ state trung gian nào chỉ có giá trị khi được apply qua owner path vào canonical branch.

### `TH-CANON-04` - Canonical truth cần owner rõ

Một state chỉ ổn định khi có nơi chịu trách nhiệm cuối cùng cho meaning và mutation của nó.

### `TH-CANON-05` - Projection không phải truth

Read model, dashboard view hay payload preview có thể hữu ích, nhưng chúng là diễn giải hoặc materialization cho mục đích tiêu thụ. Chúng không thay thế canonical branch.

## Reasoning

Một core hub thường phải giải quyết hai nhu cầu xung đột:

- giữ trung thực với dữ liệu nguồn;
- có một state đủ ổn định để vận hành và chỉnh sửa.

Nếu chỉ giữ source snapshot, hệ thống khó thực hiện review, override hoặc enrichment. Nếu chỉ giữ canonical state và ghi đè lên nguồn, hệ thống mất dấu vết và khó giải thích.

Vì vậy theory này chọn mô hình hai lớp trở lên: source snapshot vẫn tồn tại, nhưng operational truth sống ở canonical branch có owner rõ ràng.

## Boundaries

Theory này không quyết định:

- module boundary và public surface;
- hình dạng hub integration;
- outbound guardrail như dry-run hay stale preview;
- retry và journal policy.

Nó cũng không khóa project vào schema hay field-path cụ thể nào.

## Tensions

- Giữ đủ snapshot làm state model phức tạp hơn, nhưng đổi lại tăng traceability.
- Quá nhiều branch state có thể gây nhầm lẫn nếu owner không rõ.
- Canonical branch quá dễ sửa có thể drift khỏi nguồn; quá khó sửa lại làm mất giá trị vận hành.

## Evolution

Theory này nên tiến hóa khi project thay đổi định nghĩa về operational truth, ví dụ:

- xuất hiện nhiều canonical branch cạnh tranh;
- workflow phụ trợ bắt đầu đòi quyền mutate trực tiếp truth model;
- read model trở nên quan trọng đến mức cần được phân tách chính thức.

## Open questions

- Khi nào một reviewed state đủ quan trọng để tách thành domain state riêng thay vì chỉ là bước trung gian?
- Khi nào cần version hóa canonical branch mạnh hơn thay vì chỉ giữ snapshot nguồn và state hiện tại?
