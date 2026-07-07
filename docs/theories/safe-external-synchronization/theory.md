# TH-SYNC-SAFE - Full Theory

## Question

Một hệ thống nên quản trị outbound external write như thế nào để tránh biến publish thành hành động mù hoặc khó thu hồi?

## Position

External write là side effect rủi ro cao vì nó chạm sang biên của hệ khác. Vì vậy nó cần guardrail mạnh hơn mutation nội bộ. Dry-run, pre-check và stale-preview rule không phải chi tiết phụ; chúng là phần lõi của safety model.

## Principles

### `TH-SYNC-SAFE-01` - External write is high-risk

Ghi sang hệ ngoài thường khó đảo ngược hơn cập nhật nội bộ, và hậu quả sai lệch cũng khó cô lập hơn.

### `TH-SYNC-SAFE-02` - Dry-run is a real gate

Dry-run tồn tại để giúp hệ thống và operator biết liệu publish có hợp lệ hay không. Nó không chỉ để hiển thị payload.

### `TH-SYNC-SAFE-03` - Preconditions may block publish

Thiếu mapping, anomaly chưa xử lý, config chưa sẵn sàng hoặc dữ liệu đã cũ đều phải có quyền chặn sync thật.

### `TH-SYNC-SAFE-04` - Preview freshness matters

Một preview chỉ hữu ích khi nó còn đại diện cho state hiện tại. Nếu state đã đổi, preview cũ không còn là bằng chứng đủ mạnh cho publish.

### `TH-SYNC-SAFE-05` - Irreversible actions need stronger governance

Hành động càng khó thu hồi càng cần nhiều tín hiệu xác nhận trước khi cho phép chạy.

## Reasoning

Nếu publish thật dễ hơn preview, hệ thống đang gửi tín hiệu sai: operator có thể bỏ qua bước an toàn vì bước nguy hiểm lại ít cản hơn. Theory này đảo ngược trực giác đó: publish thật phải kế thừa và tôn trọng các gate mà preview đã phát hiện.

Dry-run cũng có giá trị epistemic: nó cho biết hệ thống biết gì và chưa biết gì trước khi chạm sang biên ngoài. Vì thế stale preview không chỉ là dữ liệu “cũ”, mà là bằng chứng đã mất hiệu lực.

## Boundaries

Theory này không quyết định:

- payload cụ thể cho hệ ngoài;
- schema journal hay queue;
- retry schedule;
- owner của canonical truth ở lõi.

Nó cũng không thay thế domain reasoning về mapping hay anomaly; nó chỉ khẳng định rằng các tín hiệu đó có thể trở thành gate hợp lệ cho external write.

## Tensions

- Safety mạnh làm chậm publish nhưng tăng niềm tin vận hành.
- Quá nhiều gate có thể làm operator mệt mỏi; quá ít gate làm hệ thống khó tin cậy.
- Preview quá chặt có thể giảm throughput; preview quá lỏng làm publish thành trò may rủi.

## Evolution

Theory này có thể tiến hóa khi project thay đổi loại external write, mức độ đảo ngược được của action, hoặc quality của pre-check. Nhưng nguyên tắc lõi vẫn giữ: publish thật phải dựa trên bằng chứng còn hiệu lực.

## Open questions

- Khi nào một stale window nên được coi là hết hạn cứng, khi nào chỉ là warning?
- Có loại external write nào đủ an toàn để cho phép guardrail nhẹ hơn mà không phá safety model chung?
