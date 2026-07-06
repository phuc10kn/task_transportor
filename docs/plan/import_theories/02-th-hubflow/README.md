# Phase 02 - TH-HUBFLOW

## Mục tiêu

Materialize theory cho product model lõi của app:

```text
System -> Core Hub -> System
```

Trong repo hiện tại, app-specific application của theory này là:

```text
System -> CIS -> System
```

Nhưng phase này phải giữ phần theory ở mức generic, không đóng cứng vào tên `CIS`.

## Inputs bắt buộc

- `docs/work/README.md`
- `docs/work/01-architecture.md`
- `docs/architecture/01-direction.md`
- `docs/architecture/05-flow-template.md`
- `docs/work/plans/README.md`
- `docs/business/workflows/*`
- `docs/explain/missing_theories.md`

## Làm trong phase này

- Tạo folder:
  - `docs_native_theory_app/theories/hub-mediated-integration/`
- Viết 4 file theory chuẩn.
- Map boundary semantics của `TH-HUBFLOW` theo root governance:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`
- Chốt các position cấp hub-flow, ví dụ:
  - không sync trực tiếp system-to-system bỏ qua core;
  - inbound phải vào core trước;
  - core không chỉ là pass-through cache;
  - outbound đi sau validation/readiness;
  - external adapter không sở hữu quyết định nghiệp vụ cuối.
- Ghi rõ trade-off:
  - tốc độ point-to-point;
  - độ kiểm soát của hub-mediated integration.
- Ghi rõ boundaries:
  - theory này không nói tên hub cụ thể;
  - không nói workflow thật của repo.

## Deliverables

- `docs_native_theory_app/theories/hub-mediated-integration/README.md`
- `docs_native_theory_app/theories/hub-mediated-integration/agent.md`
- `docs_native_theory_app/theories/hub-mediated-integration/theory.md`
- `docs_native_theory_app/theories/hub-mediated-integration/governance.md`
- Boundary contract của `TH-HUBFLOW` đã được encode trong theory group.

## Không làm trong phase này

- Không chốt schema của `CIS`.
- Không viết table ownership cụ thể.
- Không mô tả webhook endpoint cụ thể.
- Không viết dry-run mechanics cụ thể.

## Chốt chặn

Phase này đạt khi:

- đọc theory là hiểu vì sao app này không chọn point-to-point sync;
- đã tách được `hub-mediated integration` khỏi `modular architecture`;
- boundary semantics đã được encode rõ theo root governance;
- lý do tồn tại của core hub không còn phải sống rải rác trong `docs/work/*`.

Không qua phase 03 nếu:

- theory còn đóng cứng vào `CIS` như tên bắt buộc;
- theory mới vẫn chỉ là paraphrase của architecture direction;
- boundary semantics chưa được encode rõ theo root governance;
- chưa chốt rõ core hub khác gì “cache ở giữa”.

## Rủi ro chính

- Trộn `hub model` với `canonical state governance`.
- Trộn `hub model` với `safe outbound`.
- Viết theory quá gắn với `Backlog` và `Jira`.

## Checklist hoàn thành phase

- [ ] Folder `hub-mediated-integration/` đã tồn tại.
- [ ] Có đủ 4 file theory chuẩn.
- [ ] Đã chốt core positions cho mô hình hub-mediated.
- [ ] Đã có boundaries rõ giữa theory này và `TH-MODULAR`.
- [ ] Đã encode rõ `Owns / Excludes / Depends on / Typical impact areas`.
- [ ] Không còn phụ thuộc vào tên `CIS` trong phần pure theory.
