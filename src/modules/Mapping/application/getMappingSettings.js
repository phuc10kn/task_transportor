const { createMappingRepository } = require("../infrastructure/MappingRepository");
const { getMappingCatalog, getSystems } = require("../support/mappingCatalog");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function ruleKey(rule) {
  return [
    rule.mapping_type,
    rule.direction_from,
    rule.direction_to,
    rule.from_value,
  ].join("\u0000");
}

function optionValues(options) {
  return options.map((option) => option.value);
}

function systemMappingConfig(project, system) {
  if (!project) {
    return {};
  }

  if (system === "backlog") {
    return project.backlog_mapping_values_json || {};
  }

  if (system === "jira") {
    return project.jira_mapping_values_json || {};
  }

  return {};
}

function cisMappingConfig(project) {
  return project && project.cis_mapping_values_json || {};
}

function uniqueTexts(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set((values || [])
    .map((value) => String(value === null || value === undefined ? "" : value).trim())
    .filter(Boolean)));
}

function labelMap(config, mappingType) {
  const labels = config && config[`${mappingType}_labels`];
  return labels && typeof labels === "object" && !Array.isArray(labels) ? labels : {};
}

function cisValueOptions(catalogItem, configuredValues, configuredLabels = {}) {
  const catalogValues = (catalogItem.cis_values || []).map((item) => item.value);
  const configuredTexts = uniqueTexts(configuredValues || []);
  const values = configuredTexts.length > 0 ? configuredTexts : catalogValues;
  return uniqueTexts(values).map((value) => {
    const catalogOption = (catalogItem.cis_values || []).find((item) => item.value === value);
    return {
      value,
      label: configuredLabels[value] || (catalogOption ? catalogOption.label : value),
    };
  });
}

function mappingTypeOptions({ catalogItem, configuredValues, configuredLabels = {}, discoveredValues, rules, directionFrom, directionTo }) {
  const values = [];
  const add = (value) => {
    const text = value === null || value === undefined ? "" : String(value).trim();
    if (text && !values.includes(text)) {
      values.push(text);
    }
  };

  for (const value of configuredValues || []) {
    add(value);
  }

  for (const item of discoveredValues || []) {
    if (item.mapping_type === catalogItem.key) {
      add(item.from_value);
    }
  }

  for (const rule of rules || []) {
    if (
      rule.mapping_type === catalogItem.key &&
      rule.direction_from === directionFrom &&
      rule.direction_to === directionTo
    ) {
      if (directionFrom === "cis") {
        add(rule.to_value);
      } else {
        add(rule.from_value);
      }
    }
  }

  return values.map((value) => ({
    value,
    label: configuredLabels[value] || value,
  }));
}

function createRuleLookup(rules) {
  const lookup = new Map();
  for (const rule of rules) {
    lookup.set(ruleKey(rule), rule);
  }
  return lookup;
}

function buildSystemsToCis({ catalog, cisConfiguredValues, configuredValues, discoveredValues, rules, projectId, sourceSystem }) {
  const lookup = createRuleLookup(rules);
  const discoveredByKey = new Map(discoveredValues.map((item) => [
    `${item.mapping_type}\u0000${item.from_value}`,
    item,
  ]));

  for (const catalogItem of catalog) {
    for (const value of configuredValues[catalogItem.key] || []) {
      const key = `${catalogItem.key}\u0000${value}`;
      if (!discoveredByKey.has(key)) {
        discoveredByKey.set(key, {
          mapping_type: catalogItem.key,
          system: sourceSystem,
          from_value: value,
          issue_count: 0,
          example_issue_ids: [],
        });
      }
    }
  }

  for (const rule of rules) {
    if (rule.direction_from === sourceSystem && rule.direction_to === "cis") {
      const key = `${rule.mapping_type}\u0000${rule.from_value}`;
      if (!discoveredByKey.has(key)) {
        discoveredByKey.set(key, {
          mapping_type: rule.mapping_type,
          system: sourceSystem,
          from_value: rule.from_value,
          issue_count: 0,
          example_issue_ids: [],
        });
      }
    }
  }

  return Array.from(discoveredByKey.values())
    .map((item) => {
      const catalogItem = catalog.find((entry) => entry.key === item.mapping_type) || {};
      const existingRule = lookup.get([
        item.mapping_type,
        sourceSystem,
        "cis",
        item.from_value,
      ].join("\u0000"));

      return {
        project_id: projectId,
        mapping_type: item.mapping_type,
        mapping_label: catalogItem.label || item.mapping_type,
        required_for_jira: Boolean(catalogItem.required_for_jira),
        direction_from: sourceSystem,
        direction_to: "cis",
        from_value: item.from_value,
        to_value: existingRule ? existingRule.to_value : "",
        system_values: mappingTypeOptions({
          catalogItem,
          configuredValues: configuredValues[item.mapping_type] || [],
          configuredLabels: labelMap(configuredValues, item.mapping_type),
          discoveredValues,
          rules,
          directionFrom: sourceSystem,
          directionTo: "cis",
        }),
        issue_count: item.issue_count,
        example_issue_ids: item.example_issue_ids,
        cis_values: cisValueOptions(
          catalogItem,
          cisConfiguredValues[item.mapping_type],
          labelMap(cisConfiguredValues, item.mapping_type)
        ),
        allows_custom_cis_value: catalogItem.allows_custom_cis_value !== false,
        existing_rule: existingRule || null,
      };
    })
    .sort((a, b) => {
      if (a.required_for_jira !== b.required_for_jira) {
        return a.required_for_jira ? -1 : 1;
      }
      if (a.mapping_type !== b.mapping_type) {
        return a.mapping_type.localeCompare(b.mapping_type);
      }
      return a.from_value.localeCompare(b.from_value);
    });
}

