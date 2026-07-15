"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const files = [];
for (const directory of ["public", "views", "scripts"]) {
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (target.endsWith(".js")) files.push(target);
    }
  };
  visit(path.join(root, directory));
}
files.push(path.join(root, "server.js"));

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

const forbidden = ["next", "react", "react-dom", "typescript", "tailwindcss"];
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const name of forbidden) {
  if (manifest.dependencies?.[name] || manifest.devDependencies?.[name]) throw new Error(`Forbidden legacy dependency: ${name}`);
}
console.log(`Admin Web check passed (${files.length} JavaScript files).`);
