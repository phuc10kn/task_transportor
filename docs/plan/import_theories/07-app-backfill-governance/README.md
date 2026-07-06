# Phase 07 - App backfill và governance

## Mục tiêu

Backfill theory routing vào toàn bộ app docs sau khi đã có đủ 6 theory core.

Đây là phase biến theory system từ “đã viết” thành “đang được dùng”.

## Inputs bắt buộc

- Toàn bộ 6 theory folder đã materialize ở các phase trước
- `docs_native_theory_app/theories/README.md`
- `docs_native_theory_app/theories/governance.md`
- `docs_native_theory_app/app/README.md`
- `docs_native_theory_app/app/00-context` đến `app/10-decisions`
- `docs/explain/missing_theories.md`

## Làm trong phase này

- Cập nhật `docs_native_theory_app/theories/README.md` thành root theory index thật.
- Giữ `docs_native_theory_app/theories/governance.md` như root governance thật và bảo đảm root index ref đúng sang nó.
- Bổ sung `Quan hệ với Theory` hoặc section tương đương vào README các layer chính:
  - `app/00-context/README.md`
  - `app/01-business/README.md`
  - `app/02-product/README.md`
  - `app/04-domain/README.md`
  - `app/05-architecture/README.md`
  - `app/06-technical/README.md`
  - `app/07-implementation/README.md`
  - `app/08-quality/README.md`
  - `app/09-operation/README.md`
  - `app/10-decisions/README.md`
- Rà soát `theory_basis` của các entity instance quan trọng để tránh orphan reference.
- Chuẩn hóa terminology:
  - canonical
  - hub/core
  - owner
  - dry-run
  - review
  - job/journal/audit
- Ghi các challenge/open question còn tồn tại vào `governance.md` của theory tương ứng.
- Đảm bảo root governance nói rõ khi nào vấn đề phải ở root governance, khi nào phải rơi vào `governance.md` của từng theory group.
- Nếu phát hiện tension chưa giải được, tạo note hoặc decision thay vì sửa nghĩa ngầm.

## Deliverables

- Root theory index usable trong `docs_native_theory_app/theories/README.md`
- Root theory governance usable trong `docs_native_theory_app/theories/governance.md`
- Status của active theory set trong root index đã phản ánh đúng folder nào còn `planned`, folder nào đã materialized
- Quy tắc phân luồng governance giữa root và từng theory group đã được viết rõ
- README các layer chính có theory routing
- `app-layer theory map` được phản ánh lại vào docs app
- `theory_basis` của entity chính không còn mồ côi
- Các challenge/governance entry ban đầu đã được seed

## Ưu tiên backfill theo thứ tự

1. `05-architecture`
2. `00-context`
3. `01-business`
4. `02-product`
5. `04-domain`
6. `06-technical`
7. `07-implementation`
8. `08-quality`
9. `09-operation`
10. `10-decisions`
11. `03-ui` nếu thật sự cần

## Chốt chặn

Phase này đạt khi:

- người đọc từ app docs có thể lần ngược về theory đúng;
- root theory index đã usable như entry point thật;
- root theory governance đã visible và được ref đúng từ root index;
- active theory status trong root index không còn lệch với folder đã materialize;
- đã có rule rõ để biết vấn đề nào phải vào root governance và vấn đề nào phải vào `governance.md` của từng theory group;
- không còn tình trạng `theory_basis` chỉ là ID treo không có theory home;
- app docs không còn phải giữ những reasoning dài vốn nên ở theory.

## Không coi là xong nếu

- mới chỉ tạo theory folder nhưng app docs chưa route về đó;
- root theory index chưa usable;
- root theory governance chưa được wire hoặc chưa được ref từ root index;
- active theory status vẫn báo `planned` cho folder đã materialize xong;
- chưa có rule rõ phân biệt root governance với governance của từng theory group;
- `theory_basis` trỏ tới ID chưa có hoặc dùng không nhất quán;
- README layer vẫn chỉ nói app-specific detail mà không nói nền theory nào đang dẫn.

## Rủi ro chính

- Backfill quá rộng nhưng không có ưu tiên.
- Thêm `theory_basis` hàng loạt mà không có semantic review.
- Route sai theory home cho một số layer, nhất là `04-domain`, `06-technical`, `09-operation`.

## Checklist hoàn thành phase

- [ ] Root theory index đã được cập nhật.
- [ ] Root theory governance đã được wire và được ref từ root theory index.
- [ ] Status của active theory set trong root index đã được cập nhật theo trạng thái materialization thật.
- [ ] Đã có rule rõ phân biệt nội dung thuộc root governance và nội dung thuộc `governance.md` của từng theory group.
- [ ] `05-architecture` đã có section theory routing rõ.
- [ ] Các layer chính đã có section `Quan hệ với Theory`.
- [ ] `theory_basis` của entity quan trọng đã được rà soát.
- [ ] Các challenge/open question đầu tiên đã được seed vào governance phù hợp.
- [ ] Từ `app/*` có thể lần ngược về theory home mà không cần suy luận tay.
