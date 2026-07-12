const paths = require("./paths");
const frontmatter = require("./frontmatter");
const sections = require("./sections");
const entityTypes = require("./entity-types");
const triples = require("./triples");
const indexes = require("./indexes");
const report = require("./report");
const cli = require("./cli");

function createDocsContractContext(repositoryRoot) {
  const roots = paths.createRoots(repositoryRoot);
  const registry = entityTypes.loadEntityTypeRegistry(roots);
  const tripleRegistry = triples.loadValidTripleRegistry(roots);
  const theoryIndex = indexes.buildTheoryIndex(roots);
  const decisionIndex = indexes.buildDecisionIndex(roots);

  function discover(options = {}) {
    return entityTypes.discoverInstances(roots, registry, options);
  }

  function entityIndex(options = {}) {
    return indexes.buildEntityIndex(roots, discover(options));
  }

  return {
    roots,
    registry,
    tripleRegistry,
    theoryIndex,
    decisionIndex,
    discover,
    entityIndex,
    resolveTypeForInstance(instancePath) {
      return entityTypes.resolveTypeForInstance(roots, instancePath, registry);
    },
  };
}

module.exports = {
  ...paths,
  ...frontmatter,
  ...sections,
  ...entityTypes,
  ...triples,
  ...indexes,
  ...report,
  ...cli,
  createDocsContractContext,
};
