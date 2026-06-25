import { useEffect, useMemo, useState } from "react";
import { fieldLabels, methods } from "../data/siteData";
import { buildReport, reportToText, validateIntake } from "../utils/report";
import { createReport, listReports } from "../utils/api";
import { Button, Notice, SkeletonReport } from "../components/Primitives";
import { PageHeader } from "../components/Layout";

const exampleQuestion = "我最近工作推进困难，想知道接下来三个月应该先稳住当前岗位，还是主动寻找新的机会。";

const focusOptions = [
  "没方向",
  "被领导或规则压制",
  "想跳槽或换赛道",
  "收入不稳定",
  "关系沟通反复",
  "等待结果",
  "想看时机",
  "想起名或改名",
];

const readingFocusOptions = [
  "原因",
  "趋势",
  "是否继续",
  "如何行动",
  "什么时候变化",
  "风险在哪里",
];

const toneOptions = ["温和清楚", "直接一点", "专业一点", "更白话一点"];
const detailOptions = ["大众易懂", "术语稍多", "行动优先"];

const reportTierOptions = [
  { id: "free", name: "????", price: "?0", desc: "???????????3 ????????????" },
  { id: "standard", name: "????", price: "?19.9 ? ??", desc: "????????????????????????????" },
  { id: "deep", name: "????", price: "?69 ? ??", desc: "???????????????????????????????" },
];

const localFieldLabels = {
  birthDate: "出生日期",
  birthTime: "出生时间",
  birthPlace: "出生地点",
  gender: "性别",
  castTime: "起卦时间",
  timeRange: "关注时间范围",
  numberSeed: "数字或外应",
  deadline: "事件截止点",
  location: "地点或空间",
  options: "可选方案",
  nameBase: "姓氏/主体",
  style: "风格偏好",
  background: "补充背景",
};

