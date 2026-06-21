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

export function ConsultPage({ selectedMethod, selectMethod, session }) {
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
    } catch {
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

function ReportPanel({ report, copySummary, exportText, regenerate }) {
  return (
    <article className="report-panel layered-report">
      <div className="report-main">
        <header>
          <span>{report.id}</span>
          <h2>{report.title}</h2>
          <p>{report.createdAt}</p>
        </header>

        <section className="report-section lead-reading">
          <h3>一句话总断</h3>
          <p>{report.summary}</p>
        </section>

        <section className="oracle-grid">
          <div><span>主象</span><strong>{report.oracle.mainHexagram}</strong></div>
          <div><span>变象</span><strong>{report.oracle.changedHexagram}</strong></div>
          <div><span>趋势评分</span><strong>{report.oracle.score}</strong></div>
        </section>

        <section className="report-section">
          <h3>当前局势</h3>
          <p>{report.situation}</p>
        </section>

        <section className="report-section">
          <h3>{report.oracle.firstTitle || "术数依据"}</h3>
          <p>{report.oracle.guaci}</p>
          <h3>{report.oracle.secondTitle || "象意推演"}</h3>
          <p>{report.oracle.xiangci}</p>
          <h3>白话解释</h3>
          <p>{report.oracle.plainText}</p>
          <h3>未来倾向</h3>
          <p>{report.tendency}</p>
        </section>

        <section className="report-columns">
          <div>
            <h3>分析依据</h3>
            <ul>{report.basis.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>象征推演</h3>
            <ul>{report.inference.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="report-columns">
          <div>
            <h3>行动建议</h3>
            <ul>{report.suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>相似案例</h3>
            <p>{report.oracle.similarCase}</p>
          </div>
        </section>

        <section className="term-panel">
          <span>术语解释</span>
          <div>
            {report.termGlossary.map(([term, desc]) => (
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

      <aside className="report-side-note">
        <span>阅读说明</span>
        <small>{report.oracle.caution}</small>
        {report.limits.map((item) => (
          <small key={item}>{item}</small>
        ))}
      </aside>
    </article>
  );
}

