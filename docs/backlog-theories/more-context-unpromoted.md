# Unpromoted Content From Former `docs/more_context.md`

## Mục đích

File này giữ phần chưa nên promote trực tiếp từ `docs/more_context.md` trước khi file gốc bị loại bỏ.

Nội dung ở đây là backlog/candidate, không phải canonical.

## Candidate: core/supporting reading priority

Ý tưởng:

```text
core/supporting = reading priority hint
```

Không phải schema canonical.

Ví dụ từ business layer:

| Tier | Entity | Relation |
| --- | --- | --- |
| core | Problem, Goal, Process, BusinessRule | motivates, leads_to, governed_by, participates_in |
| supporting | Stakeholder, Scenario, Policy, Metric, SuccessCriterion | part_of, composes, measured_by, validates |

Rule an toàn nếu sau này promote:

```text
03-rules/valid-triples > reading priority hint
```

Agent không được bỏ qua supporting entity nếu nó nằm trên valid trace path.

## Candidate: gap assessment

Các gap từng được ghi nhận:

- Folder rule vs thực tế chưa hoàn toàn nhất quán.
- Có nguy cơ trùng vai trò giữa `03-rules/<layer>/` và `03-rules/cross-layer/`.
- Layer `05-09` chưa có valid triple đầy đủ như `00-04`.
- Containment relation có thể overlap: `part_of`, `contains`, `contained_in`, `composed_of`.
- README prose đôi khi không dùng canonical relation/entity names.

Không promote trực tiếp vì cần validation riêng trên repo hiện tại.

## Candidate: business layer snapshot

Snapshot cũ:

```text
6 concern -> 10 entity types -> 19 valid triple
```

Cầu nối minimum viable từng được đề xuất:

```text
Problem       --leads_to-->       BusinessRequirement
Process       --informs-->        UseCase
Stakeholder   --may_map_to-->     Persona
BusinessRule  --may_refine_to-->  Invariant
```

Không dùng như số liệu canonical vì có thể stale.

## Candidate: external references

Các nguồn này chỉ là backlog tham khảo. Nếu một nguồn thật sự ảnh hưởng theory, cần verify lại link và ghi vào `docs/theories/<theory>/governance.md`.

| Chủ đề | Nguồn/từ khóa |
| --- | --- |
| Knowledge graph | `kg-book.com`, DOI `10.1007/978-3-031-01918-0` |
| RDF triple | `RDF 1.1 Concepts W3C` |
| OWL types/properties | `OWL 2 Primer W3C` |
| SHACL validation | `SHACL W3C` |
| Tuple/direction | `Zanzibar USENIX Pang` |
| Text to knowledge graph | `Building Knowledge Graphs Practitioner` |
| Edge modeling | `Neo4j data modeling` |
| Layer topology | `C4 model`, `arc42` |
| Requirements traceability | `ISO 29148 extuitive`, `ReqView ISO 29148 templates` |
| Requirements/domain notation | `OMG SysML`, `OMG BPMN`, `DDD Reference Evans PDF` |
| Progressive disclosure/docs structure | `Diátaxis`, `progressive disclosure` |
| Graph path walking | `NetworkX documentation` |

Không giữ trạng thái "link verified" ở đây. Link phải được kiểm tra lại tại thời điểm sử dụng.

