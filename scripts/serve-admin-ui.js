const path = require("path");
const express = require("express");

const { ROOT_DIR } = require("../src/config/env");

const port = Number(process.env.FE_PORT || process.env.ADMIN_UI_PORT || 8000);
const adminPublicPath = path.join(ROOT_DIR, "public", "admin");
const app = express();

app.use("/admin", express.static(adminPublicPath));
app.get("/", (req, res) => {
  res.redirect("/admin/");
});
app.get("/admin", (req, res) => {
  res.redirect("/admin/");
});

app.listen(port, () => {
  console.log(`Admin UI running on http://localhost:${port}/admin/`);
  console.log("API expected on http://localhost:3000");
});
