const DEFAULT_PULL_FILTER = {
  statuses: [],
  issue_types: [],
  priorities: [],
  include_closed: true,
  include_attachments: "metadata_only",
  page_size: 100,
};

module.exports = {
  DEFAULT_PULL_FILTER,
};
