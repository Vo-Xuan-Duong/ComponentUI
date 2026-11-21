import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

export function startServer({ port = Number(process.env.PORT || 4173), host = "127.0.0.1" } = {}) {
  const server = http.createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      response.writeHead(400).end("Bad request");
      return;
    }
    if (pathname === "/") {
      response.writeHead(302, { Location: "/apps/playground-web/" }).end();
      return;
    }
    const absolute = resolve(root, "." + pathname);
    if (!absolute.startsWith(root + sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      const initial = await stat(absolute);
      const file = initial.isDirectory() ? resolve(absolute, "index.html") : absolute;
      const info = await stat(file);
      if (!info.isFile()) throw new Error("Not a file");
      response.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff"
      });
      if (request.method === "HEAD") { response.end(); return; }
      createReadStream(file).on("error", () => response.destroy()).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  server.listen(port, host, () => {
    const address = server.address();
    console.log(`ComponentUI Playground: http://${host}:${address.port}/apps/playground-web/`);
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer();
}
