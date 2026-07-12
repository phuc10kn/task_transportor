const fs = require("fs");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const documentationRoots = [
  path.join(repositoryRoot, "docs", "guide"),
  path.join(repositoryRoot, "docs", "AGENT_SKILLS"),
  path.join(repositoryRoot, "docs", "workbench"),
  path.join(repositoryRoot, "docs", "review"),
];

const markdownLinkPattern = /(?<!!)\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g;
const textualRoutePattern = /(?:\.{1,2}\/|docs\/)[^\s`\])]+\.md#[^\s`\])]+/g;

function collectMarkdownFiles(directoryPath) {
  const files = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

function displayPath(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function lineNumber(content, offset) {
  return content.slice(0, offset).split("\n").length;
}

function headingSlug(heading) {
  return heading
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[\\*_~]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function anchorsFor(markdown) {
  const anchors = new Set();
  const duplicateCounts = new Map();
  let insideFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence;
      continue;
    }

    if (insideFence) {
      continue;
    }

    for (const explicitId of line.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
      anchors.add(explicitId[1].toLocaleLowerCase());
    }

    for (const explicitName of line.matchAll(/\bname\s*=\s*["']([^"']+)["']/gi)) {
      anchors.add(explicitName[1].toLocaleLowerCase());
    }

    const match = line.match(/^\s{0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$/);
    if (!match) {
      continue;
    }

    const baseSlug = headingSlug(match[1]);
    if (!baseSlug) {
      continue;
    }

    const count = duplicateCounts.get(baseSlug) || 0;
    duplicateCounts.set(baseSlug, count + 1);
    anchors.add(count === 0 ? baseSlug : `${baseSlug}-${count}`);
  }

  return anchors;
}

function isExternalTarget(target) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target);
}

function decodeTarget(target) {
  try {
    return decodeURIComponent(target);
  } catch {
    return target;
  }
}

function splitTarget(target) {
  const fragmentIndex = target.indexOf("#");
  const withoutFragment = fragmentIndex === -1 ? target : target.slice(0, fragmentIndex);
  const queryIndex = withoutFragment.indexOf("?");

  return {
    fileTarget: queryIndex === -1 ? withoutFragment : withoutFragment.slice(0, queryIndex),
    fragment: fragmentIndex === -1 ? "" : target.slice(fragmentIndex + 1),
  };
}

function checkMarkdownLinks(filePath, content, anchorCache, errors) {
  markdownLinkPattern.lastIndex = 0;

  for (const match of content.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1] || match[2];
    if (!rawTarget || isExternalTarget(rawTarget)) {
      continue;
    }

    const target = decodeTarget(rawTarget);
    const { fileTarget, fragment } = splitTarget(target);
    const targetPath = fileTarget
      ? path.resolve(path.dirname(filePath), fileTarget)
      : filePath;
    const location = `${displayPath(filePath)}:${lineNumber(content, match.index)}`;

    if (!fs.existsSync(targetPath)) {
      errors.push(`${location} missing local link target: ${rawTarget}`);
      continue;
    }

    if (!fragment || path.extname(targetPath).toLowerCase() !== ".md") {
      continue;
    }

    if (!anchorCache.has(targetPath)) {
      anchorCache.set(targetPath, anchorsFor(fs.readFileSync(targetPath, "utf8")));
    }

    if (!anchorCache.get(targetPath).has(fragment.toLocaleLowerCase())) {
      errors.push(`${location} missing heading fragment: ${rawTarget}`);
    }
  }
}

function checkTextualRoutes(filePath, content, errors) {
  markdownLinkPattern.lastIndex = 0;
  const textOutsideLinks = content.replace(markdownLinkPattern, "");

  for (const match of textOutsideLinks.matchAll(textualRoutePattern)) {
    errors.push(
      `${displayPath(filePath)}:${lineNumber(textOutsideLinks, match.index)} ` +
      `textual Markdown route must be a link: ${match[0]}`
    );
  }
}

function main() {
  const markdownFiles = documentationRoots.flatMap(collectMarkdownFiles);
  const anchorCache = new Map();
  const errors = [];

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    checkMarkdownLinks(filePath, content, anchorCache, errors);
    checkTextualRoutes(filePath, content, errors);
  }

  if (errors.length > 0) {
    console.error("Documentation navigation verification failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Documentation navigation verification passed (${markdownFiles.length} Markdown files).`);
}

main();
