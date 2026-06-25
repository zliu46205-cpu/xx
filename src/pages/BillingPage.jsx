import { useEffect, useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { PageHeader } from "../components/Layout";
import { getAccount } from "../utils/api";

export const plans = [
  { id: "free", name: "免费体验", price: 0, unit: "公测开放", credits: 1, badge: "当前可用", desc: "适合先体验问题归类、主象提示、简版建议和边界提醒。", features: ["简版报告", "基础术数选择", "可复制摘要"] },
  { id: "single", name: "标准/深度体验包", price: 1990, unit: "3 次", credits: 3, badge: "限免开放", desc: "适合一个明确问题，可生成标准报告或深度报告。", features: ["标准报告", "深度报告", "术语解释", "TXT 导出"] },
  { id: "monthly", name: "月度会员", price: 9900, unit: "30 天", credits: 30, badge: "限免开放", desc: "适合持续测算、保存报告和多主题比较。", features: ["完整报告", "历史记录", "优先生成", "会员标识"] },
  { id: "yearly", name: "年度会员", price: 39900, unit: "365 天", credits: 420, badge: "限免开放", desc: "适合长期使用，后续可接年度流年和专题权益。", features: ["年度规划", "专题报告", "数据存档", "长期权益"] },
  { id: "review", name: "人工复核预约", price: 29900, unit: "每次", credits: 0, badge: "暂未开放", desc: "后续接入人工服务，不做恐吓式消灾收费。", features: ["人工校对", "补充追问", "报告修订", "预约制"] },
];

function formatCredits(account) {
  return Number(account?.user?.credits ?? account?.stats?.credits ?? 0);
}

function formatPrice(price) {
  return price ? `¥${(price / 100).toFixed(2)}` : "¥0";
}

export function BillingPage({ session, setRoute }) {
  const [selected, setSelected] = useState("single");
  const [notice, setNotice] = useState("当前处于限时免费公测阶段，价格仅作为后续正式服务分层展示，不会产生支付。你可以直接进入测算使用。");
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (!session) return;
    getAccount(session).then(setAccount).catch(() => null);
  }, [session]);

  function startFreeUse(planId) {
    setSelected(planId);
    setNotice("限时免费公测中：该档位当前无需支付，可直接进入测算页面体验。");
    setRoute("consult");
  }

  const selectedPlan = plans.find((plan) => plan.id === selected) || plans[1];

  return (
    <>
      <PageHeader
        eyebrow="限时免费公测"
        title="价格保留展示，当前不接入支付"
        desc="本站刚刚上线，为欢迎大家使用，现阶段所有测算功能限时免费开放。页面中的金额和套餐按钮用于展示后续正式服务分层，当前不会跳转支付，也不会扣费。"
      />

      <section className="billing-status-strip beta-free-strip">
        <article>
          <span>当前状态</span>
          <strong>限时免费</strong>
          <p>暂不公布结束时间，后续恢复付费前会提前在站内说明。</p>
        </article>
        <article>
          <span>当前账号</span>
          <strong>{session ? session.email || session.name : "游客可体验"}</strong>
          <p>{session ? "登录用户可保存历史记录。" : "不登录也可以先体验生成报告。"}</p>
        </article>
        <article>
          <span>剩余次数</span>
          <strong>{session ? formatCredits(account) : "不限体验"}</strong>
          <p>公测期标准与深度报告不扣次数。</p>
        </article>
        <article>
          <span>当前选择</span>
          <strong>{selectedPlan.name}</strong>
          <p>{selectedPlan.desc}</p>
        </article>
      </section>

      <section className="beta-announcement-panel">
        <span>站内公告</span>
        <h2>新站上线欢迎体验，当前全站限时免费</h2>
        <p>为了让更多用户先体验报告质量、术数结构和交互流程，当前八字、紫微、梅花、六爻、奇门、风水、择日、起名和综合咨询均先免费开放。</p>
        <p>金额会继续保留在页面中，用于让用户了解后续正式版本的服务层级。当前点击套餐按钮只会进入测算，不会打开支付，也不会向你的账户发起付款。</p>
      </section>

      <section className="billing-grid">
        {plans.map((plan) => (
          <article className={`billing-card ${selected === plan.id ? "selected" : ""}`} key={plan.id}>
            <div className="service-top"><span>{plan.badge}</span><small>{plan.unit}</small></div>
            <h2>{plan.name}</h2>
            <div className="service-price"><strong>{formatPrice(plan.price)}</strong><em>{plan.price ? "正式价展示" : "当前免费"}</em></div>
            <p>{plan.desc}</p>
            <ul>{plan.features.map((item) => <li key={item}>{item}</li>)}</ul>
            <Button type="button" onClick={() => startFreeUse(plan.id)} disabled={plan.id === "review"}>
              {plan.id === "review" ? "后续开放" : "限免使用"}
            </Button>
          </article>
        ))}
      </section>

      <section className="checkout-panel checkout-panel-rich beta-payment-paused">
        <div className="checkout-main">
          <span>支付系统状态</span>
          <h2>暂不接入支付，先扩大真实使用反馈</h2>
          <p>当前阶段的目标是验证用户是否愿意使用、报告是否足够清楚、功能路径是否顺畅。支付接口和订单能力会先保留在代码中，但前台不会触发真实付款。</p>
          <div className="payment-info-grid">
            <article><b>用户侧</b><strong>直接体验</strong></article>
            <article><b>金额展示</b><strong>保留</strong></article>
            <article><b>支付跳转</b><strong>关闭</strong></article>
            <article><b>恢复付费</b><strong>后续开启</strong></article>
          </div>
        </div>
        <div className="payment-box beta-feedback-box">
          <span>建议观察数据</span>
          <p>先重点观察访问量、注册率、报告生成率、用户停留时长、用户复访率和真实咨询问题类型。等用户确实有需求，再恢复微信/支付宝正式商户支付。</p>
        </div>
      </section>
      <Notice>{notice}</Notice>
    </>
  );
}