export function ConsultPage({ selectedMethod, selectMethod, session, setRoute }) {
  const method = useMemo(() => methods.find((item) => item.id === selectedMethod) || methods[0], [selectedMethod]);
  const [values, setValues] = useState({
    question: "",
    concernType: "事业发展",
    timeRange: "近三个月",
    focusProblem: "没方向",
    readingFocus: "如何行动",
    reportTone: "温和清楚",
    detailLevel: "大众易懂",
    background: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    gender: "不透露",
    castTime: "",
    numberSeed: "",
    deadline: "",
    location: "",
    options: "",
    nameBase: "",
    style: "",
    contact: "",
    privacyAccepted: false,
    reportTier: "free",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState("");
  const [reportHistory, setReportHistory] = useState([]);
  const [apiMode, setApiMode] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    listReports(6, session)
      .then((payload) => {
        if (cancelled) return;
        setApiMode("online");
        setReportHistory(payload.reports || []);
      })
      .catch(() => {
        if (cancelled) return;
        setApiMode("offline");
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function fillExample() {
    setValues((current) => ({
      ...current,
      question: exampleQuestion,
      concernType: "事业发展",
      timeRange: "近三个月",
      focusProblem: "想跳槽或换赛道",
      readingFocus: "如何行动",
      reportTone: "温和清楚",
      detailLevel: "大众易懂",
      background: "近期团队变化较多，目标不够稳定。自己既想提升收入，也担心贸然变动造成更大压力。",
      birthDate: "1998-05-12",
      birthTime: "09:30",
      birthPlace: "杭州",
      castTime: "今天上午",
      numberSeed: "27",
      location: "当前城市",
      options: "继续留任 / 面试新岗位 / 先学习再跳槽",
      nameBase: "观象",
      style: "稳重、清雅、东方文化感",
      privacyAccepted: true,
      reportTier: "standard",
    }));
    setErrors({});
  }

  function clearForm() {
    setValues((current) => ({
      ...current,
      question: "",
      background: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      castTime: "",
      numberSeed: "",
      deadline: "",
      location: "",
      options: "",
      nameBase: "",
      style: "",
      contact: "",
      privacyAccepted: false,
    }));
    setReport(null);
    setNotice("");
    setErrors({});
  }

  async function submit(event) {
    event?.preventDefault?.();
    const nextErrors = validateIntake(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setNotice("请先补齐必要信息。资料可以留空，但问题与安全边界确认不能省略。");
      return;
    }

    setNotice("");
    setReport(null);
    setStatus("loading");
    try {
      const payload = await createReport(values, method, session);
      setReport(payload.report);
      setStatus("ready");
      setApiMode("online");
      setNotice(session ? "报告已生成并保存到你的用户中心。" : "报告已生成。登录后可以保存到用户中心并查看历史。");
      const historyPayload = await listReports(6, session);
      setReportHistory(historyPayload.reports || []);
    } catch (error) {
      if (error?.payload?.code === "PAID_REPORT_AI_UNAVAILABLE") {
        setNotice(error.message || "深度生成服务暂时不可用，本次未扣次数。请稍后重试，或先生成免费简版。");
        setStatus("idle");
        return;
      }
      const fallbackReport = buildReport(values, method);
      setReport(fallbackReport);
      setStatus("ready");
      setApiMode("offline");
      setNotice("报告已生成。当前若后端暂未连接，仍可先在页面查看和导出。");
    }
  }

  async function copySummary() {
    if (!report) return;
    await navigator.clipboard?.writeText(`${report.title}\n${report.question}\n${report.summary}`);
    setNotice("摘要已复制。");
  }

  function exportText() {
    if (!report) return;
    const blob = new Blob([reportToText(report)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("报告文本已导出。");
  }

  return (
    <>
      <PageHeader
        eyebrow="免费试测"
        title="先把问题问清楚，再生成能看懂的参考报告"
        desc="报告会同时保留术数术语、白话解释和现实建议。用户不需要懂八字、紫微、梅花或六爻，也能理解当前问题的主线。"
      />

      <section className="consult-layout enhanced-consult">
        <form className="intake-panel" onSubmit={submit}>
          <div className="progress-line"><i style={{ width: report ? "100%" : status === "loading" ? "72%" : "46%" }} /></div>

          <div className="intake-guide">
            <span>三步问诊</span>
            <strong>选方法 → 说问题 → 定重点</strong>
            <p>信息越具体，报告越少套话；不愿提供出生信息也可以走简化路径。</p>
          </div>

          <div className="tier-selector">
            <div className="tier-title">
              <span>报告档位</span>
              <strong>先免费体验，再按需要解锁深度</strong>
            </div>
            <div className="tier-grid">
              {reportTierOptions.map((tier) => (
                <button
                  type="button"
                  key={tier.id}
                  className={values.reportTier === tier.id ? "tier-card selected" : "tier-card"}
                  onClick={() => update("reportTier", tier.id)}
                >
                  <span>{tier.price}</span>
                  <strong>{tier.name}</strong>
                  <small>{tier.desc}</small>
                </button>
              ))}
            </div>
          </div>

          <label>
            选择术数
            <select value={selectedMethod} onChange={(event) => selectMethod(event.target.value)}>
              {methods.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label>
            你的问题
            <textarea
              value={values.question}
              onChange={(event) => update("question", event.target.value)}
              placeholder="建议一事一问，例如：我是否应该在三个月内换工作？这段关系还有没有沟通空间？"
            />
            {errors.question ? <small className="error">{errors.question}</small> : null}
          </label>

          <div className="form-grid">
            <label>
              关注主题
              <select value={values.concernType} onChange={(event) => update("concernType", event.target.value)}>
                <option>事业发展</option>
                <option>关系沟通</option>
                <option>财运收入</option>
                <option>学习考试</option>
                <option>择时选择</option>
                <option>命名整理</option>
              </select>
            </label>
            <label>
              时间范围
              <select value={values.timeRange} onChange={(event) => update("timeRange", event.target.value)}>
                <option>近七天</option>
                <option>近三个月</option>
                <option>半年内</option>
                <option>一年内</option>
                <option>长期主题</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              当前最困扰的是
              <select value={values.focusProblem} onChange={(event) => update("focusProblem", event.target.value)}>
                {focusOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              希望重点看
              <select value={values.readingFocus} onChange={(event) => update("readingFocus", event.target.value)}>
                {readingFocusOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              报告语气
              <select value={values.reportTone} onChange={(event) => update("reportTone", event.target.value)}>
                {toneOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              理解深度
              <select value={values.detailLevel} onChange={(event) => update("detailLevel", event.target.value)}>
                {detailOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          {method.fields.map((field) => (
            <label key={field}>
              {localFieldLabels[field] || fieldLabels[field] || field}
              <input
                value={values[field] || ""}
                onChange={(event) => update(field, event.target.value)}
                placeholder="可留空，系统会走简化路径"
              />
            </label>
          ))}

          <label>
            事件背景
            <textarea
              value={values.background}
              onChange={(event) => update("background", event.target.value)}
              placeholder="补充现实背景、已经尝试的方法、最担心的事情。"
            />
          </label>

          <label>
            邮箱（可选）
            <input value={values.contact} onChange={(event) => update("contact", event.target.value)} placeholder="用于接收报告或订单通知，可留空" />
            {errors.contact ? <small className="error">{errors.contact}</small> : null}
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={values.privacyAccepted}
              onChange={(event) => update("privacyAccepted", event.target.checked)}
            />
            <span>我理解本报告仅作传统文化、娱乐、反思与规划参考，不替代医疗、法律、心理、投资、婚姻等专业建议。</span>
          </label>
          {errors.privacyAccepted ? <small className="error">{errors.privacyAccepted}</small> : null}

          <Notice type={Object.keys(errors).length ? "error" : "info"}>{notice}</Notice>

          <div className="form-actions">
            <Button type="submit" disabled={status === "loading"}>{status === "loading" ? "生成中..." : "生成参考报告"}</Button>
            <Button type="button" variant="secondary" onClick={fillExample}>填充示例</Button>
            <Button type="button" variant="ghost" onClick={clearForm}>清空</Button>
          </div>
        </form>

        <aside className="assistant-panel">
          <h2>{method.name}</h2>
          <div className={apiMode === "online" ? "api-status online" : "api-status"}>
            {apiMode === "online" ? "后端已连接 · 可保存历史" : apiMode === "checking" ? "正在检查后端..." : "快速试测 · 可本页生成"}
          </div>
          <p>{method.need}</p>
          <dl>
            <dt>适用</dt>
            <dd>{method.scene}</dd>
            <dt>输出</dt>
            <dd>{method.output}</dd>
            <dt>边界</dt>
            <dd>{method.unsuitable}</dd>
          </dl>
        </aside>
      </section>

      <section className="report-zone">
        {status === "loading" ? <SkeletonReport /> : null}
        {report ? <ReportPanel report={report} copySummary={copySummary} exportText={exportText} regenerate={submit} /> : null}
        {status === "idle" && !report ? (
          <div className="empty-report">
            <h2>报告将在这里生成</h2>
            <p>提交后会展示一句话总断、当前局势、术数依据、白话解释、未来倾向、行动建议和术语解释。</p>
          </div>
        ) : null}
      </section>

      <section className="history-panel">
        <div className="section-title">
          <span>历史报告</span>
          <h2>报告历史记录</h2>
          <p>登录后可保存报告、查看历史、继续解锁完整报告或预约人工复核。</p>
        </div>
        {reportHistory.length ? (
          <div className="history-list">
            {reportHistory.map((item) => (
              <article key={item.id}>
                <span>{item.methodName}</span>
                <h3>{item.title}</h3>
                <p>{item.question}</p>
                <small>{item.createdAt}</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-report">
            <h2>暂无历史报告</h2>
            <p>生成或登录后，这里会显示最近的测算记录。</p>
          </div>
        )}
      </section>
    </>
  );
}

const reportViews = {
  bazi: { label: "八字命理", seal: "四柱", flow: ["命局前提", "日主月令", "十神结构", "财官印食", "阶段建议"], symbolLabels: ["主象", "转向", "承载分"], situationTitle: "命局前提", oracleTitle: "日主、月令与十神", inferenceTitle: "结构推演", adviceTitle: "事业与现实行动" },
  ziwei: { label: "紫微斗数", seal: "十二宫", flow: ["命盘前提", "核心宫位", "三方四正", "四化格局", "阶段倾向"], symbolLabels: ["主宫", "对宫", "参考分"], situationTitle: "命盘前提", oracleTitle: "宫位与四化", inferenceTitle: "宫位联参", adviceTitle: "角色与关系建议" },
  meihua: { label: "梅花易数", seal: "本互变", flow: ["所问之事", "起卦方式", "本互变", "体用生克", "动爻落地"], symbolLabels: ["本卦", "变卦", "趋势分"], situationTitle: "所问之事", oracleTitle: "本卦、互卦与变卦", inferenceTitle: "体用与动爻推演", adviceTitle: "观察点与行动建议" },
  liuyao: { label: "六爻占断", seal: "世应用神", flow: ["问题定义", "卦象信息", "用神世应", "六亲六神", "动变应期"], symbolLabels: ["本卦", "变卦", "应事分"], situationTitle: "问题定义", oracleTitle: "用神、世应与动变", inferenceTitle: "六亲六神推演", adviceTitle: "应期参考与现实行动" },
  coins: { label: "铜钱占卜", seal: "三钱六掷", flow: ["三钱起卦", "本卦变卦", "动爻位置", "卦辞象辞", "注意事项"], symbolLabels: ["本卦", "变卦", "趋势分"], situationTitle: "三钱起卦前提", oracleTitle: "卦辞与象辞", inferenceTitle: "动爻推演", adviceTitle: "建议事项" },
  qimen: { label: "奇门遁甲", seal: "九宫八门", flow: ["用局前提", "用神定位", "九宫组合", "门星神", "策略方向"], symbolLabels: ["用神", "落宫", "策略分"], situationTitle: "用局前提", oracleTitle: "九宫、八门与九星", inferenceTitle: "时机方向策略", adviceTitle: "谈判与行动建议" },
  fengshui: { label: "风水布局", seal: "形气动线", flow: ["空间概况", "明堂气口", "动线采光", "功能冲突", "调整建议"], symbolLabels: ["主象", "调整点", "舒适分"], situationTitle: "空间概况", oracleTitle: "明堂、气口与动线", inferenceTitle: "空间体验推演", adviceTitle: "低成本调整建议" },
  zeday: { label: "择日择时", seal: "时令宜忌", flow: ["事项前提", "日期范围", "避冲条件", "可用窗口", "准备事项"], symbolLabels: ["时令", "窗口", "可用分"], situationTitle: "事项前提", oracleTitle: "时令、冲合与宜忌", inferenceTitle: "窗口推演", adviceTitle: "准备事项" },
  naming: { label: "起名策划", seal: "音形义", flow: ["命名目标", "风格方向", "五行意象", "音形义", "推荐组合"], symbolLabels: ["主意象", "风格", "传播分"], situationTitle: "命名目标", oracleTitle: "五行意象与音形义", inferenceTitle: "名字气质推演", adviceTitle: "候选方向" },
  integrated: { label: "综合咨询", seal: "归类取象", flow: ["问题整理", "适用方法", "象征主线", "现实翻译", "下一步行动"], symbolLabels: ["主象", "转向", "参考分"], situationTitle: "问题整理", oracleTitle: "象征主线", inferenceTitle: "综合推演", adviceTitle: "下一步行动" },
};

function getReportView(report) {
  const text = [report?.method, report?.title].filter(Boolean).join(" ");
  if (/八字|四柱|日主/.test(text)) return reportViews.bazi;
  if (/紫微|斗数|命宫/.test(text)) return reportViews.ziwei;
  if (/梅花/.test(text)) return reportViews.meihua;
  if (/六爻/.test(text)) return reportViews.liuyao;
  if (/铜钱|三钱/.test(text)) return reportViews.coins;
  if (/奇门/.test(text)) return reportViews.qimen;
  if (/风水|阳宅|布局/.test(text)) return reportViews.fengshui;
  if (/择日|择时/.test(text)) return reportViews.zeday;
  if (/起名|命名/.test(text)) return reportViews.naming;
  return reportViews.integrated;
}

function normalizeGlossary(items = []) {
  return items.map((item) => {
    if (Array.isArray(item)) return { term: item[0], desc: item[1] };
    if (item && typeof item === "object") return { term: item.term || item.value?.[0], desc: item.desc || item.description || item.value?.[1] };
    return { term: String(item), desc: "" };
  }).filter((item) => item.term);
}

function safeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}
function ReportPanel({ report, copySummary, exportText, regenerate }) {
  const view = getReportView(report);
  const glossary = normalizeGlossary(report.termGlossary);
  const basis = safeList(report.basis);
  const inference = safeList(report.inference);
  const suggestions = safeList(report.suggestions);
  const limits = safeList(report.limits);
  const oracle = report.oracle || {};

  return (
    <article className="report-panel layered-report method-report-panel">
      <div className="report-main">
        <header className="method-report-head">
          <div>
            <span>{report.id}</span>
            <small className="report-tier-badge">{report.reportTierName || "免费简版"}</small>
            <h2>{report.title}</h2>
            <p>{report.createdAt}</p>
          </div>
          <strong>{view.seal}</strong>
        </header>

        <nav className="method-flow" aria-label="报告结构">
          {view.flow.map((item, index) => (
            <span key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</span>
          ))}
        </nav>

        <section className="report-section lead-reading">
          <h3>一句话总断</h3>
          <p>{report.summary}</p>
        </section>

        <section className="oracle-grid method-oracle-grid">
          <div><span>{view.symbolLabels[0]}</span><strong>{oracle.mainHexagram || "待定"}</strong></div>
          <div><span>{view.symbolLabels[1]}</span><strong>{oracle.changedHexagram || "待定"}</strong></div>
          <div><span>{view.symbolLabels[2]}</span><strong>{oracle.score ?? "-"}</strong></div>
        </section>

        <section className="report-section">
          <h3>{view.situationTitle}</h3>
          <p>{report.situation}</p>
        </section>

        <section className="method-analysis-grid">
          <article>
            <span>一</span>
            <h3>{view.oracleTitle}</h3>
            <p>{oracle.guaci}</p>
            <p>{oracle.xiangci}</p>
          </article>
          <article>
            <span>二</span>
            <h3>白话解释</h3>
            <p>{oracle.plainText}</p>
          </article>
          <article>
            <span>三</span>
            <h3>未来倾向</h3>
            <p>{report.tendency}</p>
          </article>
        </section>

        <section className="method-report-blocks">
          <div className="method-block-title">
            <span>{view.label}</span>
            <h3>{view.inferenceTitle}</h3>
          </div>
          <div>
            {inference.map((item, index) => (
              <article key={item}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="report-columns">
          <div>
            <h3>分析依据</h3>
            <ul>{basis.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>{view.adviceTitle}</h3>
            <ul>{suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        {report.stageAdvice?.length ? (
          <section className="stage-advice-panel">
            <h3>分步落地</h3>
            <div>
              {report.stageAdvice.map((item, index) => (
                <article key={`${item.title}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                  <p>{item.symbol}</p>
                  <small>{item.real}</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="report-columns">
          <div>
            <h3>相似案例</h3>
            <p>{oracle.similarCase}</p>
          </div>
          <div>
            <h3>注意事项</h3>
            <p>{oracle.caution}</p>
          </div>
        </section>

        <section className="term-panel method-term-panel">
          <span>{view.label}术语解释</span>
          <div>
            {glossary.map(({ term, desc }) => (
              <article key={term}>
                <strong>{term}</strong>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="report-actions">
          <Button type="button" onClick={copySummary}>复制摘要</Button>
          <Button type="button" variant="secondary" onClick={exportText}>导出文本</Button>
          <Button type="button" variant="ghost" onClick={regenerate}>重新生成</Button>
        </footer>
      </div>

      <aside className="report-side-note method-report-index">
        <span>报告目录</span>
        {view.flow.map((item) => <small key={item}>{item}</small>)}
        <span>阅读说明</span>
        <small>{oracle.caution}</small>
        {limits.map((item) => <small key={item}>{item}</small>)}
      </aside>
    </article>
  );
}