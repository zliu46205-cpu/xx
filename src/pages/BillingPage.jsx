import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { createOrder, getAccount, getOrderDetail } from "../utils/api";

export const plans = [
  { id: "free", name: "免费体验", price: 0, unit: "每日 1 次", credits: 1, badge: "入门", desc: "适合先体验问题归类、主象提示、简版建议和边界提醒。", features: ["简版报告", "基础术数选择", "可复制摘要"] },
  { id: "single", name: "标准/深度体验包", price: 1990, unit: "3 次", credits: 3, badge: "主推", desc: "适合一个明确问题，可生成 3 次标准报告或 1 次深度报告。", features: ["3 次标准报告", "或 1 次深度报告", "术语解释", "TXT 导出"] },
  { id: "monthly", name: "月度会员", price: 9900, unit: "30 天", credits: 30, badge: "复购", desc: "适合持续测算、保存报告和多主题比较。", features: ["30 次完整报告", "历史记录", "优先生成", "会员标识"] },
  { id: "yearly", name: "年度会员", price: 39900, unit: "365 天", credits: 420, badge: "高价值", desc: "适合长期使用，后续可接年度流年和专题权益。", features: ["420 次完整报告", "年度规划", "专题折扣", "数据存档"] },
  { id: "review", name: "人工复核预约", price: 29900, unit: "每次", credits: 0, badge: "服务层", desc: "后续接入人工服务，不做恐吓式消灾收费。", features: ["人工校对", "补充追问", "报告修订", "预约制"] },
];

const paymentProviders = [
  { id: "generic_hmac", label: "通用 HMAC 网关" },
  { id: "wechat", label: "微信支付" },
  { id: "alipay", label: "支付宝" },
  { id: "stripe", label: "Stripe" },
  { id: "manual", label: "人工确认" },
];

function formatCredits(account) {
  return Number(account?.user?.credits ?? account?.stats?.credits ?? 0);
}

function formatPrice(price) {
  return price ? `¥${(price / 100).toFixed(2)}` : "¥0";
}

