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

const API_VERSION = "deepseek-json-v5";

const PLANS = {
  free: { name: "免费试测", amount: 0, credits: 1, type: "free" },
  single: { name: "标准/深度体验包", amount: 1990, credits: 3, type: "credits" },
  monthly: { name: "月卡会员", amount: 9900, credits: 30, type: "membership", days: 30 },
  yearly: { name: "年卡会员", amount: 39900, credits: 420, type: "membership", days: 365 },
  review: { name: "人工复核", amount: 29900, credits: 1, type: "service" },
};

const REPORT_TIERS = {
  free: { name: "免费简版", maxTokens: 2400, creditCost: 0, guidance: "免费简版只输出关键结论、核心依据、3-4条建议；保留悬念但不制造焦虑；不要暗示付费才能避灾。" },
  standard: { name: "标准报告", maxTokens: 3400, creditCost: 1, guidance: "标准报告输出完整结构：依据、推演、倾向、建议、边界；术语和白话都要兼顾。" },
  deep: { name: "深度报告", maxTokens: 4600, creditCost: 3, guidance: "深度报告增加假设限制、阶段拆解、术语解释、行动清单和复盘问题；仍不得恐吓或保证结果。" },
};

function normalizeReportTier(value) {
  return REPORT_TIERS[value] ? value : "free";
}

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
  return payload?.choices?.[0]?.message?.content || "";
}

function parseAiJson(text) {
  const raw = stripCodeFence(text);
  try {
    return JSON.parse(raw);
  } catch (error) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw error;
  }
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
    reportTier: baseReport.reportTier,
    reportTierName: baseReport.reportTierName,
    generatedBy: "deepseek",
  };
  if (aiReport.oracle && typeof aiReport.oracle === "object") {
    next.oracle = { ...baseReport.oracle, ...aiReport.oracle };
  }
  return next;
}

async function generateAiReport(baseReport, values, method) {
  if (!process.env.DEEPSEEK_API_KEY) return baseReport;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const reportTier = normalizeReportTier(values.reportTier);
  const tier = REPORT_TIERS[reportTier];
  const input = {
    method,
    reportTier,
    tierGuidance: tier.guidance,
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
      reportTier: values.reportTier,
    },
    baseReport,
  };
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: AI_REPORT_INSTRUCTIONS },
          { role: "user", content: `请基于以下输入生成${tier.name}。档位要求：${tier.guidance}。只返回 JSON，不要 Markdown。\n${JSON.stringify(input)}` },
        ],
        temperature: attempt === 0 ? 0.75 : 0.35,
        response_format: { type: "json_object" },
        max_tokens: tier.maxTokens + (attempt === 0 ? 0 : 800),
      }),
    });
    if (!response.ok) throw new Error(`DeepSeek request failed: ${response.status}`);
    const payload = await response.json();
    const text = stripCodeFence(extractResponseText(payload));
    try {
      const parsed = parseAiJson(text);
      return mergeAiReport(baseReport, parsed);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("DeepSeek JSON parse failed");
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
    reportTier: normalizeReportTier(values.reportTier),
    privacyAccepted: Boolean(values.privacyAccepted),
  };
}

function evaluateHighRiskQuery(values) {
  const text = [values.question, values.background, values.focusProblem, values.options, values.nameBase].filter(Boolean).join(" ");
  const rules = [
    { code: "DEATH", pattern: /(死期|死亡时间|什么时候死|活不过|寿命还有|会不会死)/, label: "死亡或寿命预测" },
    { code: "MEDICAL", pattern: /(诊断|癌症|肿瘤|手术|吃什么药|停药|治病|病能不能好|怀孕能不能保住)/, label: "医疗诊断或治疗" },
    { code: "GAMBLING", pattern: /(彩票|博彩|赌博|时时彩|北京赛车|中奖号码|双色球|大乐透)/, label: "博彩或彩票预测" },
    { code: "INVESTMENT", pattern: /(股票买哪|股票涨跌|币圈杠杆|合约做多|合约做空|期货买卖|荐股)/, label: "投资买卖指令" },
    { code: "HARM", pattern: /(诅咒|害人|下降头|报复|让他倒霉|做法害|蛊术)/, label: "伤害他人或诅咒" },
    { code: "FEAR_UPSELL", pattern: /(付费消灾|花钱改命|法事保证|保证复合|保证发财|破灾套餐)/, label: "恐吓式付费或保证承诺" },
  ];
  const hit = rules.find((rule) => rule.pattern.test(text));
  if (!hit) return null;
  return {
    ok: false,
    code: "HIGH_RISK_QUERY",
    category: hit.code,
    message: `这个问题涉及${hit.label}，本平台不能提供断言、指令或恐吓式判断。可以改问为：当前处境有哪些可整理的因素、接下来如何做现实规划、如何沟通或寻求专业帮助。`,
  };
}
function sanitizeMethod(method = {}) {
  return { id: String(method.id || "integrated"), name: String(method.name || "综合咨询"), scene: String(method.scene || ""), need: String(method.need || ""), output: String(method.output || ""), unsuitable: String(method.unsuitable || "") };
}

