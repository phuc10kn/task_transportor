# Executor Thực Thi Plan

> Bắt buộc đọc và tuân thủ [structure-rules.md](./structure-rules.md) trước khi thực thi.

## Mục đích

Prompt này dùng khi plan đã chốt và current phase đã được mở rõ để thực hiện thật.

Nếu current phase chưa rõ, cần resume nhiều phase hoặc đang blocked ở tầng điều phối, quay về [coordinator.md](./coordinator.md) trước.

## Thông báo bắt buộc trước khi thực thi

Sau khi đọc plan, current phase, dependency và target files/artifacts nhưng trước khi sửa, verify phase hoặc tick checklist, phải in một dòng trong `commentary`:

```text
Đang dùng executor.md — current phase <phase-id> — lý do: phase đã mở, dependency pass và target artifacts đã rõ.
```

Nếu chưa đủ điều kiện executor, không được in dòng này; phải chuyển về `coordinator.md` hoặc `planner.md` theo đúng trạng thái.

## Khi nên dùng

Dùng file này khi:

- đã có plan directory cụ thể;
- current phase đã rõ;
- cần sửa, verify hoặc kết luận no-change theo phase;
- cần tick checklist của phase;
- cần cập nhật `Kết quả thực hiện`.

Không dùng file này khi:

- plan còn đang tranh luận;
- source of truth chưa chốt;
- current phase còn mơ hồ;
- cần quyết định phase nào được mở tiếp.

## Quy tắc thực thi

### 1. Đọc trước khi sửa

Ít nhất phải đọc:

- root `README.md`, `00-overview.md`, phase table trong root và current phase file;
- `structure-rules.md` và `<plan-dir>/02-coordination.md`;
- phase id ổn định của current phase;
- target files/artifacts của current phase;
- `Kết quả thực hiện` của current phase;
- `<plan-dir>/02-coordination.md > ## Quy ước điều phối > ### Handoff hiện tại`;
- source of truth mà phase chỉ ra;
- file hoặc artifact đích sắp sửa/verify.

### 2. Chỉ làm trong current phase

Không được:

- tự mở phase mới;
- cleanup lan sang deferred;
- sửa hoặc verify file ngoài scope chỉ vì tiện tay.

Nếu thấy dependency sai hoặc current phase không còn rõ, dừng và quay về `coordinator.md`.

### 3. Tick checklist có kỷ luật

Chỉ tick khi:

- nội dung tương ứng đã được sửa hoặc verify thật;
- acceptance của item đã pass;
- không còn ambiguity lớn ở item đó.

Item `Manual check (Người review tại HG-xx)` chỉ được tick sau khi user xác nhận rõ gate tương ứng đã pass. Automated browser test, screenshot hoặc suy đoán của agent không thay thế xác nhận này. Sau xác nhận, executor được tick các manual item thuộc bundle của gate dù chúng nằm trong phase trước; đây là ngoại lệ duy nhất cho checklist ngoài current phase và không cho phép sửa implementation ngoài current phase.

Trước khi kết luận phase đã pass, phải lập ma trận `checklist item -> test/verifier/evidence` cho từng item tự động chưa tick. Mỗi item phải có ít nhất một assertion hoặc lệnh verify bao phủ đúng hành vi (bao gồm negative/error, isolation, stale và timeout nếu checklist nêu rõ). Item tự động không có evidence là blocker: phải bổ sung test/fix rồi chạy lại, không được tick theo suy đoán hoặc chỉ vì một suite tổng thể màu xanh.

Không tick khi:

- mới thảo luận;
- mới dự định làm;
- file chưa sửa nhưng "có vẻ đúng";
- item còn là deferred.

### 4. Ghi `Kết quả thực hiện`

Sau khi hoàn tất một phần việc của phase, ghi vào `Kết quả thực hiện` bằng đúng các format:

- `No-change: <path> - <lý do ngắn>`
- `Fix tối thiểu: <path> - <phạm vi ngắn>`
- `In-progress: <phase id> - <đã xong> | Next: <việc tiếp theo>`

`In-progress` là format bắt buộc khi bị dừng giữa phase hoặc phải handoff giữa chừng.

`No-change` dùng cho phase review-only, verify-only hoặc khi artifact đã đúng acceptance. Không sửa file chỉ để tạo diff.

### 5. Nếu bị ngắt giữa phase

Trước khi dừng, phải làm đủ 3 việc:

1. Không tick item chưa hoàn tất.
2. Ghi `In-progress` vào `Kết quả thực hiện` của phase hiện tại.
3. Cập nhật `<plan-dir>/02-coordination.md > ## Quy ước điều phối > ### Handoff hiện tại` để lượt sau resume đúng điểm.

Executor chỉ được ghi handoff khi bị ngắt giữa phase hoặc cần dừng vì blocker trong lúc làm. Các cập nhật handoff điều phối bình thường thuộc về `coordinator.md`.

