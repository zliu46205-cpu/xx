import http from "node:http";
import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildReport, validateIntake } from "../src/utils/report.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.join(__dirname, "storage");
const files = {
  reports: path.join(storageDir, "reports.json"),
  users: path.join(storageDir, "users.json"),
  orders: path.join(storageDir, "orders.json"),
  memberships: path.join(storageDir, "memberships.json"),
};
const port = Number(process.env.XUANXUE_API_PORT || 8787);
const sessionSecret = process.env.SESSION_SECRET || "local-dev-session-secret-change-before-deploy";

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
字段要求：summary 80-140 字；situation 160-260 字；tendency 120-220 字；inference 4-6 条；suggestions 5-7 条；stageAdvice 4 条，每条为 {title, symbol, real}；oracle 包含 mainHexagram, changedHexagram, score, firstTitle, secondTitle, guaci, xiangci, plainText, caution, similarCase；termGlossary 4-6 组。
根据方法使用对应术语：八字用日主/月令/十神/财官印食/大运流年；紫微用命宫/身宫/十二宫/三方四正/四化；梅花用本互变/体用/动爻/外应；六爻用世应/用神/六亲/六神/动变；奇门用九宫/八门/九星/八神/值符值使；风水用明堂/气口/动线/坐向/采光；起名用五行意象/音形义/避讳。
如果资料不足，要明确“按简化路径分析”，但仍要给出有区分度的判断。
`;

function stripCodeFence(text) {
  return String(text || "").replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
}

function extractResponseText(payload) {
  if (payload.output_text) return payload.output_text;
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n");
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
    generatedBy: "openai",
  };
  if (aiReport.oracle && typeof aiReport.oracle === "object") {
    next.oracle = { ...baseReport.oracle, ...aiReport.oracle };
  }
  return next;
}

async function generateAiReport(baseReport, values, method) {
  if (!process.env.OPENAI_API_KEY) return baseReport;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
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
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model,
      instructions: AI_REPORT_INSTRUCTIONS,
      input: `请基于以下输入生成更具体的商业级中文术数参考报告。只返回 JSON。\n${JSON.stringify(input)}`,
      temperature: 0.75,
      max_output_tokens: 2600,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const payload = await response.json();
  const parsed = JSON.parse(stripCodeFence(extractResponseText(payload)));
  return mergeAiReport(baseReport, parsed);
}
async function ensureStorage() {
  await mkdir(storageDir, { recursive: true });
  for (const file of Object.values(files)) {
    try { await readFile(file, "utf8"); } catch { await writeFile(file, "[]", "utf8"); }
  }
}

async function readList(file) {
  await ensureStorage();
  return JSON.parse((await readFile(file, "utf8")) || "[]");
}

async function saveList(file, rows) {
  await ensureStorage();
  await writeFile(file, JSON.stringify(rows, null, 2), "utf8");
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString("hex")}`;
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function hash(text) {
  return crypto.createHash("sha256").update(text).digest("base64url");
}

function sign(data) {
  return crypto.createHmac("sha256", sessionSecret).update(data).digest("base64url");
}

function createSession(user) {
  const body = base64url(JSON.stringify({ userId: user.id, email: user.email, name: user.name, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 }));
  return `${body}.${sign(body)}`;
}

function verifySession(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [body, sig] = token.split(".");
  if (!body || !sig || sign(body) !== sig) return null;
  const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  return session.exp > Date.now() ? session : null;
}

function requireSession(req, res) {
  const session = verifySession(req);
  if (!session) {
    sendJson(res, 401, { ok: false, message: "请先登录。" });
    return null;
  }
  return session;
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
  return { id: String(method.id || "integrated"), name: String(method.name || "综合咨询"), scene: String(method.scene || ""), need: String(method.need || ""), output: String(method.output || ""), unsuitable: String(method.unsuitable || "") };
}

function cents(amount) { return (Number(amount || 0) / 100).toFixed(2); }

function reportRow(row) {
  return { id: row.id, createdAt: row.createdAt, methodName: row.methodName, question: row.question, title: row.report?.title, summary: row.report?.summary };
}

function orderRow(row) {
  return { id: row.id, createdAt: row.createdAt, planId: row.planId, planName: row.planName, amount: row.amount, amountText: `¥${cents(row.amount)}`, status: row.status };
}

async function register(req, res) {
  const body = await readJson(req);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || email.split("@")[0] || "用户").slice(0, 40);
  if (!/^\S+@\S+\.\S+$/.test(email)) return sendJson(res, 422, { ok: false, message: "请输入有效邮箱。" });
  if (password.length < 8) return sendJson(res, 422, { ok: false, message: "密码至少 8 位。" });
  const users = await readList(files.users);
  if (users.some((item) => item.email === email)) return sendJson(res, 409, { ok: false, message: "该邮箱已注册。" });
  const salt = id("salt");
  const user = { id: id("user"), createdAt: new Date().toISOString(), email, name, salt, passwordHash: hash(`${salt}:${password}`), role: "user", status: "active", credits: 1 };
  users.push(user);
  await saveList(files.users, users);
  sendJson(res, 201, { ok: true, session: { token: createSession(user), user: { id: user.id, email, name, role: "user" } } });
}

async function login(req, res) {
  const body = await readJson(req);
  const email = String(body.email || "").trim().toLowerCase();
  const users = await readList(files.users);
  const user = users.find((item) => item.email === email && item.status === "active");
  if (!user || hash(`${user.salt}:${String(body.password || "")}`) !== user.passwordHash) return sendJson(res, 401, { ok: false, message: "账号或密码不正确。" });
  sendJson(res, 200, { ok: true, session: { token: createSession(user), user: { id: user.id, email: user.email, name: user.name, role: user.role } } });
}

