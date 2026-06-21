import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { getAdminOverview } from "../utils/api";

export function AdminPage({ session, setRoute }) {
  const [overview, setOverview] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!session || session.role !== "admin") return;
    getAdminOverview(session)
      .then((payload) => setOverview(payload))
      .catch((error) => setNotice(error.message || "管理员后台加载失败。请确认 Cloudflare 环境变量已配置。"));
  }, [session]);

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
      <PageHeader eyebrow="管理后台" title="用户、订单、报告与系统状态" desc="后台用于运营查看，不直接修改用户命理内容。正式上线需要权限分级、操作日志、2FA 和风控限制。" />
      <section className="admin-metrics">
        <article><span>用户数</span><strong>{metrics.users}</strong></article>
        <article><span>报告数</span><strong>{metrics.reports}</strong></article>
        <article><span>订单数</span><strong>{metrics.orders}</strong></article>
        <article><span>已支付订单</span><strong>{metrics.paidOrders}</strong></article>
        <article><span>模拟收入</span><strong>{metrics.revenueText || `¥${(metrics.revenue / 100).toFixed(2)}`}</strong></article>
      </section>
      <section className="admin-layout">
        <div className="account-panel">
          <div className="section-title compact"><span>最近订单</span><h2>订单管理</h2></div>
          {overview?.orders?.length ? overview.orders.map((item) => (
            <article className="record-row" key={item.id}><div><strong>{item.planName || item.plan_name}</strong><p>{item.status}</p></div><small>{item.amountText || `¥${(item.amount / 100).toFixed(2)}`}</small></article>
          )) : <Notice>暂无订单。</Notice>}
        </div>
        <div className="account-panel">
          <div className="section-title compact"><span>最近报告</span><h2>报告审核</h2></div>
          {overview?.reports?.length ? overview.reports.map((item) => (
            <article className="record-row" key={item.id}><div><strong>{item.methodName || item.method_name}</strong><p>{item.question}</p></div><small>{item.createdAt || item.created_at}</small></article>
          )) : <Notice>暂无报告。</Notice>}
        </div>
      </section>
      <Notice>{notice}</Notice>
    </>
  );
}
