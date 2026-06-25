# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# workflow
- Answer in chat first; do not create/write files unless explicitly requested by the user. Confidence: 0.90

# architecture
- Name sync directions based on CIS as central hub: backlog_to_cis, jira_to_cis, cis_to_jira (not backlog_to_jira directly). Confidence: 0.70
- Use direction_from and direction_to fields instead of a single direction enum to avoid enum explosion. Confidence: 0.75

