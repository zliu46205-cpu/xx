import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { createOrder, getAccount, getOrderDetail } from "../utils/api";

export const plans = [
  {
    id: "free",
    name: "免费体验",
    price: 0,
    unit: "每日 1 次",
    credits: 1,
    badge: "入门",
    desc: "适合先体验问题归类、主象提示、简版建议和边界提醒。",
    features: ["简版报告", "基础术数选择", "可复制摘要"],
  },
  {
    id: "single",
    name: "标准/深度体验包",
    price: 1990,
    unit: "3 次",
    credits: 3,
    badge: "主推",
    desc: "适合一个明确问题，可生成 3 次标准报告或 1 次深度报告。",
    features: ["3 次标准报告", "或 1 次深度报告", "术语解释", "TXT 导出"],
  },
  {
    id: "monthly",
    name: "月度会员",
    price: 9900,
    unit: "30 天",
    credits: 30,
    badge: "复购",
    desc: "适合持续测算、保存报告和多主题比较。",
    features: ["30 次完整报告", "历史记录", "优先生成", "会员标识"],
  },
  {
    id: "yearly",
    name: "年度会员",
    price: 39900,
    unit: "365 天",
    credits: 420,
    badge: "高价值",
    desc: "适合长期使用，后续可接年度流年和专题权益。",
    features: ["420 次完整报告", "年度规划", "专题折扣", "数据存档"],
  },
  {
    id: "review",
    name: "人工复核预约",
    price: 29900,
    unit: "每次",
    credits: 0,
    badge: "服务层",
    desc: "后续接入人工服务，不做恐吓式消灾收费。",
    features: ["人工校对", "补充追问", "报告修订", "预约制"],
  },
];

const paymentProviders = [
  { id: "wechat", label: "微信支付" },
  { id: "alipay", label: "支付宝" },
];

function formatCredits(account) {
  return Number(account?.user?.credits ?? account?.stats?.credits ?? 0);
}

function formatPrice(price) {
  return price ? `¥${(price / 100).toFixed(2)}` : "¥0";
}

function statusText(status) {
  if (status === "paid") return "已支付，权益已发放";
  if (status === "pending") return "待支付";
  if (status === "cancelled") return "已取消";
  return status || "未创建";
}

