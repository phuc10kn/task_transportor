function parseFrontmatter(content) {
  const match = String(content || "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return { ok: false, error: "missing YAML frontmatter", raw: null, data: null };
  }

  try {
    const data = parseYamlSubset(match[1]);
    return { ok: true, error: null, raw: match[1], data };
  } catch (error) {
    return { ok: false, error: error.message, raw: match[1], data: null };
  }
}

function parseYamlSubset(raw) {
  const lines = String(raw || "").split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, container: root, key: null, kind: "map" }];

  function current() {
    return stack[stack.length - 1];
  }

  function setMapValue(container, key, value) {
    container[key] = value;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    const indent = line.match(/^ */)?.[0].length || 0;
    const trimmed = line.trim();

    while (stack.length > 1 && indent <= current().indent) {
      stack.pop();
    }

    const frame = current();

    const listItem = trimmed.match(/^- (.*)$/);
    if (listItem) {
      if (frame.kind !== "list") {
        throw new Error(`Unexpected list item at line ${index + 1}`);
      }
      const valueText = listItem[1].trim();
      if (valueText === "" || valueText.endsWith(":")) {
        const child = {};
        frame.container.push(child);
        if (valueText.endsWith(":")) {
          stack.push({ indent, container: child, key: null, kind: "map" });
        }
      } else {
        frame.container.push(parseScalar(valueText));
      }
      continue;
    }

    const mapItem = trimmed.match(/^([^:#]+):(.*)$/);
    if (!mapItem) {
      throw new Error(`Unable to parse frontmatter line ${index + 1}: ${trimmed}`);
    }

    const key = mapItem[1].trim();
    const rest = mapItem[2].trim();

    if (frame.kind === "list") {
      throw new Error(`Unexpected map key inside list at line ${index + 1}`);
    }

    if (rest === "") {
      const next = lines[index + 1] || "";
      const nextIndent = next.match(/^ */)?.[0].length || 0;
      const nextTrimmed = next.trim();
      if (nextTrimmed.startsWith("- ") && nextIndent > indent) {
        const list = [];
        setMapValue(frame.container, key, list);
        stack.push({ indent, container: list, key, kind: "list" });
      } else {
        const child = {};
        setMapValue(frame.container, key, child);
        stack.push({ indent, container: child, key, kind: "map" });
      }
      continue;
    }

    setMapValue(frame.container, key, parseScalar(rest));
  }

  return root;
}

function parseScalar(value) {
  const text = String(value || "").trim();
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  if (text === "true") {
    return true;
  }
  if (text === "false") {
    return false;
  }
  if (text === "null" || text === "~") {
    return null;
  }
  return text;
}

function asStringList(value) {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
}

function asRelationsMap(value) {
  if (value == null) {
    return {};
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("relations must be a mapping of slot -> target list");
  }

  const relations = {};
  for (const [slot, targets] of Object.entries(value)) {
    relations[slot] = asStringList(targets);
  }
  return relations;
}

module.exports = {
  parseFrontmatter,
  parseYamlSubset,
  asStringList,
  asRelationsMap,
};
