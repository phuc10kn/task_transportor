const { loadConfig } = require("../src/config/env");
const { migrate } = require("../src/infrastructure/database/migrate");
const AuthApi = require("../src/modules/Auth/AuthApi");

function main() {
  const config = loadConfig();
  migrate({ config });
  const result = AuthApi.bootstrapSystemAdmin({
    config,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || "Administrator",
  });

  console.log(
    result.created
      ? `System admin created: ${result.user.email}`
      : `System admin already exists: ${result.user.email}`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
