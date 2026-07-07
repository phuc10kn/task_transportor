# TH-AI-GOV - Full Theory

## Question

AI nên tham gia vào hệ thống vận hành ở mức nào để tăng năng suất mà không làm mất trách nhiệm và khả năng giải thích?

## Position

AI được phép:

- tạo draft;
- đề xuất;
- phân tích;
- ưu tiên review;
- hỗ trợ tìm khoảng trống.

AI không được tự mặc định trở thành người quyết định cuối cùng cho mutation quan trọng của operational state.

## Principles

### `TH-AI-GOV-01` - AI propose, human decide

Điểm cốt lõi không phải “AI có giỏi không” mà là “ai chịu trách nhiệm cuối cùng”. Theory này giữ final authority ở human hoặc policy đã được con người phê duyệt rõ.

### `TH-AI-GOV-02` - Transport tách khỏi business review

HTTP, process execution, auth, timeout hay request protocol là technical concern. Review state, confidence interpretation và apply policy là business concern.

### `TH-AI-GOV-03` - Provider is not domain

Domain không nên bị khóa theo tên nhà cung cấp hay model. Nếu contract nghiệp vụ thay đổi mỗi khi đổi provider, boundary đã sai.

### `TH-AI-GOV-04` - Reviewed result mới có hiệu lực

Draft AI chỉ là ứng viên. Nó chỉ trở thành operational mutation sau khi đi qua owner path.

### `TH-AI-GOV-05` - Confidence guides review, not authority

Confidence có thể giúp xếp ưu tiên hoặc cảnh báo, nhưng không thay thế trách nhiệm phê duyệt.

## Reasoning

AI tạo giá trị mạnh ở phần sinh phương án và giảm tải thao tác lặp. Nhưng chính vì đầu ra của nó mang xác suất, hệ thống vận hành phải có lớp governance rõ:

- nơi nào chỉ cần draft;
- nơi nào bắt buộc review;
- nơi nào được phép tự động hóa theo policy đã duyệt.

Nếu bỏ lớp này, project có thể đi nhanh trong ngắn hạn nhưng sẽ mất khả năng giải thích vì sao một thay đổi vận hành đã được chấp nhận.

## Boundaries

Theory này không quyết định:

- model nào tốt nhất;
- provider nào mặc định;
- prompt cụ thể ra sao;
- payload transport chi tiết như thế nào.

Những thứ đó thuộc technical implementation hoặc app decision.

## Tensions

- Tự động hóa mạnh giảm thời gian xử lý nhưng tăng nhu cầu guardrail.
- Đổi provider nhanh giúp linh hoạt nhưng dễ rò domain coupling nếu contract không trung tính.
- Review quá nặng tay làm giảm lợi ích AI; review quá nhẹ tay làm tăng rủi ro sai lệch.

## Evolution

Theory này có thể tiến hóa khi project có thêm:

- policy auto-apply rõ ràng cho phạm vi hẹp;
- nhiều loại AI task khác ngoài translation hoặc suggestion;
- cơ chế confidence calibration đủ tốt để thay đổi mức review.

## Open questions

- Điều kiện tối thiểu nào cho một auto-apply policy mà vẫn không phá final accountability?
- Khi có nhiều AI capability khác nhau, có cần tách subgroup governance theo loại hỗ trợ hay không?
