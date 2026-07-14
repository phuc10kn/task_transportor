---
schema: entity-instance/v1
id: SO-007
slug: translation-glossary-state
title: Translation Glossary State
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
summary: Project-scoped glossary concepts and language terms dùng để tạo translation context.
theory_basis:
  - TH-MOD-01
  - TH-AI-GOV-01
---
# SO-007 - Translation Glossary State

## Summary

Project-scoped glossary concepts và các canonical/variant term theo language code, được dùng để tạo context dịch.

## Meaning

SO-007 là source of truth cho glossary normalized của từng Project. Một concept có group, concept key, note và danh sách term động; mỗi language có đúng một canonical, runtime quét cả variants ở source và chỉ lấy canonical ở target khi có đủ cặp ngôn ngữ đang dịch.

## Owner

`Translation` (`MOD-003`)

## Reason

Glossary phục vụ trực tiếp translation context và CRUD; Projects chỉ sở hữu identity, language config và integration config, không còn lưu glossary.

## Write policy

- Translation ghi aggregate concept và terms qua public glossary API trong transaction.
- Project Config không nhận hoặc ghi `translation_glossary_json`.
- Runtime đọc source/target pair tại execution time; draft đã tạo không tự thay đổi.

## Consumers

- Translation runtime context.
- Admin Translation Glossary UI.
- Translation worker khi tạo draft.

## Why this state is central

Ownership riêng ngăn Projects trở thành nguồn glossary thứ hai và giữ contract đa ngôn ngữ không phụ thuộc cột cố định.

## What belongs to this state

`translation_glossary_concepts`, `translation_glossary_terms`, aggregate CRUD và runtime lookup theo Project/language pair.

## What does not belong here

Translation queue review outcome, canonical issue state, Project credentials và AI transport protocol.

## Architectural implications

Module khác chỉ dùng Translation public API hoặc runtime capability; không import repository glossary trực tiếp và không tạo relation shared ownership qua `DF-002`.

## Relations

SO-007 được sở hữu trực tiếp bởi MOD-003. Không có relation `shared_via` tới DF-002.

## Evidence

- `src/modules/Translation/infrastructure/TranslationGlossaryRepository.js`
- `src/modules/Translation/http/controllers/TranslationGlossaryController.js`
- `src/modules/Translation/application/collectTranslationContext.js`
- `src/db/migrations/015_translation_glossary_tables.sql`, `src/db/migrations/016_translation_glossary_term_variants.sql`

## Validation Notes

- Instance được tạo sau khi type contract gate pass.
- Relation canonical duy nhất của state owner này là `MOD-003 --owns--> SO-007`.
