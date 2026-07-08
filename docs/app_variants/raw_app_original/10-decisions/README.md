# 10 - Decisions

`10-decisions/` lưu các quyết định quan trọng còn hiệu lực, phương án đã cân nhắc và quyết định đã bị thay thế.

Layer này trả lời:

- quyết định nào đang còn hiệu lực;
- alternative nào đã được cân nhắc;
- review trigger hay lifecycle nào áp dụng cho decision.

## Concern Canonical

- `01-decision-making/01-decisions/`
- `01-decision-making/02-alternatives/`
- `02-lifecycle/superseded/`

## Universal Boundary

Decision là layer cross-cutting. Nó không mặc định thuộc riêng business, product, architecture hay technical vì một quyết định có thể ảnh hưởng nhiều layer cùng lúc.

Layer này không giữ:

- theory reasoning đầy đủ của theory home;
- implementation detail dài;
- current project truth của layer khác nếu không liên quan trực tiếp đến quyết định.

## Provenance

- Extraction ID: `EXTRACT-10-decision-model`
- Source app path: `docs/app/10-decisions/README.md`
