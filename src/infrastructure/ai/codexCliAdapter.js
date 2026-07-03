const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const schemaPath = path.join(__dirname, "codexTranslationOutput.schema.json");

function readStdin() {
  return new Promise((resolve, reject) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => resolve(input));
    process.stdin.on("error", reject);
  });
}

function parseRequest(rawInput) {
  try {
    return JSON.parse(rawInput || "{}");
  } catch (error) {
    throw new Error("Adapter stdin must be valid JSON.");
  }
}

function buildPrompt(request) {
  return [
    "You are the translation draft generator for task_transportor.",
    "Translate source_text from the source language to the target language.",
    "Return only JSON that matches the provided output schema.",
    "Do not include Markdown fences, prose, logs, or explanations.",
    "Preserve code blocks exactly.",
    "Preserve URLs, issue keys, IDs, variable names, commands, paths, and technical keys exactly.",
    "Translate only natural-language text around those preserved tokens.",
    "If a sentence or segment is already natural Vietnamese, keep it unchanged.",
    "If the text mixes Japanese with Vietnamese or English, translate only the Japanese parts that need translation.",
    "Do not rewrite text just to make it sound different when it is already correct in the target language.",
    "Do not translate stack traces, logs, config keys, JSON keys, shell commands, filenames, or inline code.",
    "Treat context_bundle as supporting context only. Do not rewrite or summarize the context itself.",
    "Use glossary entries in context_bundle.glossary when they match the source text.",
    "Use translation_memory only as a consistency hint.",
    "If the input is mostly technical text with little or no Japanese natural language, keep it unchanged and lower confidence if appropriate.",
    "Set confidence from 0 to 1.",
    "Add warnings for ambiguity, possible mistranslation, or uncertain preserved formatting.",
    "",
    "Input JSON:",
    JSON.stringify(request, null, 2),
  ].join("\n");
}

function codexCommandParts(outputPath) {
  const command = process.env.CODEX_CLI_COMMAND || "codex";
  const args = [
    "exec",
    "--sandbox",
    process.env.CODEX_CLI_SANDBOX || "read-only",
    "--output-schema",
    schemaPath,
    "--output-last-message",
    outputPath,
  ];

  if (process.env.CODEX_CLI_MODEL) {
    args.push("--model", process.env.CODEX_CLI_MODEL);
  }

  if (process.env.CODEX_CLI_PROFILE) {
    args.push("--profile", process.env.CODEX_CLI_PROFILE);
  }

  if (process.env.CODEX_CLI_CD) {
    args.push("--cd", process.env.CODEX_CLI_CD);
  }

  args.push("-");

  return { args, command };
}

function runCodex(prompt, outputPath) {
  const { command, args } = codexCommandParts(outputPath);
  const result = childProcess.spawnSync(command, args, {
    encoding: "utf8",
    input: prompt,
    maxBuffer: 1024 * 1024 * 10,
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      process.stderr.write(
        `Codex CLI command not found: ${command}. ` +
        "Set CODEX_CLI_COMMAND to the absolute path of codex.exe or make codex available in PATH."
      );
      process.exit(1);
      return;
    }

    throw result.error;
  }

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || "codex exec failed.");
    process.exit(result.status || 1);
  }
}

async function main() {
  const rawInput = await readStdin();
  const request = parseRequest(rawInput);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "task-transportor-codex-"));
  const outputPath = path.join(tempDir, "translation-output.json");

  try {
    runCodex(buildPrompt(request), outputPath);

    const output = fs.readFileSync(outputPath, "utf8").trim();
    process.stdout.write(output);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(error && error.message ? error.message : String(error));
    process.exitCode = 1;
  });
}

module.exports = {
  buildPrompt,
  codexCommandParts,
};
