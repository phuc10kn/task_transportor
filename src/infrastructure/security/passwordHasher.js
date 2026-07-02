const crypto = require("crypto");

const KEY_LENGTH = 64;
const PREFIX = "scrypt";

function hashPassword(password) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `${PREFIX}$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  const [prefix, salt, hash] = String(storedHash || "").split("$");

  if (prefix !== PREFIX || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password || "", salt, expected.length);

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