function cents(amount) { return (Number(amount || 0) / 100).toFixed(2); }

function reportRow(row) {
  return { id: row.id, createdAt: row.createdAt, methodName: row.methodName, question: row.question, title: row.report?.title, summary: row.report?.summary, adminReview: row.report?.adminReview || null };
}

function userRow(row) {
  return { id: row.id, createdAt: row.createdAt, email: row.email, name: row.name, role: row.role, status: row.status, credits: row.credits || 0 };
}

function orderRow(row) {
  return { id: row.id, userId: row.userId, createdAt: row.createdAt, paidAt: row.paidAt, planId: row.planId, planName: row.planName, amount: row.amount, amountText: `¥${cents(row.amount)}`, status: row.status, provider: row.provider || "manual" };
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
  const highRisk = evaluateHighRiskQuery(values);
  if (highRisk) return sendJson(res, 422, highRisk);
  const errors = validateIntake(values);
  if (Object.keys(errors).length) return sendJson(res, 422, { ok: false, errors });
  const tierInfo = REPORT_TIERS[values.reportTier];
  const creditCost = tierInfo.creditCost || 0;
  let users = null;
  let user = null;
  if (creditCost > 0) {
    if (!session?.userId || session.role !== "user") {
      return sendJson(res, 401, { ok: false, code: "LOGIN_REQUIRED", message: "标准报告和深度报告需要先登录，并消耗账户次数。" });
    }
    users = await readList(files.users);
    user = users.find((item) => item.id === session.userId && item.status === "active");
    if (!user || Number(user.credits || 0) < creditCost) {
      return sendJson(res, 402, { ok: false, code: "INSUFFICIENT_CREDITS", message: `当前剩余次数不足。${tierInfo.name}需要 ${creditCost} 次，请先购买套餐或选择免费简版。`, requiredCredits: creditCost, currentCredits: Number(user?.credits || 0) });
    }
  }
  let report = buildReport(values, method);
  report = { ...report, reportTier: values.reportTier, reportTierName: REPORT_TIERS[values.reportTier].name };
  try {
    report = await generateAiReport(report, values, method);
  } catch (error) {
    report = { ...report, generatedBy: "rules", aiError: String(error?.message || "AI_GENERATION_FALLBACK").slice(0, 180) };
  }
  if (creditCost > 0 && report.generatedBy !== "deepseek") {
    return sendJson(res, 503, { ok: false, code: "PAID_REPORT_AI_UNAVAILABLE", message: "深度生成服务暂时不可用，本次未扣次数。请稍后重试，或先生成免费简版。", aiError: report.aiError || "AI_GENERATION_FALLBACK" });
  }
  const rows = await readList(files.reports);
  rows.unshift({ id: report.id, createdAt: report.createdAt, userId: session?.role === "user" ? session.userId : null, methodId: method.id, methodName: method.name, question: values.question, concernType: values.concernType, report });
  await saveList(files.reports, rows.slice(0, 500));
  if (creditCost > 0 && user && users) {
    user.credits = Math.max(Number(user.credits || 0) - creditCost, 0);
    await saveList(files.users, users);
    report = { ...report, creditCost };
  }
  sendJson(res, 201, { ok: true, report, saved: true, creditCost });
}