export function BillingPage({ session, setRoute }) {
  const [selected, setSelected] = useState("single");
  const [notice, setNotice] = useState("");
  const [order, setOrder] = useState(null);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("idle");
  const [paymentProvider, setPaymentProvider] = useState("generic_hmac");

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
      const payload = await createOrder(planId, session, paymentProvider);
      setOrder(payload.order);
      if (payload.order?.checkoutUrl) window.open(payload.order.checkoutUrl, "_blank", "noopener,noreferrer");
      await refreshAccount(payload.order?.checkoutUrl ? "订单已创建，已打开支付收银台。" : "订单已创建。当前通道没有配置收银台 URL，可用模拟支付或后台确认。 ");
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
      if (payload.order.status === "paid") {
        setNotice(`订单已支付，权益已同步。当前剩余 ${formatCredits(nextAccount)} 次。`);
      } else if (message) {
        setNotice(message);
      }
      return payload.order;
    } catch (error) {
      setNotice(error.message || "订单状态查询失败。");
      return null;
    } finally {
      setStatus("idle");
    }
  }

  async function copyPaymentInfo() {
    if (!order) return;
    const pay = order.paymentInstructions || {};
    const lines = [
      "\u8ba2\u5355\u53f7\uff1a" + order.id,
      "\u91d1\u989d\uff1a" + (order.amountText || formatPrice(order.amount)),
      pay.receiverName ? "\u6536\u6b3e\u4eba\uff1a" + pay.receiverName : "",
      pay.bankName ? "\u94f6\u884c\uff1a" + pay.bankName : "",
      pay.bankAccount ? "\u8d26\u53f7\uff1a" + pay.bankAccount : "",
      pay.bankAccountName ? "\u6237\u540d\uff1a" + pay.bankAccountName : "",
      "\u4ed8\u6b3e\u5907\u6ce8\uff1a" + (pay.transferNote || ("ORDER:" + order.id)),
    ].filter(Boolean).join("\n");
    await navigator.clipboard?.writeText(lines);
    setNotice("\u4ed8\u6b3e\u4fe1\u606f\u5df2\u590d\u5236\u3002\u4ed8\u6b3e\u65f6\u52a1\u5fc5\u5907\u6ce8\u8ba2\u5355\u53f7\uff0c\u65b9\u4fbf\u540e\u53f0\u786e\u8ba4\u5230\u8d26\u3002");
  }


  const credits = formatCredits(account);
  const membership = account?.membership;
  const selectedPlan = plans.find((plan) => plan.id === selected) || plans[1];

  return (
    <>
      <PageHeader eyebrow="会员与支付" title="免费体验建立信任，付费服务按价值分层" desc="这里已经具备套餐、订单、支付通道、支付回调、权益发放和状态查询骨架。正式上线时，把收银台地址与支付平台回调接上即可。" />

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
            <div className="service-price"><strong>{formatPrice(plan.price)}</strong><em>{plan.credits ? `${plan.credits} 次` : "预约制"}</em></div>
            <p>{plan.desc}</p>
            <ul>{plan.features.map((item) => <li key={item}>{item}</li>)}</ul>
            <Button type="button" onClick={() => buy(plan.id)} disabled={status === "loading" || plan.id === "free"}>{plan.id === "free" ? "免费体验无需支付" : "创建订单"}</Button>
          </article>
        ))}
      </section>

      <section className="payment-provider-panel">
        <div>
          <span>支付通道</span>
          <h2>选择收银台通道</h2>
          <p>正式上线建议使用通用 HMAC 网关承接支付平台服务端通知，再由微信、支付宝或 Stripe 网关映射订单字段。</p>
        </div>
        <select value={paymentProvider} onChange={(event) => setPaymentProvider(event.target.value)}>
          {paymentProviders.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
        </select>
      </section>

      <section className="checkout-panel checkout-panel-rich">
        <div className="checkout-main">
          <span>{"\u8ba2\u5355\u72b6\u6001"}</span>
          <h2>{order ? order.planName || order.plan_name : "\u5c1a\u672a\u521b\u5efa\u8ba2\u5355"}</h2>
          <p>{order ? `????${order.id} ? ???${order.status} ? ???${order.amountText || formatPrice(order.amount)} ? ???${order.provider || "manual"}${order.checkoutUrl ? " ? ??????" : ""}` : "\u9009\u62e9\u5957\u9910\u540e\u4f1a\u751f\u6210\u8ba2\u5355\u3002\u5f53\u524d\u5148\u652f\u6301\u6536\u6b3e\u7801/\u8f6c\u8d26\u5f0f\u652f\u4ed8\uff0c\u7ba1\u7406\u5458\u786e\u8ba4\u5230\u8d26\u540e\u81ea\u52a8\u53d1\u653e\u6b21\u6570\u3002"}</p>
          {order ? (
            <div className="payment-info-grid">
              <article><b>{"\u5e94\u4ed8\u91d1\u989d"}</b><strong>{order.amountText || formatPrice(order.amount)}</strong></article>
              <article><b>{"\u4ed8\u6b3e\u5907\u6ce8"}</b><strong>{order.paymentInstructions?.transferNote || `ORDER:${order.id}`}</strong></article>
              <article><b>{"\u6536\u6b3e\u4eba"}</b><strong>{order.paymentInstructions?.receiverName || "\u5f85\u914d\u7f6e"}</strong></article>
              <article><b>{"\u786e\u8ba4\u65b9\u5f0f"}</b><strong>{"\u540e\u53f0\u786e\u8ba4\u5230\u8d26"}</strong></article>
            </div>
          ) : null}
        </div>
        {order ? (
          <div className="payment-box">
            <div className="payment-qr-grid">
              <div>
                <span>{"\u5fae\u4fe1\u6536\u6b3e"}</span>
                {order.paymentInstructions?.wechatQrUrl ? <img src={order.paymentInstructions.wechatQrUrl} alt="\u5fae\u4fe1\u6536\u6b3e\u7801" /> : <em>{"\u672a\u914d\u7f6e"}</em>}
              </div>
              <div>
                <span>{"\u652f\u4ed8\u5b9d\u6536\u6b3e"}</span>
                {order.paymentInstructions?.alipayQrUrl ? <img src={order.paymentInstructions.alipayQrUrl} alt="\u652f\u4ed8\u5b9d\u6536\u6b3e\u7801" /> : <em>{"\u672a\u914d\u7f6e"}</em>}
              </div>
            </div>
            <div className="payment-bank-info">
              <span>{"\u94f6\u884c\u6216\u8f6c\u8d26\u4fe1\u606f"}</span>
              <p>{order.paymentInstructions?.bankName || "\u672a\u914d\u7f6e\u94f6\u884c\u540d\u79f0"} ? {order.paymentInstructions?.bankAccount || "\u672a\u914d\u7f6e\u8d26\u53f7"} ? {order.paymentInstructions?.bankAccountName || "\u672a\u914d\u7f6e\u6237\u540d"}</p>
              <small>{order.paymentInstructions?.notice || "\u4ed8\u6b3e\u5b8c\u6210\u540e\u7b49\u5f85\u7ba1\u7406\u5458\u786e\u8ba4\u5230\u8d26\u5e76\u53d1\u653e\u6b21\u6570\u3002"}</small>
              {!order.paymentInstructions?.configured ? <small className="payment-warning">{"\u5c1a\u672a\u914d\u7f6e\u6536\u6b3e\u7801\u6216\u6536\u6b3e\u8bf4\u660e\uff0c\u8bf7\u5728 Cloudflare \u53d8\u91cf\u4e2d\u586b\u5199 PAYMENT_WECHAT_QR_URL / PAYMENT_ALIPAY_QR_URL \u7b49\u4fe1\u606f\u3002"}</small> : null}
            </div>
          </div>
        ) : null}
        <div className="form-actions checkout-actions">
          {order?.checkoutUrl ? <Button type="button" onClick={() => window.open(order.checkoutUrl, "_blank", "noopener,noreferrer")}>{"\u6253\u5f00\u6536\u94f6\u53f0"}</Button> : null}
          <Button type="button" variant="secondary" onClick={copyPaymentInfo} disabled={!order}>{"\u590d\u5236\u4ed8\u6b3e\u4fe1\u606f"}</Button>
          <Button type="button" variant="ghost" onClick={() => refreshOrder("\u8ba2\u5355\u72b6\u6001\u5df2\u5237\u65b0\u3002")} disabled={!order || status === "loading"}>{"\u67e5\u8be2\u5230\u8d26\u7ed3\u679c"}</Button>
          <Button type="button" variant="ghost" onClick={() => refreshAccount("\u8d26\u6237\u72b6\u6001\u5df2\u5237\u65b0\u3002")} disabled={!session || status === "loading"}>{"\u5237\u65b0\u6743\u76ca"}</Button>
          <Button type="button" variant="ghost" onClick={() => setRoute("account")}>{"\u67e5\u770b\u7528\u6237\u4e2d\u5fc3"}</Button>
        </div>
      </section>
      <Notice>{notice}</Notice>
    </>
  );
}
