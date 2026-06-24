import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { createOrder, getAccount, getOrderDetail, markMockPaid } from "../utils/api";

export const plans = [
  { id: "free", name: "免费体验", price: 0, unit: "每日 1 次", credits: 1, badge: "拉新入口", desc: "问题归类、主象提示、简版建议和边界提醒。", features: ["简版报告", "基础术数选择", "可复制摘要"] },
  { id: "single", name: "标准/深度体验包", price: 1990, unit: "3 次", credits: 3, badge: "主推", desc: "适合一个明确问题，可生成 3 次标准报告或 1 次深度报告。", features: ["3 次标准报告", "或 1 次深度报告", "术语解释", "TXT 导出"] },
  { id: "monthly", name: "月度会员", price: 9900, unit: "30 天", credits: 30, badge: "复购", desc: "适合持续测算、保存报告和多主题比较。", features: ["30 次完整报告", "历史记录", "优先生成", "会员标识"] },
  { id: "yearly", name: "年度会员", price: 39900, unit: "365 天", credits: 420, badge: "高价值", desc: "适合长期使用，后续可接年度流年和专题权益。", features: ["420 次完整报告", "年度规划", "专题折扣", "数据存档"] },
  { id: "review", name: "人工复核预约", price: 29900, unit: "每次", credits: 0, badge: "服务层", desc: "后续接入人工服务，不做恐吓式消灾收费。", features: ["人工校对", "补充追问", "报告修订", "预约制"] },
];

function formatCredits(account) {
  return Number(account?.user?.credits ?? account?.stats?.credits ?? 0);
}

export function BillingPage({ session, setRoute }) {
  const [selected, setSelected] = useState("single");
  const [notice, setNotice] = useState("");
  const [order, setOrder] = useState(null);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!session) return;
    getAccount(session).then(setAccount).catch(() => null);
  }, [session]);

  async function refreshAccount(message) {
    if (!session) return null;
    const payload = await getAccount(session);
    setAccount(payload);
    if (message) setNotice(message);
    return payload;
  }

  async function buy(planId) {
    if (!session) {
      setNotice("请先登录后再创建订单。游客可以继续免费体验，但订单需要账号保存。");
      setRoute("login");
      return;
    }
    setSelected(planId);
    setStatus("loading");
    try {
      const payload = await createOrder(planId, session);
      setOrder(payload.order);
      await refreshAccount("订单已创建。当前为测试支付流程，真实上线前需要替换为支付平台收银台和回调验签。");
    } catch (error) {
      setNotice(error.message || "订单创建失败");
    } finally {
      setStatus("idle");
    }
  }


  async function refreshOrder(message) {
    if (!order || !session) return null;
    setStatus("loading");
    try {
      const payload = await getOrderDetail(order.id, session);
      setOrder(payload.order);
      const nextAccount = await refreshAccount();
      if (message) setNotice(message);
      if (payload.order.status === "paid") {
        setNotice(`订单已支付，权益已同步。当前剩余 ${formatCredits(nextAccount)} 次。`);
      }
      return payload.order;
    } catch (error) {
      setNotice(error.message || "订单状态查询失败。");
      return null;
    } finally {
      setStatus("idle");
    }
  }
  async function simulatePay() {
    if (!order || !session) return;
    setStatus("loading");
    try {
      const beforeCredits = formatCredits(account);
      const payload = await markMockPaid(order.id, session);
      setOrder(payload.order);
      const nextAccount = await refreshAccount();
      const afterCredits = formatCredits(nextAccount);
      const diff = Math.max(afterCredits - beforeCredits, 0);
      setNotice(diff ? `模拟支付已完成，账户增加 ${diff} 次，当前剩余 ${afterCredits} 次。` : `订单已是已支付状态，当前剩余 ${afterCredits} 次。`);
    } catch (error) {
      setNotice(error.message || "当前环境未开启模拟支付。真实支付需配置商户密钥和回调。");
    } finally {
      setStatus("idle");
    }
  }

  const credits = formatCredits(account);
  const membership = account?.membership;
  const selectedPlan = plans.find((plan) => plan.id === selected) || plans[1];

  return (
    <>
      <PageHeader eyebrow="会员与支付" title="免费体验先建立信任，付费服务按价值分层" desc="当前页面是商业化支付系统骨架：套餐、订单、支付状态和权益都已规划。真实扣款需要接入微信支付、支付宝或 Stripe，并完成服务条款、退款规则和回调验签。" />

      <section className="billing-status-strip">
        <article><span>当前账户</span><strong>{session ? session.email || session.name : "未登录"}</strong><p>{session ? "订单和次数会保存到当前账号。" : "登录后才能购买套餐。"}</p></article>
        <article><span>剩余次数</span><strong>{session ? credits : "--"}</strong><p>标准报告扣 1 次，深度报告扣 3 次。</p></article>
        <article><span>会员状态</span><strong>{membership ? membership.plan_name || membership.planName : "未开通"}</strong><p>{membership?.end_at || membership?.endAt ? `到期：${membership.end_at || membership.endAt}` : "会员套餐会在支付成功后显示。"}</p></article>
        <article><span>当前选择</span><strong>{selectedPlan.name}</strong><p>{selectedPlan.desc}</p></article>
      </section>

      <section className="billing-grid">
        {plans.map((plan) => (
          <article className={`billing-card ${selected === plan.id ? "selected" : ""}`} key={plan.id}>
            <div className="service-top"><span>{plan.badge}</span><small>{plan.unit}</small></div>
            <h2>{plan.name}</h2>
            <div className="service-price"><strong>¥{(plan.price / 100).toFixed(plan.price ? 2 : 0)}</strong><em>{plan.credits ? `${plan.credits} 次` : "预约制"}</em></div>
            <p>{plan.desc}</p>
            <ul>{plan.features.map((item) => <li key={item}>{item}</li>)}</ul>
            <Button type="button" onClick={() => buy(plan.id)} disabled={status === "loading" || plan.id === "free"}>{plan.id === "free" ? "免费体验无需支付" : "创建订单"}</Button>
          </article>
        ))}
      </section>
      <section className="checkout-panel">
        <div>
          <span>订单状态</span>
          <h2>{order ? order.planName || order.plan_name : "尚未创建订单"}</h2>
          <p>{order ? `订单号：${order.id} · 状态：${order.status} · 金额：${order.amountText || `¥${(order.amount / 100).toFixed(2)}`} · 渠道：${order.provider || "manual"}` : "选择套餐后会生成订单。真实支付接入后这里会跳转支付收银台。"}</p>
        </div>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={simulatePay} disabled={!order || status === "loading"}>{status === "loading" ? "处理中..." : "模拟支付成功"}</Button>`r`n          <Button type="button" variant="ghost" onClick={() => refreshOrder("订单状态已刷新。")} disabled={!order || status === "loading"}>查询支付结果</Button>
          <Button type="button" variant="ghost" onClick={() => refreshAccount("账户状态已刷新。")} disabled={!session || status === "loading"}>刷新权益</Button>
          <Button type="button" variant="ghost" onClick={() => setRoute("account")}>查看用户中心</Button>
        </div>
      </section>
      <Notice>{notice}</Notice>
    </>
  );
}