async function listReports(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const limit = Math.min(Number(url.searchParams.get("limit") || 8), 30);
  const session = verifySession(req);
  const rows = await readList(files.reports);
  const visible = session?.role === "user" ? rows.filter((item) => item.userId === session.userId) : rows;
  sendJson(res, 200, { ok: true, reports: visible.slice(0, limit).map(reportRow) });
}

async function reportDetail(req, res, reportId) {
  const session = requireSession(req, res);
  if (!session) return;
  const rows = await readList(files.reports);
  const row = rows.find((item) => item.id === reportId && (session.role === "admin" || item.userId === session.userId));
  if (!row) return sendJson(res, 404, { ok: false, message: "???????????" });
  sendJson(res, 200, { ok: true, report: row.report, record: reportRow(row) });
}


async function exportAccountData(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.role !== "user") return sendJson(res, 403, { ok: false, message: "管理员账号不支持用户数据导出。" });
  const users = await readList(files.users);
  const reports = await readList(files.reports);
  const orders = await readList(files.orders);
  const memberships = await readList(files.memberships);
  const user = users.find((item) => item.id === session.userId) || null;
  sendJson(res, 200, { ok: true, exportedAt: new Date().toISOString(), user, reports: reports.filter((item) => item.userId === session.userId), orders: orders.filter((item) => item.userId === session.userId).map(orderRow), memberships: memberships.filter((item) => item.userId === session.userId) });
}

async function deleteAccountData(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.role !== "user") return sendJson(res, 403, { ok: false, message: "管理员账号不能通过用户入口注销。" });
  const body = await readJson(req);
  if (String(body.confirm || "") !== "DELETE") return sendJson(res, 422, { ok: false, message: "请传入 confirm=DELETE 以确认注销。" });
  const users = await readList(files.users);
  const user = users.find((item) => item.id === session.userId);
  if (user) {
    user.email = `deleted-${session.userId}@deleted.local`;
    user.name = "已注销用户";
    user.status = "disabled";
    user.credits = 0;
    await saveList(files.users, users);
  }
  await saveList(files.reports, (await readList(files.reports)).filter((item) => item.userId !== session.userId));
  await saveList(files.orders, (await readList(files.orders)).filter((item) => item.userId !== session.userId));
  await saveList(files.memberships, (await readList(files.memberships)).filter((item) => item.userId !== session.userId));
  sendJson(res, 200, { ok: true, message: "账户资料已删除并停用。" });
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
  if (plan.amount === 0) await applyPlanBenefits(order);
  sendJson(res, 201, { ok: true, order: orderRow(order) });
}


async function orderDetail(req, res, orderId) {
  const session = requireSession(req, res);
  if (!session) return;
  const orders = await readList(files.orders);
  const order = orders.find((item) => item.id === orderId && (session.role === "admin" || item.userId === session.userId));
  if (!order) return sendJson(res, 404, { ok: false, message: "订单不存在或无权查看。" });
  sendJson(res, 200, { ok: true, order: orderRow(order) });
}
async function mockPay(req, res, orderId) {
  const session = requireSession(req, res);
  if (!session) return;
  const orders = await readList(files.orders);
  const order = orders.find((item) => item.id === orderId && item.userId === session.userId);
  if (!order) return sendJson(res, 404, { ok: false, message: "订单不存在。" });
  if (order.status === "paid") return sendJson(res, 200, { ok: true, order: orderRow(order) });
  order.status = "paid";
  order.updatedAt = new Date().toISOString();
  order.paidAt = order.updatedAt;
  await saveList(files.orders, orders);
  await applyPlanBenefits(order);
  sendJson(res, 200, { ok: true, order: orderRow(order) });
}

async function applyPlanBenefits(order) {
  const plan = PLANS[order.planId];
  if (plan?.credits) {
    const users = await readList(files.users);
    const user = users.find((item) => item.id === order.userId);
    if (user) {
      user.credits = Number(user.credits || 0) + plan.credits;
      await saveList(files.users, users);
    }
  }
  if (plan?.type === "membership") {
    const memberships = await readList(files.memberships);
    const endAt = new Date(Date.now() + plan.days * 86400000).toISOString();
    memberships.unshift({ id: id("mem"), userId: order.userId, planId: order.planId, planName: plan.name, startAt: order.paidAt || new Date().toISOString(), endAt, status: "active" });
    await saveList(files.memberships, memberships.slice(0, 500));
  }
}

