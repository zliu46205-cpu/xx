import { buildReport, validateIntake } from "../src/utils/report.js";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
};

const API_VERSION = "deepseek-json-v4";

const PAYMENT_PROVIDERS = new Set(["manual", "generic_hmac", "wechat", "alipay", "stripe"]);

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

const METHOD_DETAIL_GUIDES = {
  bazi: "八字报告必须围绕日主、月令、十神、财官印食、调候、大运流年展开。事业问重点看官杀印星与食伤输出；姻缘问重点看夫妻星、关系节奏与现实边界；财运问重点看财星承载与风险。不得只写泛泛性格。",
  ziwei: "紫微报告必须围绕命宫、身宫、十二宫、三方四正、四化展开。要说明所问事项落在哪些宫位，哪一宫代表本人、哪一宫代表对象或事业资源。不得只列星名。",
  meihua: "梅花报告必须围绕本卦、互卦、变卦、体用、生克、动爻、外应展开。要说明当前、内里、后续三层，不得只写吉凶。",
  liuyao: "六爻报告必须围绕用神、世应、六亲、六神、动变、伏神、应期倾向展开。必须先定用神，再解释世应关系。未输入正式卦象时要说明为简化模拟。",
  coins: "铜钱占卜报告必须围绕三钱六掷、本卦、变卦、动爻、卦辞、象辞展开。要把卦意翻译成选择建议和观察点，不得只解释卦名。",
  qimen: "奇门报告必须围绕九宫、八门、九星、八神、值符值使、用神落宫展开。适合策略、方向、时机、谈判，必须给出可执行路径。",
  fengshui: "风水报告必须围绕明堂、气口、动线、坐向、采光、形煞、功能区展开。优先给空间调整，不推销物品，不恐吓。",
  naming: "起名报告必须围绕五行意象、音形义、字形、谐音、避讳、传播场景展开。要给候选方向或筛选规则，不承诺改命。",
  integrated: "综合咨询必须先拆问题类型，再说明更适合八字、紫微、梅花、六爻、奇门、风水或起名中的哪一种。重点是把用户问题整理成可执行步骤。"
};

function detectQuestionScene(values = {}) {
  const text = [values.question, values.concernType, values.focusProblem, values.background, values.options].filter(Boolean).join(" ");
  if (/(工作|事业|跳槽|offer|创业|升职|项目|面试|客户|转行|失业)/.test(text)) return "事业工作";
  if (/(感情|姻缘|桃花|复合|恋爱|结婚|合婚|对象|分手|喜欢|前任|婚姻|脱单)/.test(text)) return "姻缘关系";
  if (/(财|钱|收入|生意|订单|副业|借钱|债|亏|盈利|赚钱)/.test(text)) return "财运经营";
  if (/(学习|考试|考研|证书|上岸|录取|成绩|备考|学校)/.test(text)) return "学业考试";
  if (/(搬家|装修|户型|房间|办公室|床|桌|门|窗|灶)/.test(text)) return "空间风水";
  if (/(名字|起名|店名|品牌|公司名|宝宝|账号|改名)/.test(text)) return "命名取象";
  if (/(什么时候|哪天|择日|开业|签约|出行|发布|上线)/.test(text)) return "择时择日";
  return "综合处境";
}
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
禁止套模板：每次必须根据 method.id、questionScene、用户原问题、资料完整度、报告档位生成不同的主象、推演重点和建议，不得输出与其他术数相同的泛化段落。
白话要给普通用户看得懂，但术语必须出现且解释清楚：先术语取象，再白话翻译，再现实行动。
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

