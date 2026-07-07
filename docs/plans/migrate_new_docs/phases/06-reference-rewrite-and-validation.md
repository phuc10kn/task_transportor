# Phase 06 - Sửa tham chiếu và kiểm chứng

## Mục tiêu

Phase này xóa dependency đọc `docs_legacy/` khỏi `docs/` và kiểm tra docs mới tự đứng được.

Đây là phase dọn link và kiểm chứng. Không nhập thêm nội dung lớn trừ khi phát hiện thiếu sót nhỏ bắt buộc.

## Inputs bắt buộc

- Toàn bộ `docs/`
- `docs/plans/migrate_new_docs/migration_matrix.md`
- `docs/plans/migrate_new_docs/final_migration_report.md`
- `AGENTS.md`
- `docs/README.md`
- `docs/AGENT_SKILLS/**`
- `docs/meta/**`

## Loại reference cần xử lý

| Pattern | Cách xử lý |
| --- | --- |
| `docs_legacy/...` | Thay bằng home mới trong `docs/`, hoặc giữ tạm có lý do |
| `docs/work`, `docs/architecture` | Sai sau rename, phải thay bằng home mới hoặc legacy provenance |
| `docs_native_theory_app` | Sai root cũ, phải xóa hết |
| `docs/meta/relation-types` | Đổi thành `docs/meta/02-relation-types` |
| `docs/meta/rules` | Đổi thành `docs/meta/03-rules` |
| `docs/plan/import_theories` | Đổi sang plan mới hoặc xóa nếu chỉ là history |

## Việc cần làm

1. Quét toàn bộ `docs/` và `AGENTS.md`.
2. Rewrite reference còn sống sang home mới.
3. Xóa reference đến legacy file đã `superseded` hoặc `discard`.
4. Giữ `docs_legacy/...` chỉ khi có status `keep-temporary` và deadline.
5. Kiểm tra `AGENT_SKILLS` có trỏ đúng `docs/`.
6. Kiểm tra `meta` path đã đúng số thứ tự folder.
7. Kiểm tra `theory_basis` không orphan.
8. Kiểm tra markdown link nội bộ có trỏ tới file/folder tồn tại.
9. Kiểm tra README/index không orphan ở các vùng chính.
10. Lập reference report cuối phase và ghi phần reference còn lại vào `final_migration_report.md`.

## Verification commands

```powershell
rg -n "docs_legacy" docs AGENTS.md
rg -n "docs/work|docs/architecture|docs_native_theory_app|docs/plan/import_theories" docs AGENTS.md
rg -n "docs/meta/relation-types|docs/meta/rules" docs
rg -n "theory_basis:" docs/app
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]+\|[^|]+\|[^|]+\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
$root = (Resolve-Path .).Path
$broken = @()
Get-ChildItem docs -Recurse -File -Filter *.md | ForEach-Object {
  $source = $_.FullName
  $dir = Split-Path $source
  $text = Get-Content -Raw $source
  [regex]::Matches($text, '\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)') | ForEach-Object {
    $target = $_.Groups[1].Value
    if ($target -match '^[a-z]+:' -or $target.StartsWith('#')) { return }
    $path = Join-Path $dir $target
    if (-not (Test-Path $path)) {
      $broken += [pscustomobject]@{ Source = $source.Substring($root.Length + 1); Target = $target }
    }
  }
}
$broken
if ($broken.Count -gt 0) { throw "Broken markdown links found" }
```

## Deliverables

- Reference report.
- Danh sách reference legacy còn lại kèm lý do.
- Danh sách orphan hoặc ambiguous `theory_basis` nếu có.
- Danh sách broken markdown links hoặc path text không tồn tại.
- `final_migration_report.md` có phần reference còn lại.
- `AGENTS.md` sẵn sàng dùng `docs/` làm source chính.
- Root docs không còn hướng người đọc vào path chết.

## Câu hỏi review

- Reference legacy còn lại là provenance hay dependency đọc thật?
- Có path nào tồn tại về mặt text nhưng không tồn tại trên filesystem không?
- Agent skill nào còn hướng người đọc vào cấu trúc cũ?
- `AGENTS.md` có còn yêu cầu đọc legacy để code không?
- Link markdown nội bộ có trỏ tới path tồn tại thật không?
- Có README/index nào còn trỏ vào vùng đã rename/xóa không?

## Chốt chặn

Phase đạt khi:

- `docs/` không còn cần legacy để đọc tiếp;
- mọi `docs_legacy` reference còn lại có status và deadline;
- không còn reference path cũ không tồn tại;
- không còn broken markdown link nội bộ chưa có lý do;
- `AGENTS.md` không còn yêu cầu legacy cho công việc thường ngày.

## Không coi là xong nếu

- search vẫn còn `docs_legacy` mà không có lý do;
- root README vẫn gọi legacy là reading path;
- AGENT_SKILLS hướng agent sang legacy hoặc path cũ;
- theory_basis trỏ tới ID không có theory home.
- markdown link nội bộ broken nhưng chưa có report.

## Checklist nghiệm thu

- [x] Đã quét toàn bộ `docs/` và `AGENTS.md` theo verification commands.
- [x] Không còn reference `docs_native_theory_app`.
- [x] Không còn reference sai tới `docs/work` hoặc `docs/architecture`.
- [x] Không còn reference sai tới `docs/meta/relation-types` hoặc `docs/meta/rules`.
- [x] Mọi reference `docs_legacy` còn lại đều có lý do, owner phase và deadline.
- [x] `AGENT_SKILLS` đã trỏ đúng root `docs/`.
- [x] `docs/README.md` không còn gọi legacy là reading path thường ngày.
- [x] `theory_basis` chính không có orphan theory home.
- [x] Markdown link nội bộ đã được kiểm tra và broken links đã được sửa hoặc ghi report.
- [x] README/index chính không còn trỏ vào path cũ.
- [x] Reference report đã được tạo.
- [x] `final_migration_report.md` đã được cập nhật phần reference còn lại.
- [x] Người review đã xác nhận phase 06 đạt chốt chặn.

## Verification result

- Broken markdown links: 0.
- Orphan theory IDs: 0.
- Open matrix rows: 0.
- Old root/path refs outside migration plan: 0.
- Old meta path refs outside migration plan: 0.
- Phase 06 `docs_legacy` refs before cutover are listed in `reference_report.md` with reason, owner phase and deadline.

## Output report tối thiểu

```text
Legacy references before Phase 07 cutover:
- path:
- reason:
- owner phase:
- deadline:

Broken references:
- path:
- fix:

Broken markdown links:
- source:
- target:
- fix:

Orphan theory IDs:
- id:
- referenced by:
- action:
```