export function BillingPage({ session, setRoute }) {
  const [selected, setSelected] = useState("single");
  const [notice, setNotice] = useState("");
  const [order, setOrder] = useState(null);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("idle");
  const [paymentProvider, setPaymentProvider] = useState("wechat");

  useEffect(() => {
    if (!session) return;
    getAccount(session).then(setAccount).catch(() => null);
  }, [session]);

  useEffect(() => {
    if (!order || !session || order.status === "paid") return undefined;
    const timer = window.setInterval(() => {
      refreshOrder("", { silent: true });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [order?.id, order?.status, session?.token]);

  async function refreshAccount(message) {
    if (!session) return null;
    const payload = await getAccount(session);
    setAccount(payload);
    if (message) setNotice(message);
    return payload;
  }

  async function buy(planId) {
    if (!session) {
      setNotice("请先登录后再创建订单。订单和权益需要绑定到你的账号。");
      setRoute("login");
      return;
    }
    setSelected(planId);
    setStatus("loading");
    try {
      const payload = await createOrder(planId, session, paymentProvider);
      setOrder(payload.order);
      await refreshAccount("订单已创建。请使用微信或支付宝扫码付款，到账后系统会自动发放权益。");
    } catch (error) {
      setNotice(error.message || "订单创建失败");
    } finally {
      setStatus("idle");
    }
  }

  async function refreshOrder(message, options = {}) {
    if (!order || !session) return null;
    if (!options.silent) setStatus("loading");
    try {
      const payload = await getOrderDetail(order.id, session);
      setOrder(payload.order);
      const nextAccount = await refreshAccount();
      if (payload.order.status === "paid") {
        setNotice(`支付已确认，权益已发放。当前剩余 ${formatCredits(nextAccount)} 次。`);
      } else if (message) {
        setNotice(message);
      }
      return payload.order;
    } catch (error) {
      if (!options.silent) setNotice(error.message || "订单状态查询失败。");
      return null;
    } finally {
      if (!options.silent) setStatus("idle");
    }
  }

  async function copyPaymentInfo() {
    if (!order) return;
    const pay = order.paymentInstructions || {};
    const lines = [
      `订单号：${order.id}`,
      `金额：${order.amountText || formatPrice(order.amount)}`,
      pay.receiverName ? `收款人：${pay.receiverName}` : "",
      `付款备注：${pay.transferNote || `ORDER:${order.id}`}`,
      "付款方式：微信或支付宝扫码付款",
    ].filter(Boolean).join("\n");
    await navigator.clipboard?.writeText(lines);
    setNotice("付款信息已复制。付款时建议备注订单号，便于核对。");
  }

  const credits = formatCredits(account);
  const membership = account?.membership;
  const selectedPlan = plans.find((plan) => plan.id === selected) || plans[1];
  const pay = order?.paymentInstructions || {};
  const currentQr = paymentProvider === "wechat" ? pay.wechatQrUrl : pay.alipayQrUrl;

  return (
    <>
      <PageHeader
        eyebrow="会员与支付"
        title="微信 / 支付宝扫码付款，到账后发放权益"
        desc="当前只支持微信与支付宝。若接入微信支付或支付宝商户回调，系统会在收到平台通知后自动确认订单并发放次数或会员权益。"
      />

      <section className="billing-status-strip">
        <article>
          <span>当前账号</span>
          <strong>{session ? session.email || session.name : "未登录"}</strong>
          <p>{session ? "订单和次数会保存到当前账号。" : "登录后才能购买套餐。"}</p>
        </article>
        <article>
          <span>剩余次数</span>
          <strong>{session ? credits : "--"}</strong>
          <p>标准报告扣 1 次，深度报告按后续规则扣减。</p>
        </article>
        <article>
          <span>会员状态</span>
          <strong>{membership ? membership.plan_name || membership.planName : "未开通"}</strong>
          <p>{membership?.end_at || membership?.endAt ? `到期：${membership.end_at || membership.endAt}` : "支付成功后会显示会员权益。"}</p>
        </article>
        <article>
          <span>当前选择</span>
          <strong>{selectedPlan.name}</strong>
          <p>{selectedPlan.desc}</p>
        </article>
      </section>

      <section className="billing-grid">
        {plans.map((plan) => (
          <article className={`billing-card ${selected === plan.id ? "selected" : ""}`} key={plan.id}>
            <div className="service-top"><span>{plan.badge}</span><small>{plan.unit}</small></div>
            <h2>{plan.name}</h2>
            <div className="service-price"><strong>{formatPrice(plan.price)}</strong><em>{plan.credits ? `${plan.credits} 次` : "预约制"}</em></div>
            <p>{plan.desc}</p>
            <ul>{plan.features.map((item) => <li key={item}>{item}</li>)}</ul>
            <Button type="button" onClick={() => buy(plan.id)} disabled={status === "loading" || plan.id === "free"}>
              {plan.id === "free" ? "免费体验无需支付" : "创建支付订单"}
            </Button>
          </article>
        ))}
      </section>

      <section className="payment-provider-panel">
        <div>
          <span>支付方式</span>
          <h2>只支持微信与支付宝</h2>
          <p>个人收款码无法向网站主动发送到账通知。若要真正自动检测到账，需要开通微信支付商户号、支付宝开放平台或聚合支付，并配置回调密钥。</p>
        </div>
        <select value={paymentProvider} onChange={(event) => setPaymentProvider(event.target.value)}>
          {paymentProviders.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
        </select>
      </section>

      <section className="checkout-panel checkout-panel-rich">
        <div className="checkout-main">
          <span>订单状态</span>
          <h2>{order ? order.planName || order.plan_name : "尚未创建订单"}</h2>
          <p>
            {order
              ? `订单号 ${order.id} · ${statusText(order.status)} · 金额 ${order.amountText || formatPrice(order.amount)} · 通道 ${paymentProvider === "wechat" ? "微信支付" : "支付宝"}`
              : "选择套餐后会生成订单。用户扫码付款后，系统会定时查询订单状态；正式商户回调配置完成后可自动发放权益。"}
          </p>
          {order ? (
            <div className="payment-info-grid">
              <article><b>应付金额</b><strong>{order.amountText || formatPrice(order.amount)}</strong></article>
              <article><b>付款备注</b><strong>{pay.transferNote || `ORDER:${order.id}`}</strong></article>
              <article><b>收款人</b><strong>{pay.receiverName || "待配置"}</strong></article>
              <article><b>确认方式</b><strong>{order.status === "paid" ? "已自动/后台确认" : "等待到账确认"}</strong></article>
            </div>
          ) : null}
        </div>

        {order ? (
          <div className="payment-box">
            <div className="payment-method-tabs">
              <button type="button" className={paymentProvider === "wechat" ? "active" : ""} onClick={() => setPaymentProvider("wechat")}>微信支付</button>
              <button type="button" className={paymentProvider === "alipay" ? "active" : ""} onClick={() => setPaymentProvider("alipay")}>支付宝</button>
            </div>
            <div className={`payment-qr-single ${paymentProvider}`}>
              <span>{paymentProvider === "wechat" ? "微信扫码付款" : "支付宝扫码付款"}</span>
              {currentQr ? <img src={currentQr} alt={paymentProvider === "wechat" ? "微信收款码" : "支付宝收款码"} /> : <em>尚未配置收款码</em>}
              <p>{pay.notice || "付款后请保留截图。开通正式商户回调后，系统会自动确认到账并发放权益。"}</p>
              {!pay.configured ? <small className="payment-warning">请在 Cloudflare 变量中配置 PAYMENT_WECHAT_QR_URL / PAYMENT_ALIPAY_QR_URL，或使用项目内默认收款码。</small> : null}
            </div>
          </div>
        ) : null}

        <div className="form-actions checkout-actions">
          <Button type="button" variant="secondary" onClick={copyPaymentInfo} disabled={!order}>复制付款信息</Button>
          <Button type="button" variant="ghost" onClick={() => refreshOrder("订单状态已刷新。")} disabled={!order || status === "loading"}>刷新到账状态</Button>
          <Button type="button" variant="ghost" onClick={() => refreshAccount("账户状态已刷新。")} disabled={!session || status === "loading"}>刷新权益</Button>
          <Button type="button" variant="ghost" onClick={() => setRoute("account")}>查看用户中心</Button>
        </div>
      </section>
      <Notice>{notice}</Notice>
    </>
  );
}