async function generateAiReport(baseReport, values, method, env) {
  if (!env.DEEPSEEK_API_KEY) return baseReport;
  const model = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const reportTier = normalizeReportTier(values.reportTier);
  const tier = REPORT_TIERS[reportTier];
  const input = {
    method,
    methodGuide: METHOD_DETAIL_GUIDES[method.id] || METHOD_DETAIL_GUIDES.integrated,
    questionScene: detectQuestionScene(values),
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
        { role: "user", content: `请基于以下输入生成${tier.name}。档位要求：${tier.guidance}。术数专项要求：${input.methodGuide}。问题场景：${input.questionScene}。请明显区分本方法和其他方法，避免套话。只返回 JSON，不要 Markdown。\n${JSON.stringify(input)}` },
      ],
      temperature: 0.75,
      response_format: { type: "json_object" },
      max_tokens: tier.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status}`);
  }
  const payload = await response.json();
  const text = stripCodeFence(extractResponseText(payload));
  const parsed = parseAiJson(text);
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

function normalizePaymentProvider(value) {
  const provider = String(value || "manual").trim().toLowerCase();
  return PAYMENT_PROVIDERS.has(provider) ? provider : "manual";
}

function getClientIp(request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
}

async function createAuditLog(env, actorId, action, targetType, targetId, detail = {}) {
  if (!env.DB) return;
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, created_at, actor_id, action, target_type, target_id, detail_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(makeId("audit"), new Date().toISOString(), actorId || "system", action, targetType || "system", targetId || "", JSON.stringify(detail).slice(0, 2000)).run().catch(() => null);
}

async function paymentSignature(secret, payload) {
  if (!secret) return "";
  return hmac(payload, secret);
}

async function buildCheckoutUrl(order, provider, env) {
  if (Number(order.amount || 0) <= 0) return "";
  const baseUrl = String(env.PAYMENT_CHECKOUT_BASE_URL || "").trim();
  if (!baseUrl) return "";
  const secret = String(env.PAYMENT_CHECKOUT_SECRET || env.PAYMENT_WEBHOOK_SECRET || "");
  const payload = `${order.id}.${order.amount}.${order.user_id}.${provider}`;
  const sign = await paymentSignature(secret, payload);
  const url = new URL(baseUrl);
  url.searchParams.set("orderId", order.id);
  url.searchParams.set("amount", String(order.amount));
  url.searchParams.set("provider", provider);
  url.searchParams.set("plan", order.plan_id);
  if (sign) url.searchParams.set("sign", sign);
  return url.toString();
}

async function verifyPaymentNotice(request, bodyText, body, env) {
  const provider = normalizePaymentProvider(body.provider || body.channel);
  const configuredSecret = String(env.PAYMENT_WEBHOOK_SECRET || "");
  if (!configuredSecret || configuredSecret.length < 16) {
    return { ok: false, response: sendJson({ ok: false, code: "PAYMENT_WEBHOOK_NOT_CONFIGURED", message: "请先配置 PAYMENT_WEBHOOK_SECRET，用于支付回调验签。" }, 503) };
  }
  if (provider === "generic_hmac") {
    const timestamp = request.headers.get("x-payment-timestamp") || String(body.timestamp || "");
    const signature = request.headers.get("x-payment-signature") || String(body.signature || "");
    const expected = await hmac(`${timestamp}.${bodyText}`, configuredSecret);
    if (!timestamp || !signature || signature !== expected) {
      return { ok: false, response: sendJson({ ok: false, code: "INVALID_PAYMENT_SIGNATURE", message: "支付通知签名不正确。" }, 401) };
    }
    return { ok: true, provider };
  }
  const providedSecret = request.headers.get("x-payment-secret") || String(body.secret || "");
  if (providedSecret !== configuredSecret) {
    return { ok: false, response: sendJson({ ok: false, code: "INVALID_PAYMENT_SECRET", message: "支付通知密钥不正确。" }, 401) };
  }
  return { ok: true, provider };
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


async function exportAccountData(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  if (auth.session.role !== "user") return sendJson({ ok: false, message: "管理员账号不支持用户数据导出。" }, 403);
  const user = await env.DB.prepare(`SELECT id, created_at, email, name, role, status, credits FROM users WHERE id = ?`).bind(auth.session.userId).first();
  const reports = await env.DB.prepare(`SELECT id, created_at, method_id, method_name, question, concern_type, report_json FROM reports WHERE user_id = ? ORDER BY created_at DESC`).bind(auth.session.userId).all().catch(() => ({ results: [] }));
  const orders = await env.DB.prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`).bind(auth.session.userId).all().catch(() => ({ results: [] }));
  const memberships = await env.DB.prepare(`SELECT * FROM memberships WHERE user_id = ? ORDER BY end_at DESC`).bind(auth.session.userId).all().catch(() => ({ results: [] }));
  return sendJson({ ok: true, exportedAt: new Date().toISOString(), user, reports: reports.results || [], orders: (orders.results || []).map(formatOrderRecord), memberships: memberships.results || [] });
}

