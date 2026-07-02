function adfNodeToText(node) {
  if (!node || typeof node !== "object") {
    return "";
  }

  if (node.type === "text") {
    return node.text || "";
  }

  const childText = Array.isArray(node.content)
    ? node.content.map(adfNodeToText).filter(Boolean).join("")
    : "";

  if (["paragraph", "heading", "blockquote"].includes(node.type)) {
    return childText ? `${childText}\n` : "";
  }

  if (node.type === "hardBreak") {
    return "\n";
  }

  if (node.type === "listItem") {
    return childText ? `- ${childText.trim()}\n` : "";
  }

  return childText;
}

function adfToPlainText(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (value.type !== "doc" || !Array.isArray(value.content)) {
    return value;
  }

  return value.content
    .map(adfNodeToText)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

module.exports = {
  adfToPlainText,
};
