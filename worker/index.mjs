import { buildReport, validateIntake } from "../src/utils/report.js";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
};

const API_VERSION = "deepseek-json-v2";

const PLANS = {
  free: { name: "免费试测", amount: 0, credits: 1, type: "free" },
  single: { name: "单项精批", amount: 1990, credits: 3, type: "credits" },
  monthly: { name: "月卡会员", amount: 9900, credits: 30, type: "membership", days: 30 },
  yearly: { name: "年卡会员", amount: 39900, credits: 420, type: "membership", days: 365 },
  review: { name: "人工复核", amount: 29900, credits: 1, type: "service" },
};

const AI_REPORT_INSTRUCTIONS = `
你是“天机观象”的中国传统术数报告生成器。你要按 chinese-metaphysics-advisor 的原则输出：中文优先、术语准确、白话能懂、结论审慎、现实可执行。
定位：传统文化、象征系统、人生反思、娱乐参考、规划建议。不得制造迷信权威，不得恐吓，不得保证发财、复合、升职、治病。
红线：不做死亡时间、寿命、疾病诊断、彩票股票指令、违法规避、诅咒害人、付费消灾、法事保证、婚姻强迫。
输出必须是 JSON，不要 Markdown，不要额外解释。JSON 字段必须包含：summary, situation, tendency, inference, suggestions, stageAdvice, oracle, termGlossary。
字段要求：
- summary: 一段 80-140 字，不要含糊，要点出主象、卡点、倾向。
- situation: 160-260 字，说明用户问题、所用术数、资料完整度、缺失假设。
- tendency: 120-220 字，说明未来倾向，不许绝对化。
- inference: 4-6 条数组，每条 60-120 字，必须包含术语推演和现实翻译。
- suggestions: 5-7 条数组，每条具体可执行。
- stageAdvice: 4 条数组，每条为 {title, symbol, real}。
- oracle: {mainHexagram, changedHexagram, score, firstTitle, secondTitle, guaci, xiangci, plainText, caution, similarCase}。
- termGlossary: 4-6 组数组，如 ["用神", "解释"]。
根据方法使用对应术语：八字用日主/月令/十神/财官印食/大运流年；紫微用命宫/身宫/十二宫/三方四正/四化；梅花用本互变/体用/动爻/外应；六爻用世应/用神/六亲/六神/动变；奇门用九宫/八门/九星/八神/值符值使；风水用明堂/气口/动线/坐向/采光；起名用五行意象/音形义/避讳。
如果资料不足，要明确“按简化路径分析”，但仍要给出有区分度的判断。
`;

function stripCodeFence(text) {
  return String(text || "").replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
}

function extractResponseText(payload) {
  return payload?.choices?.[0]?.message?.content || "";
}

function safeArray(value, fallback = []) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function mergeAiReport(baseReport, aiReport) {
  if (!aiReport || typeof aiReport !== "object") return baseReport;
  const next = {
    ...baseReport,
    summary: typeof aiReport.summary === "string" ? aiReport.summary : baseReport.summary,
    situation: typeof aiReport.situation === "string" ? aiReport.situation : baseReport.situation,
    tendency: typeof aiReport.tendency === "string" ? aiReport.tendency : baseReport.tendency,
    inference: safeArray(aiReport.inference, baseReport.inference),
    suggestions: safeArray(aiReport.suggestions, baseReport.suggestions),
    stageAdvice: safeArray(aiReport.stageAdvice, baseReport.stageAdvice),
    termGlossary: safeArray(aiReport.termGlossary, baseReport.termGlossary),
    generatedBy: "deepseek",
  };
  if (aiReport.oracle && typeof aiReport.oracle === "object") {
    next.oracle = { ...baseReport.oracle, ...aiReport.oracle };
  }
  return next;
}

