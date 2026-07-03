const { loadConfig } = require("../src/config/env");
const { createConnection } = require("../src/infrastructure/database/connection");
const { migrate } = require("../src/infrastructure/database/migrate");
const {
  syncProjectCredentialsFromEnv,
} = require("../src/infrastructure/database/syncProjectCredentialsFromEnv");

function main() {
  const config = loadConfig();
  migrate({ config });

  const db = createConnection({ config });
  try {
    const result = syncProjectCredentialsFromEnv({ db, env: process.env });
    console.log(
      `Project credential sync complete. Scanned: ${result.scanned_projects}. ` +
      `Updated projects: ${result.updated_projects}. Updated fields: ${result.updated_fields}.`
    );

    for (const detail of result.details) {
      console.log(`- Project ${detail.project_id} (${detail.project_name}): ${detail.fields.join(", ")}`);
    }
  } finally {
    db.close();
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
