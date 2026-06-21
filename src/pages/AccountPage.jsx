import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { getAccount } from "../utils/api";

export function AccountPage({ session, setRoute }) {
  const [account, setAccount] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!session) return;
    getAccount(session)
      .then((payload) => setAccount(payload))
      .catch((error) => setNotice(error.message || "用户中心加载失败"));
  }, [session]);

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
            <article className="record-row" key={item.id}>
              <div><strong>{item.title || item.methodName || item.method_name}</strong><p>{item.question}</p></div>
              <small>{item.createdAt || item.created_at}</small>
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
      <Notice>{notice}</Notice>
    </>
  );
}
