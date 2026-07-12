const path = require("path");
const { createRoots, resolveRepositoryPath } = require("./paths");

function parseCommonArgs(argv, defaults = {}) {
  const options = {
    instances: [],
    layer: null,
    all: false,
    strict: false,
    json: false,
    help: false,
    repositoryRoot: defaults.repositoryRoot || path.resolve(__dirname, "..", "..", "..", ".."),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--instance") {
      const value = argv[++index];
      if (!value) {
        throw new Error("Missing value for --instance");
      }
      options.instances.push(value);
    } else if (token === "--layer") {
      const value = argv[++index];
      if (!value) {
        throw new Error("Missing value for --layer");
      }
      options.layer = value;
    } else if (token === "--all") {
      options.all = true;
    } else if (token === "--strict") {
      options.strict = true;
    } else if (token === "--json") {
      options.json = true;
    } else if (token === "--repo-root") {
      const value = argv[++index];
      if (!value) {
        throw new Error("Missing value for --repo-root");
      }
      options.repositoryRoot = path.resolve(value);
    } else if (token === "--help" || token === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (!options.help && options.instances.length === 0 && !options.layer && !options.all) {
    throw new Error("Provide --instance, --layer, or --all");
  }

  return options;
}

function printCommonHelp(commandName) {
  process.stdout.write(
    [
      `Usage: node scripts/verify/${commandName}.js (--instance <path> | --layer <NN-name> | --all) [--strict] [--json] [--repo-root <path>]`,
      "",
      "Exit codes:",
      "  0 pass (warnings allowed)",
      "  1 contract violations",
      "  2 usage/config/parser error",
      "",
    ].join("\n")
  );
}

function resolveScopedInstancePaths(options, roots, discoverFn) {
  if (options.instances.length > 0) {
    return options.instances.map((item) => resolveRepositoryPath(roots.repositoryRoot, item));
  }
  return discoverFn({ layer: options.layer || null }).map((item) => item.instancePath);
}

module.exports = {
  parseCommonArgs,
  printCommonHelp,
  resolveScopedInstancePaths,
  createRoots,
};
