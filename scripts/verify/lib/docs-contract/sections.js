function normalizeHeading(text) {
  return String(text || "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[\\*_~]/g, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function collectHeadings(content) {
  const headings = [];
  let insideFence = false;

  for (const line of String(content || "").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) {
      continue;
    }
    const match = line.match(/^\s{0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$/);
    if (match) {
      headings.push({
        raw: match[1].trim(),
        normalized: normalizeHeading(match[1]),
      });
    }
  }

  return headings;
}

function hasHeading(content, expected) {
  const expectedNormalized = normalizeHeading(expected);
  return collectHeadings(content).some((heading) => {
    return (
      heading.normalized === expectedNormalized ||
      heading.normalized.startsWith(`${expectedNormalized} `)
    );
  });
}

function missingHeadings(content, expectedList) {
  return expectedList.filter((expected) => !hasHeading(content, expected));
}

module.exports = {
  normalizeHeading,
  collectHeadings,
  hasHeading,
  missingHeadings,
};
