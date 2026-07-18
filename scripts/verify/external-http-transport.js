const assert = require("assert");
const http = require("http");

const { createHttpTransport } = require("../../src/infrastructure/external/transports/http/HttpTransport");

function listen(server) {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
}

async function main() {
  const server = http.createServer((request, response) => {
    if (request.url === "/binary") {
      response.writeHead(200, { "content-type": "application/octet-stream" });
      response.end(Buffer.from([0, 255, 16]));
      return;
    }
    if (request.url === "/slow") {
      setTimeout(() => response.end("late"), 50);
      return;
    }
    response.writeHead(201, { "content-type": "application/json" });
    response.end('{"ok":true}');
  });
  const port = await listen(server);
  const transport = createHttpTransport();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const json = await transport.request({ url: `${baseUrl}/json`, method: "POST" });
    assert.equal(json.status, 201);
    assert.equal(json.ok, true);
    assert.equal(json.rawText, '{"ok":true}');

    const binary = await transport.request({ url: `${baseUrl}/binary` });
    assert.deepEqual([...binary.rawBody], [0, 255, 16]);

    await assert.rejects(
      () => transport.request({ url: `${baseUrl}/slow`, timeoutMs: 5 }),
      (error) => error.code === "EXTERNAL_HTTP_TIMEOUT"
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log("External HTTP transport verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
