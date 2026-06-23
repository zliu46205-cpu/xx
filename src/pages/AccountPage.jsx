import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { getAccount, getReportDetail } from "../utils/api";

function formatReportText(report) {
  if (!report) return "";
  const lines = [
    report.title,
    report.question,
    "",
    "简要结论",
    report.summary,
    "",
    "分析依据",
    ...(report.basis || []),
    "",
    "象征推演",
    ...(report.inference || []),
    "",
    "现实建议",
    ...(report.suggestions || []),
  ];
  return lines.filter(Boolean).join("\n");
}

export function AccountPage({ session, setRoute }) {
  const [account, setAccount] = useState(null);
  const [notice, setNotice] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");

  useEffect(() => {
    if (!session) return;
    getAccount(session)
      .then((payload) => setAccount(payload))
      .catch((error) => setNotice(error.message || "用户中心加载失败"));
  }, [session]);

  async function openReport(reportId) {
    setDetailStatus("loading");
    setNotice("");
    try {
      const payload = await getReportDetail(reportId, session);
      setSelectedReport(payload.report);
      setNotice("报告详情已打开。历史报告只允许本人或管理员查看。");
    } catch (error) {
      setNotice(error.message || "报告详情加载失败。");
    } finally {
      setDetailStatus("idle");
    }
  }

  async function copyReport() {
    if (!selectedReport) return;
    await navigator.clipboard?.writeText(formatReportText(selectedReport));
    setNotice("报告正文已复制。");
  }

  function exportReport() {
    if (!selectedReport) return;
    const blob = new Blob([formatReportText(selectedReport)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xuanxue-report-${selectedReport.id || "history"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!session) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <span className="seal">用户中心</span>
          <h1>请先登录</h1>
          <p>登录后可以保存报告、查看订单、管理次数权益。</p>
          <Button type="button" onClick={() => setRoute("login")}>去登录</Button>
        </div>
      </section>
    );
  }

  const user = account?.user || session;
  const stats = account?.stats || { reports: 0, orders: 0, credits: 0 };
  const membership = account?.membership;

  return (
    <>
      <PageHeader eyebrow="用户中心" title="报告、权益与订单集中管理" desc="这是面向大众用户的账户中心。当前版本支持基础登录、报告记录、权益展示和订单记录，真实支付接入后会自动同步会员状态。" />
      <section className="account-grid">
        <article className="account-card profile-card">
          <span>当前用户</span>
          <h2>{user.name || "用户"}</h2>
          <p>{user.email}</p>
          <div className="membership-badge">{membership ? membership.plan_name || membership.planName : "免费用户"}</div>
        </article>
        <article className="account-card"><span>报告数量</span><strong>{stats.reports}</strong><p>已保存的测算报告。</p></article>
        <article className="account-card"><span>剩余次数</span><strong>{stats.credits}</strong><p>用于生成完整报告或专题报告。</p></article>
        <article className="account-card"><span>订单数量</span><strong>{stats.orders}</strong><p>包含待支付、已支付和已取消订单。</p></article>
      </section>

      <section className="account-layout">
        <div className="account-panel">
          <div className="section-title compact"><span>最近报告</span><h2>报告记录</h2></div>
          {account?.reports?.length ? account.reports.map((item) => (
            <article className="record-row record-row-action" key={item.id}>
              <div><strong>{item.title || item.methodName || item.method_name}</strong><p>{item.question}</p></div>
              <div className="record-actions">
                <small>{item.createdAt || item.created_at}</small>
                <Button type="button" variant="ghost" onClick={() => openReport(item.id)} disabled={detailStatus === "loading"}>查看</Button>
              </div>
            </article>
          )) : <Notice>暂无报告。可以先去免费体验生成第一份报告。</Notice>}
        </div>
        <div className="account-panel">
          <div className="section-title compact"><span>订单记录</span><h2>支付与会员</h2></div>
          {account?.orders?.length ? account.orders.map((item) => (
            <article className="record-row" key={item.id}>
              <div><strong>{item.planName || item.plan_name}</strong><p>{item.status === "paid" ? "已支付" : "待支付"} · {item.amountText || `¥${(item.amount / 100).toFixed(2)}`}</p></div>
              <small>{item.createdAt || item.created_at}</small>
            </article>
          )) : <Notice>暂无订单。套餐页可创建订单，真实支付渠道接入后再进行扣款。</Notice>}
          <div className="form-actions"><Button type="button" onClick={() => setRoute("billing")}>查看套餐</Button></div>
        </div>
      </section>

      {selectedReport ? (
        <section className="account-report-detail">
          <div className="section-title compact"><span>历史报告详情</span><h2>{selectedReport.title}</h2><p>{selectedReport.question}</p></div>
          <div className="report-detail-grid">
            <article><span>简要结论</span><p>{selectedReport.summary}</p></article>
            <article><span>趋势倾向</span><p>{selectedReport.tendency}</p></article>
          </div>
          <div className="report-detail-columns">
            <article><span>分析依据</span><ul>{(selectedReport.basis || []).map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><span>象征推演</span><ul>{(selectedReport.inference || []).slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><span>现实建议</span><ul>{(selectedReport.suggestions || []).slice(0, 7).map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
          <div className="form-actions">
            <Button type="button" onClick={copyReport}>复制报告</Button>
            <Button type="button" variant="secondary" onClick={exportReport}>导出 TXT</Button>
            <Button type="button" variant="ghost" onClick={() => setSelectedReport(null)}>收起</Button>
          </div>
        </section>
      ) : null}
      <Notice>{notice}</Notice>
    </>
  );
}