async function generateAiReport(baseReport, values, method, env) {
  if (!env.DEEPSEEK_API_KEY) return baseReport;
  const model = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const input = {
    method,
    values: {
      question: values.question,
      concernType: values.concernType,
      timeRange: values.timeRange,
      focusProblem: values.focusProblem,
      readingFocus: values.readingFocus,
      reportTone: values.reportTone,
      detailLevel: values.detailLevel,
      background: values.background,
      birthDate: values.birthDate,
      birthTime: values.birthTime,
      birthPlace: values.birthPlace,
      gender: values.gender,
      castTime: values.castTime,
      numberSeed: values.numberSeed,
      deadline: values.deadline,
      location: values.location,
      options: values.options,
      nameBase: values.nameBase,
      style: values.style,
    },
    baseReport,
  };

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: AI_REPORT_INSTRUCTIONS },
        { role: "user", content: `请基于以下输入生成更具体的商业级中文术数参考报告。只返回 JSON。\n${JSON.stringify(input)}` },
      ],
      temperature: 0.75,
      response_format: { type: "json_object" },
      max_tokens: 2600,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status}`);
  }
  const payload = await response.json();
  const text = stripCodeFence(extractResponseText(payload));
  const parsed = JSON.parse(text);
  return mergeAiReport(baseReport, parsed);
}
function sendJson(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders });
}

async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

function assertDb(env) {
  if (!env.DB) {
    return sendJson({ ok: false, code: "D1_NOT_CONFIGURED", message: "Cloudflare D1 database is not configured yet." }, 503);
  }
  return null;
}

function assertAuthConfigured(env) {
  if (!env.SESSION_SECRET || String(env.SESSION_SECRET).length < 24) {
    return sendJson({ ok: false, code: "AUTH_NOT_CONFIGURED", message: "请先在 Cloudflare 变量中设置 SESSION_SECRET，长度建议 24 位以上。" }, 503);
  }
  return null;
}

function makeId(prefix) {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  const text = Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${Date.now().toString(36)}_${text}`;
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeJson(payload) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

function decodeJson(text) {
  return JSON.parse(new TextDecoder().decode(fromBase64Url(text)));
}

async function sha256(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return toBase64Url(new Uint8Array(digest));
}

async function hmac(data, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(signature));
}

async function hashPassword(password, salt) {
  return sha256(`${salt}:${password}`);
}

async function createSession(payload, env) {
  const body = encodeJson({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 });
  const sig = await hmac(body, env.SESSION_SECRET);
  return `${body}.${sig}`;
}

async function verifySession(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmac(body, env.SESSION_SECRET || "missing");
  if (expected !== sig) return null;
  const session = decodeJson(body);
  if (!session.exp || session.exp < Date.now()) return null;
  return session;
}

async function requireUser(request, env) {
  const configured = assertAuthConfigured(env);
  if (configured) return { response: configured };
  const session = await verifySession(request, env);
  if (!session?.userId) return { response: sendJson({ ok: false, code: "UNAUTHORIZED", message: "请先登录。" }, 401) };
  return { session };
}

async function requireAdmin(request, env) {
  const auth = await requireUser(request, env);
  if (auth.response) return auth;
  if (auth.session.role !== "admin") {
    return { response: sendJson({ ok: false, code: "FORBIDDEN", message: "需要管理员权限。" }, 403) };
  }
  return auth;
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

function sanitizeEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 120);
}

function centsToYuan(amount) {
  return (Number(amount || 0) / 100).toFixed(2);
}

async function registerUser(request, env) {
  const missingDb = assertDb(env) || assertAuthConfigured(env);
  if (missingDb) return missingDb;
  const body = await readJson(request);
  const email = sanitizeEmail(body.email);
  const password = String(body.password || "");
  const name = String(body.name || email.split("@")[0] || "用户").slice(0, 40);
  if (!/^\S+@\S+\.\S+$/.test(email)) return sendJson({ ok: false, message: "请输入有效邮箱。" }, 422);
  if (password.length < 8) return sendJson({ ok: false, message: "密码至少 8 位。" }, 422);

  const id = makeId("user");
  const salt = makeId("salt");
  const passwordHash = await hashPassword(password, salt);
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO users (id, created_at, email, name, password_salt, password_hash, role, status, credits) VALUES (?, ?, ?, ?, ?, ?, 'user', 'active', 1)`,
    ).bind(id, now, email, name, salt, passwordHash).run();
  } catch {
    return sendJson({ ok: false, message: "该邮箱已注册，直接登录即可。" }, 409);
  }
  const token = await createSession({ userId: id, email, name, role: "user" }, env);
  return sendJson({ ok: true, session: { token, user: { id, email, name, role: "user" } } }, 201);
}

async function loginUser(request, env) {
  const missingDb = assertDb(env) || assertAuthConfigured(env);
  if (missingDb) return missingDb;
  const body = await readJson(request);
  const email = sanitizeEmail(body.email);
  const password = String(body.password || "");
  const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ? AND status = 'active'`).bind(email).first();
  if (!user) return sendJson({ ok: false, message: "账号或密码不正确。" }, 401);
  const passwordHash = await hashPassword(password, user.password_salt);
  if (passwordHash !== user.password_hash) return sendJson({ ok: false, message: "账号或密码不正确。" }, 401);
  const token = await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role || "user" }, env);
  return sendJson({ ok: true, session: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role || "user" } } });
}

