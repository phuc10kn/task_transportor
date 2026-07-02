const fs = require("fs");
const path = require("path");

const { loadConfig } = require("../src/config/env");
const { migrate } = require("../src/infrastructure/database/migrate");
const ProjectsApi = require("../src/modules/Projects/ProjectsApi");

function main() {
  const seedPath = process.argv[2] || process.env.PROJECT_SEED_PATH;
  if (!seedPath) {
    throw new Error("Provide a project seed JSON path as argv[2] or PROJECT_SEED_PATH.");
  }

  const resolvedPath = path.resolve(seedPath);
  const projects = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  const config = loadConfig();
  migrate({ config });

  const imported = ProjectsApi.importProjects({ config, projects });
  console.log(`Imported projects: ${imported.length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