async function deleteAccountData(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  if (auth.session.role !== "user") return sendJson({ ok: false, message: "管理员账号不能通过用户入口注销。" }, 403);
  const body = await readJson(request);
  if (String(body.confirm || "") !== "DELETE") {
    return sendJson({ ok: false, message: "请传入 confirm=DELETE 以确认注销。" }, 422);
  }
  await env.DB.prepare(`DELETE FROM reports WHERE user_id = ?`).bind(auth.session.userId).run().catch(() => null);
  await env.DB.prepare(`DELETE FROM memberships WHERE user_id = ?`).bind(auth.session.userId).run().catch(() => null);
  await env.DB.prepare(`DELETE FROM orders WHERE user_id = ?`).bind(auth.session.userId).run().catch(() => null);
  await env.DB.prepare(`UPDATE users SET email = ?, name = '已注销用户', status = 'disabled', credits = 0 WHERE id = ?`).bind(`deleted-${auth.session.userId}@deleted.local`, auth.session.userId).run();
  await createAuditLog(env, auth.session.userId, "account.delete", "user", auth.session.userId, { selfService: true });
  return sendJson({ ok: true, message: "账户资料已删除并停用。" });
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
  return { id: item.id, createdAt: item.created_at, methodName: item.method_name, question: item.question, title: report.title, summary: report.summary, adminReview: report.adminReview || null };
}

function formatOrderRecord(item) {
  return { id: item.id, userId: item.user_id, createdAt: item.created_at, paidAt: item.paid_at, planId: item.plan_id, planName: item.plan_name, amount: item.amount, amountText: `¥${centsToYuan(item.amount)}`, status: item.status, provider: item.provider || "manual" };
}

function formatUserRecord(item) {
  return { id: item.id, createdAt: item.created_at, email: item.email, name: item.name, role: item.role, status: item.status, credits: item.credits || 0 };
}

