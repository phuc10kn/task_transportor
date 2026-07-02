const crypto = require("crypto");

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeBase64Url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function signPart(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

function signJwt(payload, { secret, expiresInSeconds = 3600 }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(body));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = signPart(unsigned, secret);

  return `${unsigned}.${signature}`;
}

function verifyJwt(token, { secret }) {
  const parts = String(token || "").split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format.");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expected = signPart(unsigned, secret);

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid JWT signature.");
  }

  const header = JSON.parse(decodeBase64Url(encodedHeader));
  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw new Error("Unsupported JWT header.");
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp <= now) {
    throw new Error("JWT expired.");
  }

  return payload;
}

module.exports = {
  signJwt,
  verifyJwt,
};
