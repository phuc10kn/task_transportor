const { loadConfig } = require("../src/config/env");
const { migrate } = require("../src/infrastructure/database/migrate");
const SyncApi = require("../src/modules/Sync/SyncApi");

async function main() {
  const config = loadConfig();
  migrate({ config });
  const result = await SyncApi.runWorkerOnce({
    config,
    workerId: process.env.WORKER_ID || config.worker.id,
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