async function createReport(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const session = await verifySession(request, env).catch(() => null);
  const body = await readJson(request);
  const values = sanitizeValues(body.values);
  const method = sanitizeMethod(body.method);
  const highRisk = evaluateHighRiskQuery(values);
  if (highRisk) return sendJson(highRisk, 422);
  const errors = validateIntake(values);
  if (Object.keys(errors).length) return sendJson({ ok: false, errors }, 422);
  const tierInfo = REPORT_TIERS[values.reportTier];
  const creditCost = tierInfo.creditCost || 0;
  let user = null;
  if (creditCost > 0) {
    if (!session?.userId || session.role !== "user") {
      return sendJson({ ok: false, code: "LOGIN_REQUIRED", message: "标准报告和深度报告需要先登录，并消耗账户次数。" }, 401);
    }
    user = await env.DB.prepare(`SELECT id, credits FROM users WHERE id = ? AND status = 'active'`).bind(session.userId).first();
    if (!user || Number(user.credits || 0) < creditCost) {
      return sendJson({ ok: false, code: "INSUFFICIENT_CREDITS", message: `当前剩余次数不足。${tierInfo.name}需要 ${creditCost} 次，请先购买套餐或选择免费简版。`, requiredCredits: creditCost, currentCredits: Number(user?.credits || 0) }, 402);
    }
  }

  let report = buildReport(values, method);
  report = { ...report, reportTier: values.reportTier, reportTierName: REPORT_TIERS[values.reportTier].name };
  try {
    report = await generateAiReport(report, values, method, env);
  } catch (error) {
    report = { ...report, generatedBy: "rules", aiError: String(error?.message || "AI_GENERATION_FALLBACK").slice(0, 180) };
  }
  if (creditCost > 0 && report.generatedBy !== "deepseek") {
    return sendJson({ ok: false, code: "PAID_REPORT_AI_UNAVAILABLE", message: "深度生成服务暂时不可用，本次未扣次数。请稍后重试，或先生成免费简版。", aiError: report.aiError || "AI_GENERATION_FALLBACK" }, 503);
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
  if (creditCost > 0) {
    await env.DB.prepare(`UPDATE users SET credits = MAX(COALESCE(credits, 0) - ?, 0) WHERE id = ?`).bind(creditCost, session.userId).run().catch(() => null);
    report = { ...report, creditCost };
  }
  return sendJson({ ok: true, report, saved: true, creditCost }, 201);
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

async function getReportDetail(request, env, reportId) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  const row = auth.session.role === "admin"
    ? await env.DB.prepare(`SELECT id, created_at, method_name, question, report_json FROM reports WHERE id = ?`).bind(reportId).first()
    : await env.DB.prepare(`SELECT id, created_at, method_name, question, report_json FROM reports WHERE id = ? AND user_id = ?`).bind(reportId, auth.session.userId).first();
  if (!row) return sendJson({ ok: false, message: "报告不存在或无权查看。" }, 404);
  let report = {};
  try { report = JSON.parse(row.report_json || "{}"); } catch {}
  return sendJson({ ok: true, report: { ...report, id: report.id || row.id, createdAt: report.createdAt || row.created_at }, record: formatReportRecord(row) });
}

async function createOrder(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  if (auth.session.role !== "user") return sendJson({ ok: false, message: "管理员不创建用户订单。" }, 403);
  const body = await readJson(request);
  const planId = String(body.planId || "");
  const plan = PLANS[planId];
  if (!plan) return sendJson({ ok: false, message: "套餐不存在。" }, 404);
  const provider = normalizePaymentProvider(body.provider || env.DEFAULT_PAYMENT_PROVIDER || "manual");
  const now = new Date().toISOString();
  const id = makeId("order");
  const status = plan.amount === 0 ? "paid" : "pending";
  const order = { id, user_id: auth.session.userId, plan_id: planId, amount: plan.amount };
  const checkoutUrl = await buildCheckoutUrl(order, provider, env);
  await env.DB.prepare(
    `INSERT INTO orders (id, created_at, updated_at, user_id, plan_id, plan_name, amount, currency, status, provider, checkout_url) VALUES (?, ?, ?, ?, ?, ?, ?, 'CNY', ?, ?, ?)`,
  ).bind(id, now, now, auth.session.userId, planId, plan.name, plan.amount, status, provider, checkoutUrl).run();
  if (plan.amount === 0) {
    await env.DB.prepare(`UPDATE users SET credits = COALESCE(credits, 0) + ? WHERE id = ?`).bind(plan.credits, auth.session.userId).run().catch(() => null);
  }
  await createAuditLog(env, auth.session.userId, "order.create", "order", id, { planId, provider, amount: plan.amount, ip: getClientIp(request) });
  return sendJson({ ok: true, order: { id, planId, planName: plan.name, amount: plan.amount, amountText: `¥${centsToYuan(plan.amount)}`, status, provider, checkoutUrl } }, 201);
}


async function getOrderDetail(request, env, orderId) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;
  const order = auth.session.role === "admin"
    ? await env.DB.prepare(`SELECT * FROM orders WHERE id = ?`).bind(orderId).first()
    : await env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`).bind(orderId, auth.session.userId).first();
  if (!order) return sendJson({ ok: false, message: "订单不存在或无权查看。" }, 404);
  return sendJson({ ok: true, order: formatOrderRecord(order) });
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
  if (order.status === "paid") {
    return sendJson({ ok: true, order: { ...formatOrderRecord(order), status: "paid" } });
  }
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE orders SET status = 'paid', updated_at = ?, paid_at = ? WHERE id = ?`).bind(now, now, orderId).run();
  await applyPlanBenefits(env, order, now);
  return sendJson({ ok: true, order: { ...formatOrderRecord({ ...order, status: "paid" }), status: "paid" } });
}

async function applyPlanBenefits(env, order, now) {
  const plan = PLANS[order.plan_id];
  if (plan?.credits) {
    await env.DB.prepare(`UPDATE users SET credits = COALESCE(credits, 0) + ? WHERE id = ?`).bind(plan.credits, order.user_id).run().catch(() => null);
  }
  if (plan?.type === "membership") {
    const endAt = new Date(Date.now() + plan.days * 86400000).toISOString();
    await env.DB.prepare(`INSERT INTO memberships (id, user_id, plan_id, plan_name, start_at, end_at, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`).bind(makeId("mem"), order.user_id, order.plan_id, plan.name, now, endAt).run().catch(() => null);
  }
}

