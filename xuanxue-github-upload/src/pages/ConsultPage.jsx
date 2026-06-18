import { useEffect, useMemo, useState } from "react";
import { fieldLabels, methods } from "../data/siteData";
import { buildReport, reportToText, validateIntake } from "../utils/report";
import { createReport, listReports } from "../utils/api";
import { Button, Notice, SkeletonReport } from "../components/Primitives";
import { PageHeader } from "../components/Layout";

const exampleQuestion = "我最近工作推进困难，想知道接下来三个月应该先稳住当前岗位，还是主动寻找新的机会。";

export function ConsultPage({ selectedMethod, selectMethod }) {
  const method = useMemo(() => methods.find((item) => item.id === selectedMethod) || methods[0], [selectedMethod]);
  const [values, setValues] = useState({
    question: "",
    concernType: "事业发展",
    timeRange: "近三个月",
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
    listReports(6)
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
  }, []);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function fillExample() {
    setValues((current) => ({
      ...current,
      question: exampleQuestion,
      background: "近期团队变化较多，目标不够稳定，自己既想提升收入，也担心贸然变动造成更大压力。",
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
      const payload = await createReport(values, method);
      setReport(payload.report);
      setStatus("ready");
      setApiMode("online");
      setNotice("报告已由本地后端生成并保存到历史记录。");
      const historyPayload = await listReports(6);
      setReportHistory(historyPayload.reports || []);
    } catch (error) {
      const fallbackReport = buildReport(values, method);
      setReport(fallbackReport);
      setStatus("ready");
      setApiMode("offline");
      setNotice("本地后端未连接，已使用前端离线生成。启动 npm run api 后可保存历史报告。");
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
        eyebrow="免费体验"
        title="先把问题问清楚，再生成参考报告"
        desc="当前版本为前端 MVP，报告为本地模拟生成，用来验证产品流程、内容结构与安全边界。"
      />

      <section className="consult-layout">
        <form className="intake-panel" onSubmit={submit}>
          <div className="progress-line"><i style={{ width: report ? "100%" : status === "loading" ? "72%" : "42%" }} /></div>

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
              placeholder="建议一事一问，例如：我是否应该在三个月内换工作？"
            />
            {errors.question ? <small className="error">{errors.question}</small> : null}
          </label>

          <div className="form-grid">
            <label>
              关注主题
              <select value={values.concernType} onChange={(event) => update("concernType", event.target.value)}>
                <option>事业发展</option>
                <option>关系沟通</option>
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
              </select>
            </label>
          </div>

          {method.fields.map((field) => (
            <label key={field}>
              {fieldLabels[field] || field}
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
              placeholder="补充现实背景、已尝试的方法、最担心的事情。"
            />
          </label>

          <label>
            邮箱（可选）
            <input value={values.contact} onChange={(event) => update("contact", event.target.value)} placeholder="仅作未来报告发送设计示意" />
            {errors.contact ? <small className="error">{errors.contact}</small> : null}
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={values.privacyAccepted}
              onChange={(event) => update("privacyAccepted", event.target.checked)}
            />
            <span>我理解本报告仅作传统文化、娱乐、反思与规划参考，不替代专业建议。</span>
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
            {apiMode === "online" ? "后端已连接 · 可保存历史" : apiMode === "checking" ? "正在检查后端..." : "离线模式 · 仅本地预览"}
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
            <p>提交后会按所选术数展示主象、变象、专属术语解读、白话解读、分析依据与现实建议。</p>
          </div>
        ) : null}
      </section>

      <section className="history-panel">
        <div className="section-title">
          <span>历史报告</span>
          <h2>后端保存记录</h2>
          <p>这是后续用户中心、会员权益和付费报告存档的第一步。</p>
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
            <h2>暂无后端历史记录</h2>
            <p>启动本地 API 后生成报告，这里会自动出现最近的测算记录。</p>
          </div>
        )}
      </section>
    </>
  );
}

function ReportPanel({ report, copySummary, exportText, regenerate }) {
  return (
    <article className="report-panel">
      <div className="report-main">
        <header>
          <span>{report.id}</span>
          <h2>{report.title}</h2>
          <p>{report.createdAt}</p>
        </header>

        <section>
          <h3>简要结论</h3>
          <p>{report.summary}</p>
        </section>

        <section className="oracle-grid">
          <div><span>主象</span><strong>{report.oracle.mainHexagram}</strong></div>
          <div><span>变象</span><strong>{report.oracle.changedHexagram}</strong></div>
          <div><span>趋势评分</span><strong>{report.oracle.score}</strong></div>
        </section>

        <section>
          <h3>{report.oracle.firstTitle || "取象依据"}</h3>
          <p>{report.oracle.guaci}</p>
          <h3>{report.oracle.secondTitle || "象意推演"}</h3>
          <p>{report.oracle.xiangci}</p>
          <h3>白话解读</h3>
          <p>{report.oracle.plainText}</p>
        </section>

        <section className="report-columns">
          <div>
            <h3>分析依据</h3>
            <ul>{report.basis.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>象征性推演</h3>
            <ul>{report.inference.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="report-columns">
          <div>
            <h3>建议事项</h3>
            <ul>{report.suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>相似案例</h3>
            <p>{report.oracle.similarCase}</p>
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