function buildCisToSystem({ catalog, cisConfiguredValues, configuredValues, rules, projectId, targetSystem }) {
  const lookup = createRuleLookup(rules);
  const values = [];

  for (const catalogItem of catalog) {
    if (!catalogItem.target_systems.includes(targetSystem)) {
      continue;
    }

    const cisOptions = cisValueOptions(
      catalogItem,
      cisConfiguredValues[catalogItem.key],
      labelMap(cisConfiguredValues, catalogItem.key)
    );
    const cisValues = optionValues(cisOptions);

    for (const cisValue of cisValues) {
      const existingRule = lookup.get([
        catalogItem.key,
        "cis",
        targetSystem,
        cisValue,
      ].join("\u0000"));
      const option = cisOptions.find((item) => item.value === cisValue);

      values.push({
        project_id: projectId,
        mapping_type: catalogItem.key,
        mapping_label: catalogItem.label,
        required_for_jira: Boolean(catalogItem.required_for_jira && targetSystem === "jira"),
        direction_from: "cis",
        direction_to: targetSystem,
        from_value: cisValue,
        from_label: option ? option.label : cisValue,
        to_value: existingRule ? existingRule.to_value : "",
        system_values: mappingTypeOptions({
          catalogItem,
          configuredValues: configuredValues[catalogItem.key] || [],
          configuredLabels: labelMap(configuredValues, catalogItem.key),
          discoveredValues: [],
          rules,
          directionFrom: "cis",
          directionTo: targetSystem,
        }),
        existing_rule: existingRule || null,
      });
    }
  }

  return values.sort((a, b) => {
    if (a.required_for_jira !== b.required_for_jira) {
      return a.required_for_jira ? -1 : 1;
    }
    if (a.mapping_type !== b.mapping_type) {
      return a.mapping_type.localeCompare(b.mapping_type);
    }
    return a.from_value.localeCompare(b.from_value);
  });
}

function getMappingSettings({ config, filters = {} }) {
  const projectId = Number(filters.project_id);
  const sourceSystem = filters.source_system || "backlog";
  const targetSystem = filters.target_system || "jira";
  const catalog = getMappingCatalog();
  const repository = createMappingRepository({ config });
  const project = projectId ? projectsApi().getProjectConfig({ config, projectId }) : null;
  const cisConfiguredValues = cisMappingConfig(project);
  const sourceConfiguredValues = systemMappingConfig(project, sourceSystem);
  const targetConfiguredValues = systemMappingConfig(project, targetSystem);
  const mappingTypes = catalog
    .filter((item) => item.source_systems.includes(sourceSystem))
    .map((item) => item.key);
  const rules = projectId
    ? repository.list({ project_id: projectId })
    : [];
  const discoveredValues = projectId
    ? repository.listSystemFieldValues({
      projectId,
      system: sourceSystem,
      mappingTypes,
    })
    : [];

  return {
    project_id: projectId || null,
    source_system: sourceSystem,
    target_system: targetSystem,
    systems: getSystems(),
    mapping_types: catalog,
    flows: {
      systems_to_cis: buildSystemsToCis({
      catalog,
      cisConfiguredValues,
      configuredValues: sourceConfiguredValues,
      discoveredValues,
      projectId,
        rules,
        sourceSystem,
      }),
      cis_to_system: buildCisToSystem({
      catalog,
      cisConfiguredValues,
      configuredValues: targetConfiguredValues,
      projectId,
        rules,
        targetSystem,
      }),
    },
  };
}

module.exports = {
  getMappingSettings,
};