Phase kết thúc tại Human Gate được xem là planned interruption: sau automated pass, executor phải để manual item chưa tick, ghi `In-progress: <phase id> - automated gate pass | Next: chờ <HG-id>`, cập nhật handoff `Next` bằng checklist/URL review và dừng. Không ghi trạng thái blocked nếu chỉ đang chờ user.

Sau khi user xác nhận gate pass, executor phải tick đúng các manual item của bundle, xóa marker `In-progress ... chờ <HG-id>` đã hết hiệu lực và ghi `Fix tối thiểu: <phase-file> - ghi nhận <HG-id> đã được user xác nhận`. Sau đó dừng để coordinator chuyển phase; không để marker `In-progress` cũ khiến phase bị chọn lại.

Nếu user báo lỗi tại gate, executor/coordinator xác định phase sở hữu sớm nhất trong bundle. Executor được phép cập nhật plan metadata ngoài current phase để invalidate evidence downstream: bỏ tick automated/manual items bị ảnh hưởng từ phase sở hữu đến phase cuối bundle và ghi marker `In-progress` cho việc rerun. Implementation vẫn chỉ được sửa trong current owning phase. Các phase downstream phải được rerun tuần tự trước khi trình lại gate.

### 6. Nếu blocked trong lúc làm

Nếu blocked thật:

- không âm thầm mở rộng scope;
- cập nhật `<plan-dir>/02-coordination.md > ## Quy ước điều phối > ### Trạng thái blocked` bằng format `Blocked: <phase id> - <blocker ngắn>`;
- dừng và báo lại.

## Prompt mẫu

```text
Bạn sẽ thực thi plan tại:
<plan-dir>

Task thực tế:
<mô tả task>

Yêu cầu bắt buộc:

1. Đọc kỹ plan trước khi sửa, verify hoặc kết luận no-change.
2. Đọc lại source of truth của current phase trước khi triển khai.
3. Xác định phase id và target files/artifacts trước khi làm.
4. Chỉ làm trong current phase, không nhảy scope.
5. Chỉ tick checklist khi đã làm hoặc verify thật.
6. Cập nhật `Kết quả thực hiện` bằng đúng format canonical.
7. Nếu phase là review-only hoặc verify-only, dùng `No-change` khi artifact đã pass.
8. Nếu bị ngắt giữa phase, phải ghi `In-progress` và cập nhật handoff note trước khi dừng.
9. Nếu current phase không còn rõ hoặc dependency sai, dừng và quay về `coordinator.md`.
10. Nếu phát hiện mâu thuẫn ngoài scope, báo lại thay vì âm thầm sửa lan.
11. Không tạo folder/file ngoài cây `structure-rules.md`.
12. Nếu current phase kết thúc bằng Human Gate, chuẩn bị local/test URL + deterministic scenario, dừng chờ user và không tự mở phase kế tiếp.
13. Chỉ tick manual items của Human Gate sau explicit user confirmation; nếu user báo lỗi, giữ/reopen phase sở hữu behavior và rerun gate liên quan.

Đầu ra mong muốn:

- file/artifact thực tế được sửa, verify hoặc kết luận no-change đúng phase;
- plan được cập nhật checklist và `Kết quả thực hiện`;
- phản hồi cuối nêu phase đã làm, file đã đổi, checklist đã tick và phần còn defer.
```

## Checklist tự review sau khi làm

- [ ] Chỉ sửa hoặc verify artifact trong scope phase.
- [ ] Cây plan vẫn đúng `structure-rules.md`.
- [ ] Phase id và target files/artifacts đã được xác nhận trước khi làm.
- [ ] Đã cập nhật `Kết quả thực hiện`.
- [ ] Đã tick đúng checklist phase tương ứng.
- [ ] Chưa tick deferred item.
- [ ] Manual check chỉ được tick khi có explicit user confirmation cho đúng Human Gate.
- [ ] Nếu từng bị ngắt giữa phase, đã để lại `In-progress` và handoff note.
- [ ] Không tạo drift giữa plan và file thật.

## Anti-patterns

Không thực thi theo các kiểu sau:

- phase chưa mở nhưng vẫn sửa trước;
- tick checklist rồi mới đi làm;
- sửa file chỉ để tránh dùng `No-change`;
- bị ngắt giữa phase nhưng không để lại trace;
- gặp blocker rồi tự nới scope để vượt qua;
- ghi log mơ hồ như "đã xem", "tạm ổn", "xử lý rồi".

## Prompt liên quan

- Tạo hoặc sửa plan: [planner.md](./planner.md)
- Chọn current phase hoặc resume: [coordinator.md](./coordinator.md)

## Mẫu báo cáo cuối

```text
Đã triển khai theo plan tại <plan-dir>.

Phase đã xong:
- ...

Checklist đã tick:
- ...

File/artifact đã đổi hoặc verify:
- ...

Chưa làm / deferred:
- ...

Rủi ro còn lại:
- ...
```
