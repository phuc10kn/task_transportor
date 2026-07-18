const { signJwt } = require("../../../infrastructure/security/jwt");

function issueUserSession({ config, user }) {
  return {
    token: signJwt({ sub: String(user.id), email: user.email, type: "user" }, {
      secret: config.security.jwtSecret,
      expiresInSeconds: config.security.jwtExpiresInSeconds,
    }),
    token_type: "Bearer",
    expires_in: config.security.jwtExpiresInSeconds,
    user,
  };
}

module.exports = { issueUserSession };

