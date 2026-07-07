# TH-OPS-TRACE - Full Theory

## Question

Một hệ thống có side effect nên tổ chức operation như thế nào để thất bại không biến thành vùng mù?

## Position

Operation quan trọng phải để lại đủ dấu vết để người vận hành biết:

- cái gì đã được thử;
- cái gì đã thành công hoặc thất bại;
- có thể retry hay recover không;
- nếu không recover được thì tối thiểu chẩn đoán được vì sao.

## Principles

### `TH-OPS-TRACE-01` - Side effect must be traceable

Nếu một hành động tạo thay đổi ở trong hoặc ngoài hệ thống, phải có trace để lần lại lịch sử của hành động đó.

### `TH-OPS-TRACE-02` - Retry is operational meaning

Retry không chỉ là cơ chế kỹ thuật. Nó là quyết định rằng một action có thể đáng thử lại dưới điều kiện nào đó.

### `TH-OPS-TRACE-03` - Audit is for decisions

Journal và audit có giá trị khi giúp người hoặc hệ thống quyết định tiếp theo: retry, dừng, escalate, hoặc điều tra.

### `TH-OPS-TRACE-04` - Failure should be recoverable or diagnosable

Không phải mọi failure đều cứu được, nhưng hệ thống tốt phải hạn chế failure “mất tích” không còn cách giải thích.

### `TH-OPS-TRACE-05` - Operation state is not business state

Running, failed, retried hay cancelled là state của operation. Chúng không thay thế meaning nghiệp vụ của entity mà action đang tác động.

## Reasoning

Một hệ thống có side effect mà không có trace đầy đủ sẽ đẩy gánh nặng nhận thức sang con người. Mỗi lần sự cố, operator phải tự suy luận bằng log rời rạc hoặc đoán trạng thái hiện tại. Theory này giữ nguyên tắc ngược lại: system phải tạo đủ evidence để sự cố trở thành câu hỏi điều tra được, không phải bí ẩn.

Retry cũng cần governance. Nếu cứ thấy lỗi là retry, hệ thống có thể lặp lại sai lầm mà không tiến gần hơn tới recovery. Vì thế retry phải gắn với context, policy và trace.

## Boundaries

Theory này không quyết định:

- action nào được dry-run hay bị block trước publish;
- canonical truth nằm ở đâu;
- module nào sở hữu owner API nào;
- schema cụ thể của queue, journal hay dashboard.

Nó chỉ quyết định cách nhìn về recoverability và explainability của operation.

## Tensions

- Trace quá đầy đủ có thể làm tăng chi phí lưu trữ và noise.
- Retry tự động tăng resilience nhưng có thể che giấu lỗi hệ thống hoặc làm operator mất niềm tin.
- Audit mạnh giúp giải thích tốt hơn nhưng đòi hỏi discipline trong thiết kế event và trạng thái.

## Evolution

Theory này có thể tiến hóa khi project đổi mức độ tự động hóa, số loại side effect, hoặc yêu cầu incident response. Nhưng lõi của nó vẫn là: side effect phải để lại evidence đủ để quyết định hành động tiếp theo.

## Open questions

- Khi nào một loại failure nên chuyển từ auto-retry sang operator-only recovery?
- Mức tối thiểu nào của trace là đủ cho diagnosability mà không gây overload?
