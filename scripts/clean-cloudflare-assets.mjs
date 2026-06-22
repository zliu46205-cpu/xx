import { rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const distRedirects = path.join(distDir, "_redirects");

if (process.argv[2] === "before") {
  await rm(distDir, { recursive: true, force: true });
}

await rm(distRedirects, { force: true });