async function updateAdminUser(request, env, userId) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const creditsDelta = Number(body.creditsDelta || 0);
  const status = String(body.status || "").trim();
  if (!Number.isFinite(creditsDelta) || Math.abs(creditsDelta) > 999) {
    return sendJson({ ok: false, message: "次数调整必须在 -999 到 999 之间。" }, 422);
  }
  if (status && !["active", "disabled"].includes(status)) {
    return sendJson({ ok: false, message: "用户状态只支持 active 或 disabled。" }, 422);
  }
  const current = await env.DB.prepare(`SELECT id, credits, status FROM users WHERE id = ?`).bind(userId).first();
  if (!current) return sendJson({ ok: false, message: "用户不存在。" }, 404);
  const nextCredits = Math.max(Number(current.credits || 0) + creditsDelta, 0);
  const nextStatus = status || current.status || "active";
  await env.DB.prepare(`UPDATE users SET credits = ?, status = ? WHERE id = ?`).bind(nextCredits, nextStatus, userId).run();
  await createAuditLog(env, auth.session.email || auth.session.userId, "admin.user.update", "user", userId, { creditsDelta, nextCredits, nextStatus });
  const user = await env.DB.prepare(`SELECT id, created_at, email, name, role, status, credits FROM users WHERE id = ?`).bind(userId).first();
  return sendJson({ ok: true, user: formatUserRecord(user), message: "用户权益已更新。" });
}

async function markAdminOrderPaid(request, env, orderId) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  const order = await env.DB.prepare(`SELECT * FROM orders WHERE id = ?`).bind(orderId).first();
  if (!order) return sendJson({ ok: false, message: "订单不存在。" }, 404);
  if (order.status === "paid") return sendJson({ ok: true, order: formatOrderRecord(order), message: "订单已是已支付状态。" });
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE orders SET status = 'paid', updated_at = ?, paid_at = ? WHERE id = ?`).bind(now, now, orderId).run();
  await applyPlanBenefits(env, order, now);
  await createAuditLog(env, auth.session.email || auth.session.userId, "admin.order.mark_paid", "order", orderId, { amount: order.amount, planId: order.plan_id });
  return sendJson({ ok: true, order: { ...formatOrderRecord({ ...order, status: "paid" }), status: "paid" }, message: "订单已确认并发放权益。" });
}

async function reviewAdminReport(request, env, reportId) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  const body = await readJson(request);
  const status = String(body.status || "pending").trim();
  const note = String(body.note || "").slice(0, 180);
  if (!["pending", "approved", "needs_review", "hidden"].includes(status)) {
    return sendJson({ ok: false, message: "报告状态不正确。" }, 422);
  }
  const row = await env.DB.prepare(`SELECT * FROM reports WHERE id = ?`).bind(reportId).first();
  if (!row) return sendJson({ ok: false, message: "报告不存在。" }, 404);
  let report = {};
  try { report = JSON.parse(row.report_json || "{}"); } catch {}
  report.adminReview = { status, note, reviewedAt: new Date().toISOString(), reviewer: auth.session.email || "admin" };
  await env.DB.prepare(`UPDATE reports SET report_json = ? WHERE id = ?`).bind(JSON.stringify(report), reportId).run();
  await createAuditLog(env, auth.session.email || auth.session.userId, "admin.report.review", "report", reportId, { status, note });
  return sendJson({ ok: true, report: formatReportRecord({ ...row, report_json: JSON.stringify(report) }), message: "报告审核状态已更新。" });
}

async function notifyPayment(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const bodyText = await request.text();
  let body = {};
  try { body = bodyText ? JSON.parse(bodyText) : {}; } catch { return sendJson({ ok: false, message: "支付通知 JSON 格式不正确。" }, 422); }
  const verified = await verifyPaymentNotice(request, bodyText, body, env);
  if (!verified.ok) return verified.response;
  const orderId = String(body.orderId || body.order_id || body.outTradeNo || body.out_trade_no || "").trim();
  if (!orderId) return sendJson({ ok: false, message: "缺少订单号。" }, 422);
  const order = await env.DB.prepare(`SELECT * FROM orders WHERE id = ?`).bind(orderId).first();
  if (!order) return sendJson({ ok: false, message: "订单不存在。" }, 404);
  if (order.status === "paid") {
    await createAuditLog(env, "payment", "payment.duplicate", "order", orderId, { provider: verified.provider });
    return sendJson({ ok: true, idempotent: true, order: formatOrderRecord(order), message: "订单已支付，重复通知已忽略。" });
  }
  const notifiedAmount = Number(body.amount ?? body.total ?? body.total_fee ?? order.amount);
  if (Number.isFinite(notifiedAmount) && notifiedAmount > 0 && notifiedAmount !== Number(order.amount || 0)) {
    await createAuditLog(env, "payment", "payment.amount_mismatch", "order", orderId, { provider: verified.provider, notifiedAmount, expectedAmount: order.amount });
    return sendJson({ ok: false, code: "PAYMENT_AMOUNT_MISMATCH", message: "支付金额与订单金额不一致，已拒绝入账。" }, 409);
  }
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE orders SET status = 'paid', updated_at = ?, paid_at = ?, provider = ? WHERE id = ?`).bind(now, now, verified.provider, orderId).run();
  await applyPlanBenefits(env, { ...order, provider: verified.provider, status: "paid" }, now);
  await createAuditLog(env, "payment", "payment.paid", "order", orderId, { provider: verified.provider, amount: order.amount, transactionId: body.transactionId || body.transaction_id || body.trade_no || "" });
  return sendJson({ ok: true, idempotent: false, order: { ...formatOrderRecord({ ...order, status: "paid", provider: verified.provider }), status: "paid" }, message: "支付通知已确认，权益已发放。" });
}
async function queryDailyCounts(env, table, column = "created_at") {
  const result = await env.DB.prepare(`SELECT substr(${column}, 1, 10) AS day, COUNT(*) AS count FROM ${table} WHERE ${column} >= date('now', '-6 days') GROUP BY day ORDER BY day ASC`).all().catch(() => ({ results: [] }));
  return result.results || [];
}

