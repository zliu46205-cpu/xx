import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildReport, validateIntake } from "../src/utils/report.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.join(__dirname, "storage");
const reportsFile = path.join(storageDir, "reports.json");
const port = Number(process.env.XUANXUE_API_PORT || 8787);

async function ensureStorage() {
  await mkdir(storageDir, { recursive: true });
  try {
    await readFile(reportsFile, "utf8");
  } catch {
    await writeFile(reportsFile, "[]", "utf8");
  }
}

async function readReports() {
  await ensureStorage();
  const text = await readFile(reportsFile, "utf8");
  return JSON.parse(text || "[]");
}

async function saveReports(reports) {
  await ensureStorage();
  await writeFile(reportsFile, JSON.stringify(reports, null, 2), "utf8");
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sanitizeValues(values = {}) {
  return {
    question: String(values.question || "").slice(0, 260),
    concernType: String(values.concernType || ""),
    timeRange: String(values.timeRange || ""),
    background: String(values.background || "").slice(0, 800),
    birthDate: String(values.birthDate || ""),
    birthTime: String(values.birthTime || ""),
    birthPlace: String(values.birthPlace || "").slice(0, 80),
    gender: String(values.gender || ""),
    castTime: String(values.castTime || "").slice(0, 120),
    numberSeed: String(values.numberSeed || "").slice(0, 80),
    deadline: String(values.deadline || "").slice(0, 120),
    location: String(values.location || "").slice(0, 160),
    options: String(values.options || "").slice(0, 400),
    nameBase: String(values.nameBase || "").slice(0, 120),
    style: String(values.style || "").slice(0, 200),
    contact: String(values.contact || "").slice(0, 120),
    privacyAccepted: Boolean(values.privacyAccepted),
  };
}

function sanitizeMethod(method = {}) {
  return {
    id: String(method.id || "integrated"),
    name: String(method.name || "综合咨询"),
    scene: String(method.scene || ""),
    need: String(method.need || ""),
    output: String(method.output || ""),
    unsuitable: String(method.unsuitable || ""),
  };
}

async function handleCreateReport(req, res) {
  const body = await readJson(req);
  const values = sanitizeValues(body.values);
  const method = sanitizeMethod(body.method);
  const errors = validateIntake(values);

  if (Object.keys(errors).length) {
    sendJson(res, 422, { ok: false, errors });
    return;
  }

  const report = buildReport(values, method);
  const reports = await readReports();
  const record = {
    id: report.id,
    createdAt: report.createdAt,
    methodId: method.id,
    methodName: method.name,
    question: values.question,
    concernType: values.concernType,
    report,
  };
  reports.unshift(record);
  await saveReports(reports.slice(0, 200));
  sendJson(res, 201, { ok: true, report, saved: true });
}

async function handleListReports(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const limit = Math.min(Number(url.searchParams.get("limit") || 8), 30);
  const reports = await readReports();
  sendJson(res, 200, {
    ok: true,
    reports: reports.slice(0, limit).map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      methodName: item.methodName,
      question: item.question,
      title: item.report?.title,
      summary: item.report?.summary,
    })),
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true, service: "xuanxue-api" });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/reports") {
      await handleListReports(req, res);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/reports") {
      await handleCreateReport(req, res);
      return;
    }
    sendJson(res, 404, { ok: false, message: "not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
});

await ensureStorage();
server.listen(port, "127.0.0.1", () => {
  console.log(`xuanxue api listening on http://127.0.0.1:${port}`);
});
