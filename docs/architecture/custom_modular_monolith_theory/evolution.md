# Evolution

Custom modular monolith nên giúp một sản phẩm đi qua nhiều giai đoạn mà không phải rewrite kiến trúc từ đầu.

## Giai đoạn đầu

- Một runtime chính.
- Một application database.
- Boundary rõ giữa các domain.
- Read exception ít và có kiểm soát.

## Giai đoạn vận hành rộng hơn

- Thêm webhook, scheduler hoặc worker chuyên trách.
- Thêm reporting, projection hoặc read model nếu cần.
- Tăng mức strict ở những chỗ coupling lặp lại.

## Giai đoạn scale hoặc tách rời

- Tách worker.
- Tách read model.
- Tách database boundary.
- Cuối cùng mới cân nhắc extract module thành service khi có trigger thật.

## Trigger để strict hơn

- Nhiều team hoặc nhiều runtime độc lập.
- Schema coupling gây lỗi lặp lại.
- Nhu cầu scale hoặc deploy độc lập rõ ràng.
- Reporting phức tạp cần projection riêng.
