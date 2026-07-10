const fs = require("fs");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const metaRoot = path.join(repositoryRoot, "docs", "meta", "01-entity-types");
const appRoot = path.join(repositoryRoot, "docs", "app");

function collectEntityTypeFiles(directoryPath) {
  const files = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectEntityTypeFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") {
      files.push(entryPath);
    }
  }

  return files;
}

function displayPath(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function isInside(parentPath, targetPath) {
  const relative = path.relative(parentPath, targetPath);
  return relative && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function isCompleteContract(typePath) {
  const content = fs.readFileSync(typePath, "utf8");
  return {
    hasSchema: /^\|\s*\*\*schema\*\*\s*\|/im.test(content),
    hasStructureExtends: /^##\s+structure extends\s*$/im.test(content),
  };
}

function instanceReadmesFor(typePath) {
  const relativeTypeDirectory = path.relative(metaRoot, path.dirname(typePath));
  const appTypeDirectory = path.join(appRoot, relativeTypeDirectory);

  if (!fs.existsSync(appTypeDirectory)) {
    return [];
  }

  return fs.readdirSync(appTypeDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(appTypeDirectory, entry.name, "README.md"))
    .filter((readmePath) => fs.existsSync(readmePath));
}

function contractProblems(typePath) {
  const contract = isCompleteContract(typePath);
  const problems = [];

  if (!contract.hasSchema) {
    problems.push("missing header field `schema`");
  }
  if (!contract.hasStructureExtends) {
    problems.push("missing section `## structure extends`");
  }

  return problems;
}

function resolveRepositoryPath(inputPath) {
  return path.resolve(repositoryRoot, inputPath);
}

function typeForInstance(instancePath) {
  if (path.basename(instancePath) !== "README.md" || !isInside(appRoot, instancePath)) {
    throw new Error(`--instance must point to a docs/app instance README: ${displayPath(instancePath)}`);
  }

  const appTypeDirectory = path.dirname(path.dirname(instancePath));
  const relativeTypeDirectory = path.relative(appRoot, appTypeDirectory);
  const metaTypeDirectory = path.join(metaRoot, relativeTypeDirectory);

  if (!fs.existsSync(metaTypeDirectory)) {
    throw new Error(`No canonical entity type directory for instance: ${displayPath(instancePath)}`);
  }

  const typeFiles = fs.readdirSync(metaTypeDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md")
    .map((entry) => path.join(metaTypeDirectory, entry.name));

  if (typeFiles.length !== 1) {
    throw new Error(
      `Cannot resolve one canonical entity type for instance: ${displayPath(instancePath)}`
    );
  }

  return typeFiles[0];
}

function parseArguments(argumentsList) {
  const typePaths = [];
  const instancePaths = [];
  let listLegacy = false;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];

    if (option === "--list-legacy") {
      listLegacy = true;
      continue;
    }

    const value = argumentsList[index + 1];

    if ((option !== "--type" && option !== "--instance") || !value) {
      throw new Error(
        "Usage: node scripts/verify/entity-type-contract.js [--type <path>] [--instance <path>] [--list-legacy]"
      );
    }

    if (option === "--type") {
      typePaths.push(resolveRepositoryPath(value));
    } else {
      instancePaths.push(resolveRepositoryPath(value));
    }
    index += 1;
  }

  return { typePaths, instancePaths, listLegacy };
}

function main() {
  const errors = [];
  let argumentsConfig;

  try {
    argumentsConfig = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const entityTypeFiles = collectEntityTypeFiles(metaRoot);
  const activeTypeFiles = [];
  const unusedLegacyTypeFiles = [];

  for (const typePath of entityTypeFiles) {
    const instances = instanceReadmesFor(typePath);
    const problems = contractProblems(typePath);

    if (instances.length === 0) {
      if (problems.length > 0) {
        unusedLegacyTypeFiles.push(typePath);
      }
      continue;
    }

    activeTypeFiles.push({ typePath, instanceCount: instances.length });
    if (problems.length > 0) {
      errors.push(`${displayPath(typePath)} has ${instances.length} instance(s): ${problems.join(", ")}`);
    }
  }

  const requestedTypePaths = new Set(argumentsConfig.typePaths);
  for (const instancePath of argumentsConfig.instancePaths) {
    if (!fs.existsSync(instancePath)) {
      errors.push(`Instance target does not exist: ${displayPath(instancePath)}`);
      continue;
    }

    try {
      requestedTypePaths.add(typeForInstance(instancePath));
    } catch (error) {
      errors.push(error.message);
    }
  }

  for (const typePath of requestedTypePaths) {
    if (!fs.existsSync(typePath) || !isInside(metaRoot, typePath)) {
      errors.push(`--type must point to a docs/meta entity type definition: ${displayPath(typePath)}`);
      continue;
    }

    const problems = contractProblems(typePath);
    if (problems.length > 0) {
      errors.push(`${displayPath(typePath)}: ${problems.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    console.error("Entity type contract verification failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Entity type contract verification passed (${entityTypeFiles.length} types; ` +
    `${activeTypeFiles.length} type(s) with instances; ${unusedLegacyTypeFiles.length} unused legacy type(s)).`
  );
  if (unusedLegacyTypeFiles.length > 0) {
    console.log(
      `Warning: ${unusedLegacyTypeFiles.length} unused legacy type(s) remain; ` +
      "run with --list-legacy to inspect them."
    );
  }
  if (argumentsConfig.listLegacy) {
    for (const typePath of unusedLegacyTypeFiles) {
      console.log(`Legacy: ${displayPath(typePath)}`);
    }
  }
}

main();
