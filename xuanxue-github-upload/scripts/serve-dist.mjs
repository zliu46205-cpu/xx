import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = normalize(join(process.cwd(), "dist"));
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const requested = normalize(url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, ""));
  const filePath = normalize(join(root, requested));
  const safePath = filePath.startsWith(root) && existsSync(filePath) ? filePath : join(root, "index.html");

  try {
    const body = await readFile(safePath);
    response.writeHead(200, { "Content-Type": types[extname(safePath)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Server error");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static app ready at http://127.0.0.1:${port}/`);
});