async function updateAdminUser(req, res, userId) {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") return sendJson(res, 403, { ok: false, message: "需要管理员权限。" });
  const body = await readJson(req);
  const users = await readList(files.users);
  const user = users.find((item) => item.id === userId);
  if (!user) return sendJson(res, 404, { ok: false, message: "用户不存在。" });
  const creditsDelta = Number(body.creditsDelta || 0);
  const status = String(body.status || "").trim();
  if (!Number.isFinite(creditsDelta) || Math.abs(creditsDelta) > 999) return sendJson(res, 422, { ok: false, message: "次数调整必须在 -999 到 999 之间。" });
  if (status && !["active", "disabled"].includes(status)) return sendJson(res, 422, { ok: false, message: "用户状态只支持 active 或 disabled。" });
  user.credits = Math.max(Number(user.credits || 0) + creditsDelta, 0);
  user.status = status || user.status || "active";
  await saveList(files.users, users);
  sendJson(res, 200, { ok: true, user: userRow(user), message: "用户权益已更新。" });
}

async function markAdminOrderPaid(req, res, orderId) {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") return sendJson(res, 403, { ok: false, message: "需要管理员权限。" });
  const orders = await readList(files.orders);
  const order = orders.find((item) => item.id === orderId);
  if (!order) return sendJson(res, 404, { ok: false, message: "订单不存在。" });
  if (order.status === "paid") return sendJson(res, 200, { ok: true, order: orderRow(order), message: "订单已是已支付状态。" });
  order.status = "paid";
  order.updatedAt = new Date().toISOString();
  order.paidAt = order.updatedAt;
  await saveList(files.orders, orders);
  await applyPlanBenefits(order);
  sendJson(res, 200, { ok: true, order: orderRow(order), message: "订单已确认并发放权益。" });
}

async function reviewAdminReport(req, res, reportId) {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") return sendJson(res, 403, { ok: false, message: "需要管理员权限。" });
  const body = await readJson(req);
  const status = String(body.status || "pending").trim();
  const note = String(body.note || "").slice(0, 180);
  if (!["pending", "approved", "needs_review", "hidden"].includes(status)) return sendJson(res, 422, { ok: false, message: "报告状态不正确。" });
  const reports = await readList(files.reports);
  const row = reports.find((item) => item.id === reportId);
  if (!row) return sendJson(res, 404, { ok: false, message: "报告不存在。" });
  row.report = { ...(row.report || {}), adminReview: { status, note, reviewedAt: new Date().toISOString(), reviewer: session.email || "admin" } };
  await saveList(files.reports, reports);
  sendJson(res, 200, { ok: true, report: reportRow(row), message: "报告审核状态已更新。" });
}

