const { AppError } = require("../../../http/errors/AppError");
const { hashPassword } = require("../../../infrastructure/security/passwordHasher");
const { createUserRepository } = require("../infrastructure/UserRepository");
const { issueUserSession } = require("./session");

function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function assertIdentity(identity) {
  const email = normalizedEmail(identity && identity.email);
  const subject = String(identity && identity.subject || "").trim();
  if (!identity || identity.email_verified !== true || !email || !subject) {
    throw new AppError({ code: "GOOGLE_LOGIN_REJECTED", message: "Google login could not be completed.", status: 401 });
  }
  return { email, subject, name: String(identity.name || "").trim() || null };
}

function loginWithGoogle({ config, identity }) {
  const verified = assertIdentity(identity);
  const repository = createUserRepository({ config });
  const linked = repository.findByGoogleSubject(verified.subject);
  if (linked) {
    if (!linked.enabled) {
      throw new AppError({ code: "GOOGLE_LOGIN_REJECTED", message: "Google login could not be completed.", status: 401 });
    }
    return issueUserSession({ config, user: repository.touchLogin(linked.id) });
  }

  if (repository.findByEmail(verified.email)) {
    throw new AppError({
      code: "GOOGLE_LINK_REQUIRED",
      message: "Sign in with your password, then link Google from My account.",
      status: 409,
    });
  }

  try {
    const user = repository.createFromGoogle({
      email: verified.email,
      name: verified.name,
      providerSubject: verified.subject,
    });
    return issueUserSession({ config, user: repository.touchLogin(user.id) });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      throw new AppError({ code: "GOOGLE_LOGIN_REJECTED", message: "Google login could not be completed.", status: 409 });
    }
    throw error;
  }
}

function linkGoogleIdentity({ config, userId, identity }) {
  const verified = assertIdentity(identity);
  const repository = createUserRepository({ config });
  const current = repository.findById(userId);
  if (!current || !current.enabled) {
    throw new AppError({ code: "UNAUTHENTICATED", message: "Authentication is required.", status: 401 });
  }
  if (normalizedEmail(current.email) !== verified.email) {
    throw new AppError({
      code: "GOOGLE_EMAIL_MISMATCH",
      message: "Choose the Google account with the same email as your CIS account.",
      status: 422,
    });
  }
  let result;
  try {
    result = repository.linkGoogle({
      userId,
      providerSubject: verified.subject,
      providerEmail: verified.email,
    });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      throw new AppError({ code: "GOOGLE_IDENTITY_IN_USE", message: "This Google account is already linked to another CIS user.", status: 409 });
    }
    throw error;
  }
  if (result && result.subjectConflict) {
    throw new AppError({ code: "GOOGLE_IDENTITY_IN_USE", message: "This Google account is already linked to another CIS user.", status: 409 });
  }
  if (result && result.userConflict) {
    throw new AppError({ code: "GOOGLE_ALREADY_LINKED", message: "This CIS user already has a different Google account linked.", status: 409 });
  }
  if (!result) throw new AppError({ code: "USER_NOT_FOUND", message: "User not found.", status: 404 });
  return result;
}

function configurePassword({ config, userId, password }) {
  const value = String(password || "");
  if (value.length < 8) {
    throw new AppError({ code: "PASSWORD_TOO_SHORT", message: "Password must be at least 8 characters.", status: 422 });
  }
  const result = createUserRepository({ config }).configurePassword(userId, hashPassword(value));
  if (!result) throw new AppError({ code: "USER_NOT_FOUND", message: "User not found.", status: 404 });
  if (result.alreadyConfigured) {
    throw new AppError({ code: "PASSWORD_ALREADY_CONFIGURED", message: "Password login is already configured.", status: 409 });
  }
  return result;
}

module.exports = {
  configurePassword,
  linkGoogleIdentity,
  loginWithGoogle,
};
