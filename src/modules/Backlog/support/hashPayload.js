const crypto = require("crypto");

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function hashPayload(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

module.exports = {
  hashPayload,
  stableStringify,
};
