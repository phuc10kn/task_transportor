const AuthApi = require("../../../src/modules/Auth/AuthApi");
const ProjectsApi = require("../../../src/modules/Projects/ProjectsApi");

function createVerifyProject({ config, input }) {
  const email = "verify-project-owner@example.test";
  const owner = AuthApi.resolveEnabledUserByEmail({ config, email })
    || AuthApi.listUsers({ config }).find((user) => user.enabled)
    || AuthApi.bootstrapSystemAdmin({ config, email, password: "verify-password" }).user;
  return ProjectsApi.createProject({ config, input, creatorUserId: owner.id });
}

module.exports = { createVerifyProject };
