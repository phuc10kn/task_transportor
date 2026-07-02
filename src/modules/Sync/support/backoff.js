const BACKOFF_MINUTES = [1, 5, 15];

function backoffMinutesForAttempt(attemptCount) {
  const index = Math.max(0, Math.min(BACKOFF_MINUTES.length - 1, Number(attemptCount || 1) - 1));

  return BACKOFF_MINUTES[index];
}

module.exports = {
  BACKOFF_MINUTES,
  backoffMinutesForAttempt,
};
