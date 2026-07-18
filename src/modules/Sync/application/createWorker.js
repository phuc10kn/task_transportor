const { recoverStaleJobs } = require("./recoverStaleJobs");
const { runWorkerOnce } = require("./runWorkerOnce");
const { getLogger } = require("../../../infrastructure/observability/logger");

function createWorker({ config, workerId = config.worker.id }) {
  const logger = getLogger(config);
  let timer = null;
  let activeTick = null;

  function tick() {
    if (activeTick) return activeTick;
    activeTick = (async () => {
      try {
        recoverStaleJobs({ config, workerId });
        await runWorkerOnce({ config, workerId });
      } finally {
        activeTick = null;
      }
    })();
    return activeTick;
  }

  return {
    async start() {
      await tick();
      timer = setInterval(() => {
        tick().catch((error) => {
          logger.error({
            event: "worker.tick_failed",
            worker_id: workerId,
            error: { code: error.code || "WORKER_TICK_FAILED", message: error.message },
          });
        });
      }, config.worker.pollIntervalMs);
    },

    async stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (activeTick) await activeTick;
    },

    tick,
  };
}

module.exports = {
  createWorker,
};
