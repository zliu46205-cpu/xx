const endpoint = process.env.REPORT_TEST_URL || "https://xxx1111.zliu46205.workers.dev/api/reports";

const cases = [
  {
    name: "梅花事业",
    method: { id: "meihua", name: "梅花易数", scene: "短事占问", need: "问题、数字或起卦时间、事件背景", output: "本互变卦、体用生克、应象与行动" },
    values: { question: "我最近换工作是否合适？", concernType: "事业", timeRange: "近三个月", focusProblem: "换工作", background: "目前工作压力较大，但新机会还不确定。", privacyAccepted: true },
  },
  {
    name: "八字姻缘",
    method: { id: "bazi", name: "八字命理", scene: "长期结构分析", need: "出生日期、时间、地点、性别和关注问题", output: "四柱、十神、五行、阶段倾向" },
    values: { question: "我今年感情有没有稳定发展的机会？", concernType: "姻缘", birthDate: "1998-05-12", birthTime: "13:30", birthPlace: "江西上饶", gender: "女", timeRange: "今年", background: "目前单身，之前有一段关系没有完全放下。", privacyAccepted: true },
  },
  {
    name: "六爻合作",
    method: { id: "liuyao", name: "六爻占断", scene: "具体事件判断", need: "一事一问、起卦方式、时间、背景", output: "世应、用神、六亲、动变、应期倾向" },
    values: { question: "这个合作项目要不要继续推进？", concernType: "事业", castTime: "现在起卦", timeRange: "一个月内", background: "对方承诺很多，但关键资料迟迟没有给。", privacyAccepted: true },
  },
  {
    name: "起名品牌",
    method: { id: "naming", name: "起名", scene: "品牌和姓名整理", need: "姓氏、固定字、风格、避讳、用途", output: "五行意象、音形义、风格方向、候选名" },
    values: { question: "给玄学咨询网站起一个更适合大众传播的名字", concernType: "起名", nameBase: "天机、观象、玄雪", style: "高级、可信、现代东方，不要江湖感", privacyAccepted: true },
  },
  {
    name: "风水书房",
    method: { id: "fengshui", name: "风水布局", scene: "空间调整", need: "户型、门窗、床桌灶厕、坐向、问题", output: "明堂、气口、动线、采光、功能建议" },
    values: { question: "书房怎么布置更利于专注和接单？", concernType: "空间", location: "小房间，门在西侧，窗在南侧，桌子目前背门。", background: "最近工作效率低，容易拖延。", privacyAccepted: true },
  },
];

function hasBadEncoding(text) {
  return /\?{3,}/.test(String(text || ""));
}

const results = [];
for (const item of cases) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ method: item.method, values: item.values }),
  });
  const json = await res.json().catch(() => ({}));
  const report = json.report || {};
  results.push({
    case: item.name,
    status: res.status,
    ok: json.ok === true,
    generatedBy: report.generatedBy || "rules",
    aiError: report.aiError || "",
    questionOk: report.question === item.values.question,
    badEncoding: hasBadEncoding(report.question) || hasBadEncoding(report.summary),
    summary: String(report.summary || "").slice(0, 80),
    method: report.method,
  });
}

const summaries = results.map((item) => item.summary);
const uniqueSummaries = new Set(summaries).size;
const failed = results.filter((item) => !item.ok || item.status >= 400 || item.generatedBy !== "deepseek" || item.badEncoding || !item.questionOk);
console.table(results);
console.log(JSON.stringify({ endpoint, total: results.length, uniqueSummaries, failed: failed.length }, null, 2));
if (failed.length) {
  console.error("Failed cases:", JSON.stringify(failed, null, 2));
  process.exitCode = 1;
}