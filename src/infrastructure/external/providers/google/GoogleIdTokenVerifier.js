const { OAuth2Client } = require("google-auth-library");

function createGoogleIdTokenVerifier({ clientId }) {
  const client = new OAuth2Client(clientId);
  return {
    async verify(credential) {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
      const payload = ticket.getPayload() || {};
      return { email: payload.email, email_verified: payload.email_verified === true };
    },
  };
}

module.exports = { createGoogleIdTokenVerifier };
