const INLINE_PATTERN = /(\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|`([^`\n]+)`|\*([^*\n]+)\*)/g;

function textNode(text, marks = []) {
  if (!text) {
    return null;
  }

  return marks.length > 0
    ? { type: "text", text, marks }
    : { type: "text", text };
}

function pushText(nodes, text, marks = []) {
  const node = textNode(text, marks);
  if (node) {
    nodes.push(node);
  }
}

function parseInline(text) {
  const value = text === undefined || text === null ? "" : String(text);
  const nodes = [];
  let lastIndex = 0;
  let match;

  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(value)) !== null) {
    pushText(nodes, value.slice(lastIndex, match.index));

    if (match[2] !== undefined) {
      pushText(nodes, match[2], [{ type: "link", attrs: { href: match[3] } }]);
    } else if (match[4] !== undefined) {
      pushText(nodes, match[4], [{ type: "strong" }]);
    } else if (match[5] !== undefined) {
      pushText(nodes, match[5], [{ type: "code" }]);
    } else if (match[6] !== undefined) {
      pushText(nodes, match[6], [{ type: "em" }]);
    }

    lastIndex = INLINE_PATTERN.lastIndex;
  }

  pushText(nodes, value.slice(lastIndex));
  return nodes;
}

function paragraph(text) {
  return {
    type: "paragraph",
    content: parseInline(text),
  };
}

function heading(level, text) {
  return {
    type: "heading",
    attrs: { level },
    content: parseInline(text),
  };
}

function listItem(text) {
  return {
    type: "listItem",
    content: [paragraph(text)],
  };
}

function isBlank(line) {
  return !String(line || "").trim();
}

function headingMatch(line) {
  return String(line).match(/^(#{1,3})\s+(.+)$/);
}

function bulletMatch(line) {
  return String(line).match(/^-\s+(.+)$/);
}

function orderedMatch(line) {
  return String(line).match(/^(\d+)\.\s+(.+)$/);
}

function blockquoteMatch(line) {
  return String(line).match(/^>\s?(.*)$/);
}

function ruleMatch(line) {
  return /^---+\s*$/.test(String(line).trim());
}

function markdownToAdf(text) {
  const value = text === undefined || text === null ? "" : String(text);
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const content = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isBlank(line)) {
      content.push(paragraph(""));
      continue;
    }

    const h = headingMatch(line);
    if (h) {
      content.push(heading(h[1].length, h[2].trim()));
      continue;
    }

    if (ruleMatch(line)) {
      content.push({ type: "rule" });
      continue;
    }

    const bullet = bulletMatch(line);
    if (bullet) {
      const items = [];
      while (index < lines.length) {
        const item = bulletMatch(lines[index]);
        if (!item) {
          break;
        }
        items.push(listItem(item[1].trim()));
        index += 1;
      }
      index -= 1;
      content.push({ type: "bulletList", content: items });
      continue;
    }

    const ordered = orderedMatch(line);
    if (ordered) {
      const items = [];
      const order = Number(ordered[1]);
      while (index < lines.length) {
        const item = orderedMatch(lines[index]);
        if (!item) {
          break;
        }
        items.push(listItem(item[2].trim()));
        index += 1;
      }
      index -= 1;
      content.push({
        type: "orderedList",
        attrs: Number.isFinite(order) && order > 1 ? { order } : { order: 1 },
        content: items,
      });
      continue;
    }

    const quote = blockquoteMatch(line);
    if (quote) {
      const quoteContent = [];
      while (index < lines.length) {
        const item = blockquoteMatch(lines[index]);
        if (!item) {
          break;
        }
        quoteContent.push(paragraph(item[1]));
        index += 1;
      }
      index -= 1;
      content.push({ type: "blockquote", content: quoteContent });
      continue;
    }

    content.push(paragraph(line));
  }

  return {
    version: 1,
    type: "doc",
    content: content.length > 0 ? content : [paragraph("")],
  };
}

module.exports = {
  markdownToAdf,
  textToAdf: markdownToAdf,
};
