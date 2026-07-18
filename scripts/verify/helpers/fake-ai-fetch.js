function sourceTextFrom(options) {
  const body = JSON.parse(options.body);
  const user = body.messages?.[1]?.content || body.messages?.[0]?.content?.[0]?.text || "{}";
  return JSON.parse(user.slice(user.lastIndexOf("\n{") + 1)).source_text || "";
}

function installFakeAiFetch({ mode = "success" } = {}) {
  let failed = false;
  global.fetch = async (_url, options) => {
    if (mode === "timeout") {
      const error = new Error("timeout");
      error.name = "AbortError";
      throw error;
    }
    if (mode === "fail-once" && !failed) {
      failed = true;
      throw new Error("temporary AI failure");
    }
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          id: "fake-ai-request",
          choices: [{
            message: {
              content: mode === "invalid-json"
                ? "not-json"
                : JSON.stringify({
                  translated_text: `[vi] ${sourceTextFrom(options)}`,
                  confidence: mode === "low-confidence" ? 0.2 : 0.82,
                  warnings: mode === "low-confidence" ? ["low_confidence_fixture"] : [],
                  preserved_blocks: true,
                }),
            },
          }],
        };
      },
    };
  };
}

module.exports = { installFakeAiFetch };