async function queryDailyRevenue(env) {
  const result = await env.DB.prepare(`SELECT substr(paid_at, 1, 10) AS day, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue FROM orders WHERE status = 'paid' AND paid_at >= date('now', '-6 days') GROUP BY day ORDER BY day ASC`).all().catch(() => ({ results: [] }));
  return result.results || [];
}

function normalizeTrend(rows, valueKey = "count") {
  const map = new Map((rows || []).map((item) => [item.day, Number(item[valueKey] || 0)]));
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getTime() - (6 - index) * 86400000);
    const day = date.toISOString().slice(0, 10);
    return { day, value: map.get(day) || 0 };
  });
}

function formatAuditRecord(item) {
  let detail = {};
  try { detail = JSON.parse(item.detail_json || "{}"); } catch {}
  return { id: item.id, createdAt: item.created_at, actorId: item.actor_id, action: item.action, targetType: item.target_type, targetId: item.target_id, detail };
}
async function getAdminOverview(request, env) {
  const missingDb = assertDb(env);
  if (missingDb) return missingDb;
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  const url = new URL(request.url);
  const status = String(url.searchParams.get("status") || "all");
  const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);
  const users = await env.DB.prepare(`SELECT COUNT(*) AS count FROM users`).first().catch(() => ({ count: 0 }));
  const reports = await env.DB.prepare(`SELECT COUNT(*) AS count FROM reports`).first().catch(() => ({ count: 0 }));
  const orders = await env.DB.prepare(`SELECT COUNT(*) AS count FROM orders`).first().catch(() => ({ count: 0 }));
  const paid = await env.DB.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue FROM orders WHERE status = 'paid'`).first().catch(() => ({ count: 0, revenue: 0 }));
  const pending = await env.DB.prepare(`SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'`).first().catch(() => ({ count: 0 }));
  const todayOrders = await env.DB.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount FROM orders WHERE substr(created_at, 1, 10) = ?`).bind(today).first().catch(() => ({ count: 0, amount: 0 }));
  const todayUsers = await env.DB.prepare(`SELECT COUNT(*) AS count FROM users WHERE substr(created_at, 1, 10) = ?`).bind(today).first().catch(() => ({ count: 0 }));
  const activeMembers = await env.DB.prepare(`SELECT COUNT(*) AS count FROM memberships WHERE status = 'active' AND end_at >= ?`).bind(new Date().toISOString()).first().catch(() => ({ count: 0 }));
  const recentUsers = await env.DB.prepare(`SELECT id, created_at, email, name, role, status, credits FROM users ORDER BY created_at DESC LIMIT 40`).all().catch(() => ({ results: [] }));
  const recentOrders = await env.DB.prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 40`).all().catch(() => ({ results: [] }));
  const recentReports = await env.DB.prepare(`SELECT id, created_at, method_name, question, report_json FROM reports ORDER BY created_at DESC LIMIT 40`).all().catch(() => ({ results: [] }));
  const auditRows = await env.DB.prepare(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 18`).all().catch(() => ({ results: [] }));
  const [userTrend, orderTrend, revenueTrend] = await Promise.all([queryDailyCounts(env, "users"), queryDailyCounts(env, "orders"), queryDailyRevenue(env)]);
  const filterText = (item) => JSON.stringify(item).toLowerCase().includes(q);
  const filteredOrders = (recentOrders.results || []).filter((item) => (status === "all" || item.status === status) && (!q || filterText(item)));
  const filteredUsers = (recentUsers.results || []).filter((item) => !q || filterText(item));
  const filteredReports = (recentReports.results || []).filter((item) => !q || filterText(item));
  return sendJson({
    ok: true,
    filters: { status, q },
    metrics: {
      users: users.count || 0,
      reports: reports.count || 0,
      orders: orders.count || 0,
      paidOrders: paid.count || 0,
      pendingOrders: pending.count || 0,
      todayOrders: todayOrders.count || 0,
      todayUsers: todayUsers.count || 0,
      todayAmount: todayOrders.amount || 0,
      todayAmountText: `¥${centsToYuan(todayOrders.amount || 0)}`,
      activeMembers: activeMembers.count || 0,
      revenue: paid.revenue || 0,
      revenueText: `¥${centsToYuan(paid.revenue || 0)}`,
    },
    trends: { users: normalizeTrend(userTrend), orders: normalizeTrend(orderTrend), revenue: normalizeTrend(revenueTrend, "revenue") },
    auditLogs: (auditRows.results || []).map(formatAuditRecord),
    users: filteredUsers.slice(0, 20).map(formatUserRecord),
    orders: filteredOrders.slice(0, 20).map(formatOrderRecord),
    reports: filteredReports.slice(0, 20).map(formatReportRecord),
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
  if (request.method === "GET" && url.pathname === "/api/account/export") return exportAccountData(request, env);
  if (request.method === "POST" && url.pathname === "/api/account/delete") return deleteAccountData(request, env);
  if (request.method === "GET" && url.pathname === "/api/reports") return listReports(request, env);
  const reportDetailMatch = url.pathname.match(/^\/api\/reports\/([^/]+)$/);
  if (request.method === "GET" && reportDetailMatch) return getReportDetail(request, env, reportDetailMatch[1]);
  if (request.method === "POST" && url.pathname === "/api/reports") return createReport(request, env);
  if (request.method === "POST" && url.pathname === "/api/orders") return createOrder(request, env);
  if (request.method === "POST" && url.pathname === "/api/payments/notify") return notifyPayment(request, env);
  const orderDetailMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (request.method === "GET" && orderDetailMatch) return getOrderDetail(request, env, orderDetailMatch[1]);
  const mockPayMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/mock-pay$/);
  if (request.method === "POST" && mockPayMatch) return markMockPaid(request, env, mockPayMatch[1]);
  if (request.method === "GET" && url.pathname === "/api/admin/overview") return getAdminOverview(request, env);
  const adminUserMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (request.method === "POST" && adminUserMatch) return updateAdminUser(request, env, adminUserMatch[1]);
  const adminOrderMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/mark-paid$/);
  if (request.method === "POST" && adminOrderMatch) return markAdminOrderPaid(request, env, adminOrderMatch[1]);
  const adminReportMatch = url.pathname.match(/^\/api\/admin\/reports\/([^/]+)\/review$/);
  if (request.method === "POST" && adminReportMatch) return reviewAdminReport(request, env, adminReportMatch[1]);
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