async function notifyPayment(req, res) {
  const body = await readJson(req);
  const configuredSecret = String(process.env.PAYMENT_WEBHOOK_SECRET || "");
  const providedSecret = req.headers["x-payment-secret"] || String(body.secret || "");
  if (!configuredSecret || configuredSecret.length < 16) return sendJson(res, 503, { ok: false, code: "PAYMENT_WEBHOOK_NOT_CONFIGURED", message: "请先配置 PAYMENT_WEBHOOK_SECRET，用于支付回调验签。" });
  if (providedSecret !== configuredSecret) return sendJson(res, 401, { ok: false, code: "INVALID_PAYMENT_SECRET", message: "支付通知签名不正确。" });
  const orderId = String(body.orderId || body.order_id || "").trim();
  if (!orderId) return sendJson(res, 422, { ok: false, message: "缺少订单号。" });
  const orders = await readList(files.orders);
  const order = orders.find((item) => item.id === orderId);
  if (!order) return sendJson(res, 404, { ok: false, message: "订单不存在。" });
  if (order.status === "paid") return sendJson(res, 200, { ok: true, idempotent: true, order: orderRow(order), message: "订单已支付，重复通知已忽略。" });
  order.status = "paid";
  order.updatedAt = new Date().toISOString();
  order.paidAt = order.updatedAt;
  order.provider = String(body.provider || "webhook").slice(0, 40);
  await saveList(files.orders, orders);
  await applyPlanBenefits(order);
  sendJson(res, 200, { ok: true, idempotent: false, order: orderRow(order), message: "支付通知已确认，权益已发放。" });
}
async function adminOverview(req, res) {
  const session = requireSession(req, res);
  if (!session || session.role !== "admin") return sendJson(res, 403, { ok: false, message: "需要管理员权限。" });
  const url = new URL(req.url, `http://${req.headers.host}`);
  const status = String(url.searchParams.get("status") || "all");
  const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
  const users = await readList(files.users);
  const reports = await readList(files.reports);
  const orders = await readList(files.orders);
  const paid = orders.filter((item) => item.status === "paid");
  const revenue = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const filterText = (item) => JSON.stringify(item).toLowerCase().includes(q);
  const filteredOrders = orders.filter((item) => (status === "all" || item.status === status) && (!q || filterText(item)));
  const filteredUsers = users.filter((item) => !q || filterText(item));
  const filteredReports = reports.filter((item) => !q || filterText(item));
  sendJson(res, 200, { ok: true, filters: { status, q }, metrics: { users: users.length, reports: reports.length, orders: orders.length, paidOrders: paid.length, revenue, revenueText: `¥${cents(revenue)}` }, users: filteredUsers.slice(0, 20).map(userRow), orders: filteredOrders.slice(0, 20).map(orderRow), reports: filteredReports.slice(0, 20).map(reportRow) });
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    if (req.method === "GET" && url.pathname === "/api/health") return sendJson(res, 200, { ok: true, service: "xuanxue-api", version: API_VERSION, ai: process.env.DEEPSEEK_API_KEY ? "configured" : "not-configured", model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash" });
    if (req.method === "POST" && url.pathname === "/api/auth/register") return register(req, res);
    if (req.method === "POST" && url.pathname === "/api/auth/login") return login(req, res);
    if (req.method === "POST" && url.pathname === "/api/admin/login") return adminLogin(req, res);
    if (req.method === "GET" && url.pathname === "/api/account") return account(req, res);
    if (req.method === "GET" && url.pathname === "/api/account/export") return exportAccountData(req, res);
    if (req.method === "POST" && url.pathname === "/api/account/delete") return deleteAccountData(req, res);
    if (req.method === "GET" && url.pathname === "/api/reports") return listReports(req, res);
    const reportMatch = url.pathname.match(/^\/api\/reports\/([^/]+)$/);
    if (req.method === "GET" && reportMatch) return reportDetail(req, res, reportMatch[1]);
    if (req.method === "POST" && url.pathname === "/api/reports") return createReport(req, res);
    if (req.method === "POST" && url.pathname === "/api/orders") return createOrder(req, res);
    if (req.method === "POST" && url.pathname === "/api/payments/notify") return notifyPayment(req, res);
    const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (req.method === "GET" && orderMatch) return orderDetail(req, res, orderMatch[1]);
    const match = url.pathname.match(/^\/api\/orders\/([^/]+)\/mock-pay$/);
    if (req.method === "POST" && match) return mockPay(req, res, match[1]);
    if (req.method === "GET" && url.pathname === "/api/admin/overview") return adminOverview(req, res);
    const adminUserMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (req.method === "POST" && adminUserMatch) return updateAdminUser(req, res, adminUserMatch[1]);
    const adminOrderMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/mark-paid$/);
    if (req.method === "POST" && adminOrderMatch) return markAdminOrderPaid(req, res, adminOrderMatch[1]);
    const adminReportMatch = url.pathname.match(/^\/api\/admin\/reports\/([^/]+)\/review$/);
    if (req.method === "POST" && adminReportMatch) return reviewAdminReport(req, res, adminReportMatch[1]);
    sendJson(res, 404, { ok: false, message: "not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
});

await ensureStorage();
server.listen(port, "127.0.0.1", () => {
  console.log(`xuanxue api listening on http://127.0.0.1:${port}`);
});