async function adminLogin(req, res) {
  const body = await readJson(req);
  const account = process.env.ADMIN_ACCOUNT || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const code = process.env.ADMIN_CODE || "000000";
  if (body.account !== account || body.password !== password || body.code !== code) return sendJson(res, 401, { ok: false, message: "管理员账号、密码或口令不正确。" });
  const user = { id: "admin", email: account, name: "管理员", role: "admin" };
  sendJson(res, 200, { ok: true, session: { token: createSession(user), user } });
}

async function createReport(req, res) {
  const session = verifySession(req);
  const body = await readJson(req);
  const values = sanitizeValues(body.values);
  const method = sanitizeMethod(body.method);
  const errors = validateIntake(values);
  if (Object.keys(errors).length) return sendJson(res, 422, { ok: false, errors });
  let report = buildReport(values, method);
  try {
    report = await generateAiReport(report, values, method);
  } catch (error) {
    report = { ...report, generatedBy: "rules", aiError: "AI_GENERATION_FALLBACK" };
  }
  const rows = await readList(files.reports);
  rows.unshift({ id: report.id, createdAt: report.createdAt, userId: session?.role === "user" ? session.userId : null, methodId: method.id, methodName: method.name, question: values.question, concernType: values.concernType, report });
  await saveList(files.reports, rows.slice(0, 500));
  sendJson(res, 201, { ok: true, report, saved: true });
}

async function listReports(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const limit = Math.min(Number(url.searchParams.get("limit") || 8), 30);
  const session = verifySession(req);
  const rows = await readList(files.reports);
  const visible = session?.role === "user" ? rows.filter((item) => item.userId === session.userId) : rows;
  sendJson(res, 200, { ok: true, reports: visible.slice(0, limit).map(reportRow) });
}

async function account(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  const users = await readList(files.users);
  const reports = await readList(files.reports);
  const orders = await readList(files.orders);
  const memberships = await readList(files.memberships);
  const user = users.find((item) => item.id === session.userId) || session;
  sendJson(res, 200, { ok: true, user, membership: memberships.find((item) => item.userId === session.userId && item.status === "active") || null, stats: { reports: reports.filter((item) => item.userId === session.userId).length, orders: orders.filter((item) => item.userId === session.userId).length, credits: user.credits || 0 }, reports: reports.filter((item) => item.userId === session.userId).slice(0, 8).map(reportRow), orders: orders.filter((item) => item.userId === session.userId).slice(0, 8).map(orderRow) });
}

async function createOrder(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  const body = await readJson(req);
  const plan = PLANS[String(body.planId || "")];
  if (!plan) return sendJson(res, 404, { ok: false, message: "套餐不存在。" });
  const now = new Date().toISOString();
  const order = { id: id("order"), createdAt: now, updatedAt: now, userId: session.userId, planId: body.planId, planName: plan.name, amount: plan.amount, currency: "CNY", status: plan.amount === 0 ? "paid" : "pending", provider: "manual" };
  const orders = await readList(files.orders);
  orders.unshift(order);
  await saveList(files.orders, orders);
  sendJson(res, 201, { ok: true, order: orderRow(order) });
}

async function mockPay(req, res, orderId) {
  const session = requireSession(req, res);
  if (!session) return;
  const orders = await readList(files.orders);
  const order = orders.find((item) => item.id === orderId && item.userId === session.userId);
  if (!order) return sendJson(res, 404, { ok: false, message: "订单不存在。" });
  order.status = "paid";
  order.updatedAt = new Date().toISOString();
  order.paidAt = order.updatedAt;
  await saveList(files.orders, orders);
  sendJson(res, 200, { ok: true, order: orderRow(order) });
}

async function adminOverview(req, res) {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") return sendJson(res, 403, { ok: false, message: "需要管理员权限。" });
  const users = await readList(files.users);
  const reports = await readList(files.reports);
  const orders = await readList(files.orders);
  const paid = orders.filter((item) => item.status === "paid");
  const revenue = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  sendJson(res, 200, { ok: true, metrics: { users: users.length, reports: reports.length, orders: orders.length, paidOrders: paid.length, revenue, revenueText: `¥${cents(revenue)}` }, orders: orders.slice(0, 12).map(orderRow), reports: reports.slice(0, 12).map(reportRow) });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    if (req.method === "GET" && url.pathname === "/api/health") return sendJson(res, 200, { ok: true, service: "xuanxue-api", ai: process.env.OPENAI_API_KEY ? "configured" : "not-configured", model: process.env.OPENAI_MODEL || "gpt-4.1-mini" });
    if (req.method === "POST" && url.pathname === "/api/auth/register") return register(req, res);
    if (req.method === "POST" && url.pathname === "/api/auth/login") return login(req, res);
    if (req.method === "POST" && url.pathname === "/api/admin/login") return adminLogin(req, res);
    if (req.method === "GET" && url.pathname === "/api/account") return account(req, res);
    if (req.method === "GET" && url.pathname === "/api/reports") return listReports(req, res);
    if (req.method === "POST" && url.pathname === "/api/reports") return createReport(req, res);
    if (req.method === "POST" && url.pathname === "/api/orders") return createOrder(req, res);
    const match = url.pathname.match(/^\/api\/orders\/([^/]+)\/mock-pay$/);
    if (req.method === "POST" && match) return mockPay(req, res, match[1]);
    if (req.method === "GET" && url.pathname === "/api/admin/overview") return adminOverview(req, res);
    sendJson(res, 404, { ok: false, message: "not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
});

await ensureStorage();
server.listen(port, "127.0.0.1", () => {
  console.log(`xuanxue api listening on http://127.0.0.1:${port}`);
});

