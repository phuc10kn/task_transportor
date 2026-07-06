# Kế hoạch import theories

## Mục tiêu

Folder này chia kế hoạch `fill theory cho toàn bộ app` thành từng phase có chốt chặn rõ ràng.

Mục tiêu không phải chỉ tạo folder theory cho đẹp, mà là:

- materialize theory thành source thật trong `docs_native_theory_app/theories/`;
- route lại `app/00` đến `app/10` về đúng theory home;
- tách rõ `Pure Theory` khỏi `app-specific application`;
- để về sau agent và người đọc không phải suy luận lại từ docs phân mảnh.

Nguồn định hướng chính:

- [missing_theories.md](../../explain/missing_theories.md)
- [custom_modular_monolith.md](../../explain/custom_modular_monolith.md)
- `docs_native_theory_app/theories/governance.md`

## Nguyên tắc triển khai

- Mỗi phase chỉ chốt một nhóm theory hoặc một nhóm công việc có cohesion rõ.
- Chưa backfill rộng toàn app nếu theory đó chưa có `README.md`, `agent.md`, `theory.md`, `governance.md`.
- Không nhét source tree, endpoint, schema cụ thể vào theory.
- Mọi app-specific adoption phải sống ở `docs_native_theory_app/app/*`.
- `docs_native_theory_app/theories/governance.md` là canonical governance của toàn theory system; plan này chỉ mô tả thứ tự thi công và chốt chặn, không giữ bản sao rule lâu dài.
- Mọi theory mới phải có:
  - stable ID hoặc ID family rõ;
  - scope rõ;
  - boundaries rõ;
  - tensions hoặc open questions tối thiểu;
  - rule khi nào đọc `agent.md`, khi nào đọc `theory.md`.
- Mọi theory group materialize ở phase 01-06 phải tự khai báo được 4 trường boundary semantics:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`

## Thứ tự phase

1. [00-theory-foundation](./00-theory-foundation/README.md)
2. [01-th-modular](./01-th-modular/README.md)
3. [02-th-hubflow](./02-th-hubflow/README.md)
4. [03-th-canon](./03-th-canon/README.md)
5. [04-th-ai-gov](./04-th-ai-gov/README.md)
6. [05-th-sync-safe](./05-th-sync-safe/README.md)
7. [06-th-ops-trace](./06-th-ops-trace/README.md)
8. [07-app-backfill-governance](./07-app-backfill-governance/README.md)

## Chốt chặn tổng

| Sau phase | Phải đạt | Nếu chưa đạt thì chưa qua phase sau |
| --- | --- | --- |
| 00 | Chốt taxonomy, slug, ID family, root index strategy, root governance, boundary matrix, migration rules | Không tạo theory folder hàng loạt |
| 01 | `TH-MODULAR` hoàn chỉnh 4 file và đã encode boundary semantics | Không backfill `05-architecture` |
| 02 | `TH-HUBFLOW` hoàn chỉnh 4 file và đã encode boundary semantics | Không route `00-context`, `01-business`, `02-product` theo hub model |
| 03 | `TH-CANON` hoàn chỉnh 4 file và đã encode boundary semantics | Không route domain/canonical/state docs |
| 04 | `TH-AI-GOV` hoàn chỉnh 4 file và đã encode boundary semantics | Không route Translation/AI docs |
| 05 | `TH-SYNC-SAFE` hoàn chỉnh 4 file và đã encode boundary semantics | Không route dry-run/sync safety docs |
| 06 | `TH-OPS-TRACE` hoàn chỉnh 4 file và đã encode boundary semantics | Không route jobs/journal/audit/operation docs |
| 07 | Root theory index + app backfill + governance hooks xong | Chưa coi theory system là usable |

## Deliverable cuối cùng của toàn kế hoạch

- `docs_native_theory_app/theories/README.md` trở thành root theory index thật.
- `docs_native_theory_app/theories/governance.md` trở thành root governance thật của theory system.
- Có đủ 6 theory folder active:
  - `modular-architecture`
  - `hub-mediated-integration`
  - `canonical-state-governance`
  - `human-governed-ai-assistance`
  - `safe-external-synchronization`
  - `recoverable-operations`
- `docs_native_theory_app/app/00` đến `app/10` có routing theory nhất quán ở các README chính.
- `theory_basis` trong các entity quan trọng không còn mồ côi.

## Ghi chú scope

- Kế hoạch này là kế hoạch tài liệu và knowledge architecture.
- Không giả định phải sửa code ứng dụng trong các phase này.
- Nếu trong quá trình backfill phát hiện theory mâu thuẫn với code hoặc docs hiện có, phải mở `NOTE-CONFLICT` hoặc `Decision` thay vì lặng lẽ đổi nghĩa.
