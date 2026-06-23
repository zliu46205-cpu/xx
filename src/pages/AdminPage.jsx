import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { getAdminOverview, markAdminOrderPaid, reviewAdminReport, updateAdminUser } from "../utils/api";

const REVIEW_LABELS = {
  pending: "待审核",
  approved: "已通过",
  needs_review: "需复核",
  hidden: "已隐藏",
};

export function AdminPage({ session, setRoute }) {
  const [overview, setOverview] = useState(null);
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({ status: "all", q: "" });
  const [status, setStatus] = useState("idle");
  const [userEdits, setUserEdits] = useState({});
  const [reportNotes, setReportNotes] = useState({});

  async function loadOverview(nextFilters = filters, quiet = false) {
    if (!session || session.role !== "admin") return;
    setStatus("loading");
    try {
      const payload = await getAdminOverview(session, nextFilters);
      setOverview(payload);
      if (!quiet) setNotice("后台数据已刷新。");
    } catch (error) {
      setNotice(error.message || "管理员后台加载失败。请确认 Cloudflare 环境变量已配置。");
    } finally {
      setStatus("idle");
    }
  }

  useEffect(() => {
    loadOverview(filters, true);
  }, [session]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function updateUserDraft(userId, key, value) {
    setUserEdits((current) => ({
      ...current,
      [userId]: { ...(current[userId] || {}), [key]: value },
    }));
  }

  async function submitUserUpdate(user) {
    const draft = userEdits[user.id] || {};
    try {
      const payload = await updateAdminUser(user.id, {
        creditsDelta: Number(draft.creditsDelta || 0),
        status: draft.status || user.status,
      }, session);
      setNotice(payload.message || "用户权益已更新。");
      setUserEdits((current) => ({ ...current, [user.id]: { creditsDelta: "", status: payload.user?.status || user.status } }));
      await loadOverview(filters, true);
    } catch (error) {
      setNotice(error.message || "用户更新失败。");
    }
  }

  async function submitOrderPaid(orderId) {
    try {
      const payload = await markAdminOrderPaid(orderId, session);
      setNotice(payload.message || "订单已确认。");
      await loadOverview(filters, true);
    } catch (error) {
      setNotice(error.message || "订单处理失败。");
    }
  }

  async function submitReportReview(reportId, reviewStatus) {
    try {
      const payload = await reviewAdminReport(reportId, { status: reviewStatus, note: reportNotes[reportId] || "" }, session);
      setNotice(payload.message || "报告审核状态已更新。");
      await loadOverview(filters, true);
    } catch (error) {
      setNotice(error.message || "报告审核失败。");
    }
  }

  if (!session || session.role !== "admin") {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <span className="seal">管理员后台</span>
          <h1>需要管理员登录</h1>
          <p>后台不提供默认账号。请配置环境变量后登录，避免公开网站出现后台弱口令。</p>
          <Button type="button" onClick={() => setRoute("admin")}>去管理员登录</Button>
        </div>
      </section>
    );
  }

  const metrics = overview?.metrics || { users: 0, reports: 0, orders: 0, paidOrders: 0, revenue: 0, revenueText: "¥0.00" };

  return (
    <>
      <PageHeader eyebrow="管理后台" title="用户、订单、报告与系统状态" desc="后台用于运营查看、权益处理和内容审核。正式上线前仍建议接入操作日志、权限分级、2FA 与真实支付回调。" />
      <section className="admin-metrics">
        <article><span>用户数</span><strong>{metrics.users}</strong></article>
        <article><span>报告数</span><strong>{metrics.reports}</strong></article>
        <article><span>订单数</span><strong>{metrics.orders}</strong></article>
        <article><span>已支付订单</span><strong>{metrics.paidOrders}</strong></article>
        <article><span>模拟收入</span><strong>{metrics.revenueText || `¥${(metrics.revenue / 100).toFixed(2)}`}</strong></article>
      </section>

      <section className="admin-filter-bar">
        <label>
          订单状态
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="all">全部订单</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
          </select>
        </label>
        <label>
          搜索
          <input value={filters.q} onChange={(event) => updateFilter("q", event.target.value)} placeholder="邮箱、订单号、问题关键词" />
        </label>
        <div className="form-actions">
          <Button type="button" onClick={() => loadOverview(filters)} disabled={status === "loading"}>{status === "loading" ? "刷新中..." : "应用筛选"}</Button>
          <Button type="button" variant="ghost" onClick={() => { const next = { status: "all", q: "" }; setFilters(next); loadOverview(next); }}>清空</Button>
        </div>
      </section>

      <section className="admin-layout admin-layout-wide">
        <div className="account-panel">
          <div className="section-title compact"><span>用户列表</span><h2>权益与状态</h2></div>
          {overview?.users?.length ? overview.users.map((item) => {
            const draft = userEdits[item.id] || {};
            return (
              <article className="record-row admin-record admin-record-stack" key={item.id}>
                <div><strong>{item.name || "用户"}</strong><p>{item.email} · {item.status} · 剩余 {item.credits} 次</p></div>
                <div className="admin-inline-controls">
                  <input type="number" value={draft.creditsDelta ?? ""} onChange={(event) => updateUserDraft(item.id, "creditsDelta", event.target.value)} placeholder="+/-次数" />
                  <select value={draft.status || item.status || "active"} onChange={(event) => updateUserDraft(item.id, "status", event.target.value)}>
                    <option value="active">正常</option>
                    <option value="disabled">停用</option>
                  </select>
                  <Button type="button" variant="secondary" onClick={() => submitUserUpdate(item)}>保存</Button>
                </div>
                <small>{item.createdAt || item.created_at}</small>
              </article>
            );
          }) : <Notice>暂无匹配用户。</Notice>}
        </div>

        <div className="account-panel">
          <div className="section-title compact"><span>最近订单</span><h2>订单管理</h2></div>
          {overview?.orders?.length ? overview.orders.map((item) => (
            <article className="record-row admin-record admin-record-stack" key={item.id}>
              <div><strong>{item.planName || item.plan_name}</strong><p>{item.status} · {item.id}</p></div>
              <div className="admin-inline-controls compact-controls">
                <small>{item.amountText || `¥${(item.amount / 100).toFixed(2)}`}</small>
                {item.status === "pending" ? <Button type="button" variant="secondary" onClick={() => submitOrderPaid(item.id)}>确认到账</Button> : <span className="admin-status-pill">已发放</span>}
              </div>
            </article>
          )) : <Notice>暂无匹配订单。</Notice>}
        </div>

        <div className="account-panel">
          <div className="section-title compact"><span>最近报告</span><h2>报告审核</h2></div>
          {overview?.reports?.length ? overview.reports.map((item) => {
            const review = item.adminReview || { status: "pending" };
            return (
              <article className="record-row admin-record admin-record-stack" key={item.id}>
                <div><strong>{item.methodName || item.method_name}</strong><p>{item.question}</p></div>
                <div className="admin-review-box">
                  <span className="admin-status-pill">{REVIEW_LABELS[review.status] || "待审核"}</span>
                  <input value={reportNotes[item.id] || review.note || ""} onChange={(event) => setReportNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="审核备注" />
                  <div className="admin-inline-controls compact-controls">
                    <Button type="button" variant="secondary" onClick={() => submitReportReview(item.id, "approved")}>通过</Button>
                    <Button type="button" variant="ghost" onClick={() => submitReportReview(item.id, "needs_review")}>复核</Button>
                    <Button type="button" variant="ghost" onClick={() => submitReportReview(item.id, "hidden")}>隐藏</Button>
                  </div>
                </div>
                <small>{item.createdAt || item.created_at}</small>
              </article>
            );
          }) : <Notice>暂无匹配报告。</Notice>}
        </div>
      </section>
      <Notice>{notice}</Notice>
    </>
  );
}