async function loginAdmin(request, env) {
  const configured = assertAuthConfigured(env);
  if (configured) return configured;
  const body = await readJson(request);
  const account = String(body.account || "").trim();
  const password = String(body.password || "");
  const code = String(body.code || "");
  if (!env.ADMIN_ACCOUNT || !env.ADMIN_PASSWORD || !env.ADMIN_CODE) {
    return sendJson({ ok: false, code: "ADMIN_NOT_CONFIGURED", message: "请先在 Cloudflare 变量中设置 ADMIN_ACCOUNT、ADMIN_PASSWORD、ADMIN_CODE。" }, 503);
  }
  if (account !== env.ADMIN_ACCOUNT || password !== env.ADMIN_PASSWORD || code !== env.ADMIN_CODE) {
    return sendJson({ ok: false, message: "管理员账号、密码或口令不正确。" }, 401);
  }
  const token = await createSession({ userId: "admin", email: account, name: "管理员", role: "admin" }, env);
  return sendJson({ ok: true, session: { token, user: { id: "admin", email: account, name: "管理员", role: "admin" } } });
}

async function getAccount(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  if (auth.session.role === "admin") {
    return sendJson({ ok: true, user: auth.session, membership: null, stats: { reports: 0, orders: 0 }, reports: [], orders: [] });
  }
  const user = await env.DB.prepare(`SELECT id, email, name, role, credits, created_at FROM users WHERE id = ?`).bind(auth.session.userId).first();
  const membership = await env.DB.prepare(`SELECT * FROM memberships WHERE user_id = ? AND status = 'active' ORDER BY end_at DESC LIMIT 1`).bind(auth.session.userId).first().catch(() => null);
  const reportsResult = await env.DB.prepare(`SELECT id, created_at, method_name, question, report_json FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 8`).bind(auth.session.userId).all().catch(() => ({ results: [] }));
  const ordersResult = await env.DB.prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 8`).bind(auth.session.userId).all().catch(() => ({ results: [] }));
  return sendJson({
    ok: true,
    user,
    membership,
    stats: { reports: reportsResult.results?.length || 0, orders: ordersResult.results?.length || 0, credits: user?.credits || 0 },
    reports: (reportsResult.results || []).map(formatReportRecord),
    orders: (ordersResult.results || []).map(formatOrderRecord),
  });
}

function formatReportRecord(item) {
  let report = {};
  try { report = JSON.parse(item.report_json || "{}"); } catch {}
  return { id: item.id, createdAt: item.created_at, methodName: item.method_name, question: item.question, title: report.title, summary: report.summary };
}

function formatOrderRecord(item) {
  return { id: item.id, createdAt: item.created_at, planId: item.plan_id, planName: item.plan_name, amount: item.amount, amountText: `¥${centsToYuan(item.amount)}`, status: item.status };
}

async function createReport(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const session = await verifySession(request, env).catch(() => null);
  const body = await readJson(request);
  const values = sanitizeValues(body.values);
  const method = sanitizeMethod(body.method);
  const errors = validateIntake(values);
  if (Object.keys(errors).length) return sendJson({ ok: false, errors }, 422);

  let report = buildReport(values, method);
  try {
    report = await generateAiReport(report, values, method, env);
  } catch (error) {
    report = { ...report, generatedBy: "rules", aiError: String(error?.message || "AI_GENERATION_FALLBACK").slice(0, 180) };
  }

  try {
    await env.DB.prepare(
      `INSERT INTO reports (id, created_at, user_id, method_id, method_name, question, concern_type, report_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(report.id, report.createdAt, session?.role === "user" ? session.userId : null, method.id, method.name, values.question, values.concernType, JSON.stringify(report)).run();
  } catch {
    await env.DB.prepare(
      `INSERT INTO reports (id, created_at, method_id, method_name, question, concern_type, report_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(report.id, report.createdAt, method.id, method.name, values.question, values.concernType, JSON.stringify(report)).run();
  }
  return sendJson({ ok: true, report, saved: true }, 201);
}

async function listReports(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 8), 1), 30);
  const session = await verifySession(request, env).catch(() => null);
  let query;
  if (session?.role === "user") {
    query = await env.DB.prepare(`SELECT id, created_at, method_name, question, report_json FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`).bind(session.userId, limit).all().catch(() => null);
  }
  if (!query) {
    query = await env.DB.prepare(`SELECT id, created_at, method_name, question, report_json FROM reports ORDER BY created_at DESC LIMIT ?`).bind(limit).all();
  }
  return sendJson({ ok: true, reports: (query.results || []).map(formatReportRecord) });
}

async function createOrder(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  if (auth.session.role !== "user") return sendJson({ ok: false, message: "管理员不创建用户订单。" }, 403);
  const body = await readJson(request);
  const plan = PLANS[String(body.planId || "")];
  if (!plan) return sendJson({ ok: false, message: "套餐不存在。" }, 404);
  const now = new Date().toISOString();
  const id = makeId("order");
  const status = plan.amount === 0 ? "paid" : "pending";
  await env.DB.prepare(
    `INSERT INTO orders (id, created_at, updated_at, user_id, plan_id, plan_name, amount, currency, status, provider, checkout_url) VALUES (?, ?, ?, ?, ?, ?, ?, 'CNY', ?, 'manual', '')`,
  ).bind(id, now, now, auth.session.userId, body.planId, plan.name, plan.amount, status).run();
  if (plan.amount === 0) {
    await env.DB.prepare(`UPDATE users SET credits = COALESCE(credits, 0) + ? WHERE id = ?`).bind(plan.credits, auth.session.userId).run().catch(() => null);
  }
  return sendJson({ ok: true, order: { id, planId: body.planId, planName: plan.name, amount: plan.amount, amountText: `¥${centsToYuan(plan.amount)}`, status, checkoutUrl: "" } }, 201);
}

async function markMockPaid(request, env, orderId) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  if (env.ENABLE_MOCK_PAYMENTS !== "true") {
    return sendJson({ ok: false, code: "MOCK_PAYMENT_DISABLED", message: "测试支付未开启。生产环境请接入正式支付回调。" }, 403);
  }
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  const order = await env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`).bind(orderId, auth.session.userId).first();
  if (!order) return sendJson({ ok: false, message: "订单不存在。" }, 404);
  const plan = PLANS[order.plan_id];
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE orders SET status = 'paid', updated_at = ?, paid_at = ? WHERE id = ?`).bind(now, now, orderId).run();
  if (plan?.credits) await env.DB.prepare(`UPDATE users SET credits = COALESCE(credits, 0) + ? WHERE id = ?`).bind(plan.credits, auth.session.userId).run().catch(() => null);
  if (plan?.type === "membership") {
    const endAt = new Date(Date.now() + plan.days * 86400000).toISOString();
    await env.DB.prepare(`INSERT INTO memberships (id, user_id, plan_id, plan_name, start_at, end_at, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`).bind(makeId("mem"), auth.session.userId, order.plan_id, plan.name, now, endAt).run().catch(() => null);
  }
  return sendJson({ ok: true, order: { ...formatOrderRecord({ ...order, status: "paid" }), status: "paid" } });
}

async function getAdminOverview(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  const users = await env.DB.prepare(`SELECT COUNT(*) AS count FROM users`).first().catch(() => ({ count: 0 }));
  const reports = await env.DB.prepare(`SELECT COUNT(*) AS count FROM reports`).first().catch(() => ({ count: 0 }));
  const orders = await env.DB.prepare(`SELECT COUNT(*) AS count FROM orders`).first().catch(() => ({ count: 0 }));
  const paid = await env.DB.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue FROM orders WHERE status = 'paid'`).first().catch(() => ({ count: 0, revenue: 0 }));
  const recentOrders = await env.DB.prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 12`).all().catch(() => ({ results: [] }));
  const recentReports = await env.DB.prepare(`SELECT id, created_at, method_name, question, report_json FROM reports ORDER BY created_at DESC LIMIT 12`).all().catch(() => ({ results: [] }));
  return sendJson({
    ok: true,
    metrics: { users: users.count || 0, reports: reports.count || 0, orders: orders.count || 0, paidOrders: paid.count || 0, revenue: paid.revenue || 0, revenueText: `¥${centsToYuan(paid.revenue || 0)}` },
    orders: (recentOrders.results || []).map(formatOrderRecord),
    reports: (recentReports.results || []).map(formatReportRecord),
  });
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return sendJson({}, 204);
  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson({
      ok: true,
      service: "xuanxue-worker-api",
      version: API_VERSION,
      storage: env.DB ? "d1" : "not-configured",
      ai: env.DEEPSEEK_API_KEY ? "configured" : "not-configured",
      model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    });
  }
  if (request.method === "POST" && url.pathname === "/api/auth/register") return registerUser(request, env);
  if (request.method === "POST" && url.pathname === "/api/auth/login") return loginUser(request, env);
  if (request.method === "POST" && url.pathname === "/api/admin/login") return loginAdmin(request, env);
  if (request.method === "GET" && url.pathname === "/api/account") return getAccount(request, env);
  if (request.method === "GET" && url.pathname === "/api/reports") return listReports(request, env);
  if (request.method === "POST" && url.pathname === "/api/reports") return createReport(request, env);
  if (request.method === "POST" && url.pathname === "/api/orders") return createOrder(request, env);
  const mockPayMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/mock-pay$/);
  if (request.method === "POST" && mockPayMatch) return markMockPaid(request, env, mockPayMatch[1]);
  if (request.method === "GET" && url.pathname === "/api/admin/overview") return getAdminOverview(request, env);
  return sendJson({ ok: false, message: "not found" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) return await handleApi(request, env);
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




