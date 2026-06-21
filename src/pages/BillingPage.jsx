import { useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { createOrder, markMockPaid } from "../utils/api";

export const plans = [
  { id: "free", name: "免费体验", price: 0, unit: "每日 1 次", credits: 1, badge: "拉新入口", desc: "问题归类、主象提示、简版建议和边界提醒。", features: ["简版报告", "基础术数选择", "可复制摘要"] },
  { id: "single", name: "单次完整报告", price: 1990, unit: "每次", credits: 1, badge: "主推", desc: "适合一个明确问题，解锁完整报告结构。", features: ["完整正文", "术语解释", "行动建议", "TXT 导出"] },
  { id: "monthly", name: "月度会员", price: 9900, unit: "30 天", credits: 20, badge: "复购", desc: "适合持续测算、保存报告和多主题比较。", features: ["20 次完整报告", "历史记录", "优先生成", "会员标识"] },
  { id: "yearly", name: "年度会员", price: 39900, unit: "365 天", credits: 120, badge: "高价值", desc: "适合长期使用，后续可接年度流年和专题权益。", features: ["120 次完整报告", "年度规划", "专题折扣", "数据存档"] },
  { id: "review", name: "人工复核预约", price: 29900, unit: "每次", credits: 0, badge: "服务层", desc: "后续接入人工服务，不做恐吓式消灾收费。", features: ["人工校对", "补充追问", "报告修订", "预约制"] },
];

export function BillingPage({ session, setRoute }) {
  const [selected, setSelected] = useState("single");
  const [notice, setNotice] = useState("");
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("idle");

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
      setNotice("订单已创建。当前为支付系统骨架，未接入真实扣款。配置支付渠道后可跳转收银台。");
    } catch (error) {
      setNotice(error.message || "订单创建失败");
    } finally {
      setStatus("idle");
    }
  }

  async function simulatePay() {
    if (!order || !session) return;
    setStatus("loading");
    try {
      const payload = await markMockPaid(order.id, session);
      setOrder(payload.order);
      setNotice("模拟支付已完成。真实上线前必须替换为支付平台回调验签。");
    } catch (error) {
      setNotice(error.message || "当前环境未开启模拟支付。真实支付需配置商户密钥和回调。");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <>
      <PageHeader eyebrow="会员与支付" title="免费体验先建立信任，付费服务按价值分层" desc="当前页面是商业化支付系统骨架：套餐、订单、支付状态和权益都已规划。真实扣款需要接入 Stripe、微信支付或支付宝，并完成服务条款、退款规则和回调验签。" />
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
          <p>{order ? `订单号：${order.id} · 状态：${order.status} · 金额：${order.amountText || `¥${(order.amount / 100).toFixed(2)}`}` : "选择套餐后会生成订单。真实支付接入后这里会跳转支付收银台。"}</p>
        </div>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={simulatePay} disabled={!order || status === "loading"}>模拟支付成功</Button>
          <Button type="button" variant="ghost" onClick={() => setRoute("account")}>查看用户中心</Button>
        </div>
      </section>
      <Notice>{notice}</Notice>
    </>
  );
}

