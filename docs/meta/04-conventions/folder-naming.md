# Folder Naming

## Rule

```text
kebab-case
```

## Ví dụ đúng

```text
entity-types
relation-types
cross-cutting
release-readiness
business-requirements
```

## Ví dụ sai

```text
entity_types      (snake_case)
EntityTypes       (PascalCase)
businessRules     (camelCase)
```

## Numbering

Thêm prefix số khi có thứ tự đọc hoặc dependency:

```text
01-entity-types/
02-relation-types/
01-overview/
01-discovery/
```

Không thêm số cho collection ngang hàng (theory slugs, entity instances).

## Instance folder

```text
{PREFIX}-{NNN}-{slug}/
└── README.md
```

`{PREFIX}-{NNN}` là frontmatter `id`; `{slug}` là frontmatter `slug`. Folder = `id` + `-` + `slug`. Xem [id-conventions.md](id-conventions.md).