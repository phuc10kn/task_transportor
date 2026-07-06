# Update Policy

## Khi nào phải cập nhật docs business

Cập nhật là bắt buộc khi thay đổi làm một trong các ý sau không còn đúng:

- actor nào được quyền thao tác;
- workflow vận hành hiện tại đi theo bước nào;
- điều kiện nào cho phép sync hoặc buộc phải chặn;
- trạng thái nào biểu thị object đang ready, blocked hay failed;
- integration nào đang đóng vai trò nguồn, đích hoặc hub;
- quyết định business nào đã bị thay thế.

## Thứ tự cập nhật đề xuất

1. Chốt thay đổi ở `docs/work/*` hoặc spec làm nguồn quyết định.
2. Cập nhật `docs/business/usecases/*` nếu outcome nghiệp vụ thay đổi.
3. Cập nhật `docs/business/workflows/*` nếu cách vận hành thật thay đổi.
4. Cập nhật `docs/business/rules/*` và `docs/business/states/*` nếu policy hoặc lifecycle đổi.
5. Cập nhật `docs/business/entities/*`, `integrations/*`, `examples/*` nếu cần giải thích lại đối tượng hoặc case mẫu.
6. Ghi vào `docs/business/decisions/business-decisions.md` nếu đây là quyết định đã chốt, không chỉ là thử nghiệm.

## Nguyên tắc cập nhật

- Ưu tiên sửa file hiện có trước khi tạo file mới nếu vẫn cùng một chủ đề.
- Một file workflow chỉ nên mô tả một luồng vận hành rõ ràng.
- Một file use case nên nói theo outcome, không mô tả chi tiết bước kỹ thuật.
- Nếu có mâu thuẫn, `docs/work/*` và quyết định mới được chốt là đầu vào để cập nhật lại `docs/business/*`, không phải ngược lại.
- Không nhét chi tiết code, module boundary hoặc tên class vào layer business.

## Chu kỳ review đề xuất

- Review nhanh theo mỗi pull request có ảnh hưởng business.
- Review tổng thể theo mỗi phase lớn hoặc khi đóng một milestone vận hành.
- Review onboarding định kỳ để phát hiện file nào người mới đọc vẫn khó hiểu hoặc thiếu case.
