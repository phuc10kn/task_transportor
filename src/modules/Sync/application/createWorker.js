const { recoverStaleJobs } = require("./recoverStaleJobs");
const { runWorkerOnce } = require("./runWorkerOnce");

function createWorker({ config, workerId = config.worker.id }) {
  let timer = null;
  let running = false;

  async function tick() {
    if (running) {
      return;
    }

    running = true;
    try {
      recoverStaleJobs({ config, workerId });
      await runWorkerOnce({ config, workerId });
    } finally {
      running = false;
    }
  }

  return {
    async start() {
      await tick();
      timer = setInterval(() => {
        tick().catch((error) => {
          console.error("Worker tick failed:", error.message);
        });
      }, config.worker.pollIntervalMs);
    },

    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },

    tick,
  };
}

module.exports = {
  createWorker,
};
