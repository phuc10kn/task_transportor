const BLOCKED_NAME_PATTERNS = [
  "slack",
  "trello",
  "microsoft teams",
  "jira outlook",
  "jira service management widget",
  "jira spreadsheets",
  "jira triage agent",
  "automation for jira",
  "jira automation",
  "statuspage",
  "github (production)",
  "github for jira",
  "hangouts chat for jira",
  "atlas for jira cloud",
  "atlassian assist",
  "clockwork lite time tracker",
  "configuration manager for jira",
  "system",
  "bot",
  "widget",
  "former user",
  "old user",
  "nguoi dung cu",
  "người dùng cũ",
];

function normalizedText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesBlockedPattern(value) {
  const text = normalizedText(value);
  return text
    ? BLOCKED_NAME_PATTERNS.some((pattern) => text.includes(normalizedText(pattern)))
    : false;
}

function labelForJiraUser(user) {
  return user.displayName || user.emailAddress || user.accountId || user.name || null;
}

function isRealJiraUserProfile(user) {
  if (!user || typeof user !== "object") {
    return false;
  }

  if (user.active === false) {
    return false;
  }

  if (user.accountType && user.accountType !== "atlassian") {
    return false;
  }

  return !matchesBlockedPattern(labelForJiraUser(user));
}

function isRealJiraUserMappingEntry({ value, label }) {
  const candidate = label || value;
  if (!String(value || "").trim()) {
    return false;
  }

  return !matchesBlockedPattern(candidate) && !matchesBlockedPattern(value);
}

module.exports = {
  isRealJiraUserMappingEntry,
  isRealJiraUserProfile,
  labelForJiraUser,
  matchesBlockedPattern,
};
