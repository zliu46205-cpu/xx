import { buildReport, validateIntake } from "../src/utils/report.js";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};

function sendJson(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}

async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

function assertDb(env) {
  if (!env.DB) {
    return sendJson(
      {
        ok: false,
        code: "D1_NOT_CONFIGURED",
        message: "Cloudflare D1 database is not configured yet.",
      },
      503,
    );
  }
  return null;
}

function sanitizeValues(values = {}) {
  return {
    question: String(values.question || "").slice(0, 260),
    concernType: String(values.concernType || ""),
    timeRange: String(values.timeRange || ""),
    focusProblem: String(values.focusProblem || ""),
    readingFocus: String(values.readingFocus || ""),
    reportTone: String(values.reportTone || ""),
    detailLevel: String(values.detailLevel || ""),
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

async function createReport(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;

  const body = await readJson(request);
  const values = sanitizeValues(body.values);
  const method = sanitizeMethod(body.method);
  const errors = validateIntake(values);

  if (Object.keys(errors).length) {
    return sendJson({ ok: false, errors }, 422);
  }

  const report = buildReport(values, method);
  await env.DB.prepare(
    `INSERT INTO reports (
      id, created_at, method_id, method_name, question, concern_type, report_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      report.id,
      report.createdAt,
      method.id,
      method.name,
      values.question,
      values.concernType,
      JSON.stringify(report),
    )
    .run();

  return sendJson({ ok: true, report, saved: true }, 201);
}

async function listReports(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 8), 1), 30);
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, method_name, question, report_json
     FROM reports
     ORDER BY created_at DESC
     LIMIT ?`,
  )
    .bind(limit)
    .all();

  return sendJson({
    ok: true,
    reports: (results || []).map((item) => {
      let report = {};
      try {
        report = JSON.parse(item.report_json || "{}");
      } catch {
        report = {};
      }
      return {
        id: item.id,
        createdAt: item.created_at,
        methodName: item.method_name,
        question: item.question,
        title: report.title,
        summary: report.summary,
      };
    }),
  });
}

async function handleApi(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") return sendJson({}, 204);
  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson({
      ok: true,
      service: "xuanxue-worker-api",
      storage: env.DB ? "d1" : "not-configured",
    });
  }
  if (request.method === "GET" && url.pathname === "/api/reports") {
    return listReports(request, env);
  }
  if (request.method === "POST" && url.pathname === "/api/reports") {
    return createReport(request, env);
  }

  return sendJson({ ok: false, message: "not found" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request, env);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) return assetResponse;

      const accept = request.headers.get("accept") || "";
      if (request.method === "GET" && accept.includes("text/html")) {
        const indexUrl = new URL(request.url);
        indexUrl.pathname = "/";
        return env.ASSETS.fetch(new Request(indexUrl, request));
      }

      return assetResponse;
    } catch (error) {
      return sendJson({ ok: false, message: error.message || "server error" }, 500);
    }
  },
};

