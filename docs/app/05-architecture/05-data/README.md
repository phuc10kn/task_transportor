# Data

Concern này định nghĩa data taxonomy chuẩn cho custom modular monolith, không chỉ riêng flow.

## Entity type chuẩn

- [DataFlow](../../../meta/01-entity-types/05-architecture/05-data/data-flows/data-flow.md) *(canonical: docs/meta)*
- [OwnedAggregate](./owned-aggregates/owned-aggregate.md)
- [RawEventRecord](./raw-event-records/raw-event-record.md)
- [CanonicalModel](./canonical-models/canonical-model.md)
- [SnapshotBundle](./snapshot-bundles/snapshot-bundle.md)
- [ReadModel](./read-models/read-model.md)
- [MappingSet](./mapping-sets/mapping-set.md)
- [AuditRecord](./audit-records/audit-record.md)
- [FileAsset](./file-assets/file-asset.md)

## Codebase hiện tại đang dùng mạnh nhất

- Repo hiện tại có ngữ liệu rõ cho `OwnedAggregate`, `SnapshotBundle`, `MappingSet`, `AuditRecord`, `FileAsset`, `DataFlow`.
- `CanonicalModel` là type nền để biểu diễn shape dữ liệu nội bộ hội tụ của app, không chỉ owner state.
- `RawEventRecord` là type chuẩn của pattern; repo hiện tại đã có hướng tài liệu cho webhook/raw event nhưng Lite hiện tại chưa dùng mạnh.
- `ReadModel` đang có phiên bản nhẹ ở `Dashboard`.

## Data flow instances theo code hiện tại

- [DF-001-backlog-to-cis-canonicalization](./data-flows/DF-001-backlog-to-cis-canonicalization/README.md)
- [DF-002-cis-to-translation-review](./data-flows/DF-002-cis-to-translation-review/README.md)
- [DF-003-cis-to-jira-dry-run-preview](./data-flows/DF-003-cis-to-jira-dry-run-preview/README.md)
- [DF-004-cis-to-jira-sync-write](./data-flows/DF-004-cis-to-jira-sync-write/README.md)
