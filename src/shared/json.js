function parseJson(value, fallback = {}) {
  if (!value) {
    return fallback;
  }

  return JSON.parse(value);
}

function stringifyJson(value) {
  return JSON.stringify(value || {});
}

module.exports = {
  parseJson,
  stringifyJson,
};
