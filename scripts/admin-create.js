const { loadConfig } = require("../src/config/env");
const { migrate } = require("../src/infrastructure/database/migrate");
const AuthApi = require("../src/modules/Auth/AuthApi");

function main() {
  const config = loadConfig();
  migrate({ config });
  const result = AuthApi.bootstrapAdmin({
    config,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || "Administrator",
  });

  console.log(
    result.created
      ? `Admin created: ${result.admin.email}`
      : `Admin already exists: ${result.admin.email}`
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
