const MAPPING_CATALOG = [
  {
    key: "issue_type",
    label: "Issue type",
    required_for_jira: true,
    source_systems: ["backlog", "jira"],
    target_systems: ["jira", "backlog"],
    cis_values: [
      { value: "bug", label: "Bug" },
      { value: "task", label: "Task" },
      { value: "feature", label: "Feature" },
      { value: "question", label: "Question" },
    ],
    allows_custom_cis_value: true,
  },
  {
    key: "status",
    label: "Status",
    required_for_jira: true,
    source_systems: ["backlog", "jira"],
    target_systems: ["jira", "backlog"],
    cis_values: [
      { value: "open", label: "Open" },
      { value: "in_progress", label: "In progress" },
      { value: "review", label: "Review" },
      { value: "done", label: "Done" },
    ],
    allows_custom_cis_value: true,
  },
  {
    key: "priority",
    label: "Priority",
    required_for_jira: true,
    source_systems: ["backlog", "jira"],
    target_systems: ["jira", "backlog"],
    cis_values: [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
    allows_custom_cis_value: true,
  },
  {
    key: "user",
    label: "Project user",
    required_for_jira: false,
    source_systems: ["backlog", "jira"],
    target_systems: ["jira", "backlog"],
    cis_values: [],
    allows_custom_cis_value: true,
  },
  {
    key: "component",
    label: "Component/category",
    required_for_jira: false,
    source_systems: ["backlog", "jira"],
    target_systems: ["jira", "backlog"],
    cis_values: [],
    allows_custom_cis_value: true,
  },
];

const SYSTEMS = [
  { value: "backlog", label: "Backlog" },
  { value: "jira", label: "Jira" },
];

function getMappingCatalog() {
  return MAPPING_CATALOG.map((item) => ({
    ...item,
    cis_values: item.cis_values.map((value) => ({ ...value })),
  }));
}

function getSystems() {
  return SYSTEMS.map((item) => ({ ...item }));
}

module.exports = {
  getMappingCatalog,
  getSystems,
};
