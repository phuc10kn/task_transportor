function uniqueValues(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values
    .map((value) => String(value === null || value === undefined ? "" : value).trim())
    .filter(Boolean)));
}

function labelMap(values, mappingType) {
  const labels = values && values[`${mappingType}_labels`];
  return labels && typeof labels === "object" && !Array.isArray(labels) ? labels : {};
}

function directoryValues(values) {
  return Array.isArray(values)
    ? values.filter((value) => value && typeof value === "object" && !Array.isArray(value))
    : [];
}

function sanitizeJiraMappingValues({ mappingValues, isRealJiraUserMappingEntry }) {
  const source = mappingValues || {};
  const sanitized = {};

  for (const [mappingType, values] of Object.entries(source)) {
    if (mappingType.endsWith("_directory")) {
      sanitized[mappingType] = mappingType === "user_directory"
        ? directoryValues(values).filter((user) => isRealJiraUserMappingEntry({
          value: user.value || user.id,
          label: user.name || user.value || user.id,
        }))
        : directoryValues(values);
      continue;
    }

    if (mappingType === "user") {
      const labels = labelMap(source, "user");
      const userValues = uniqueValues(values).filter((value) =>
        isRealJiraUserMappingEntry({
          value,
          label: labels[value] || value,
        })
      );

      sanitized.user = userValues;
      sanitized.user_labels = userValues.reduce((result, value) => {
        if (labels[value]) {
          result[value] = labels[value];
        }
        return result;
      }, {});
      continue;
    }

    if (mappingType.endsWith("_labels")) {
      if (!Object.prototype.hasOwnProperty.call(sanitized, mappingType)) {
        sanitized[mappingType] = values && typeof values === "object" && !Array.isArray(values)
          ? { ...values }
          : {};
      }
      continue;
    }

    sanitized[mappingType] = uniqueValues(values);
  }

  return sanitized;
}

module.exports = {
  sanitizeJiraMappingValues,
};
