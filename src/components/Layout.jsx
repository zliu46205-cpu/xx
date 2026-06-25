import { useEffect, useState } from "react";

const appName = "天机观象";
const appSubtitle = "易经命理测算平台";
const safetyText = "本平台仅作传统文化、娱乐、反思与规划参考，不替代医疗、法律、心理、投资、婚姻等专业建议。";

const navItems = [
  { id: "home", label: "首页" },
  { id: "methods", label: "卦术功能" },
  { id: "consult", label: "免费体验" },
  { id: "billing", label: "会员套餐" },
  { id: "about", label: "边界说明" },
];

export function AppShell({ route, setRoute, session, logout, children }) {
  const isAuth = route === "login" || route === "admin";
  const [showBetaNotice, setShowBetaNotice] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("xuanxue-beta-notice-dismissed");
    if (!dismissed) setShowBetaNotice(true);
  }, []);

  function closeBetaNotice() {
    localStorage.setItem("xuanxue-beta-notice-dismissed", "true");
    setShowBetaNotice(false);
  }

  return (
    <div className="app-shell">
      <header className="site-header commercial-header">
        <button className="brand" onClick={() => setRoute("home")} aria-label="返回首页">
          <span className="brand-mark">象</span>
          <span>
            <strong>{appName}</strong>
            <small>{appSubtitle}</small>
          </span>
        </button>

        <nav className="nav" aria-label="主导航">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={route === item.id || (item.id === "methods" && route === "detail") ? "active" : ""}
              onClick={() => setRoute(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          {session ? (
            <>
              <button className={route === "account" ? "ghost active" : "ghost"} onClick={() => setRoute("account")}>{session.name || "用户中心"}</button>
              {session.role === "admin" ? <button className={route === "admin-dashboard" ? "ghost active" : "ghost"} onClick={() => setRoute("admin-dashboard")}>后台</button> : null}
              <button className="ghost" onClick={logout}>退出</button>
            </>
          ) : (
            <>
              <button className={route === "login" ? "ghost active" : "ghost"} onClick={() => setRoute("login")}>用户登录</button>
              <button className={route === "admin" ? "ghost active" : "ghost"} onClick={() => setRoute("admin")}>管理员</button>
            </>
          )}
          <button className="nav-cta" onClick={() => setRoute("consult")}>开始测算</button>
        </div>
      </header>

      {showBetaNotice ? (
        <div className="beta-notice-overlay" role="dialog" aria-modal="true" aria-labelledby="beta-notice-title">
          <section className="beta-notice-card">
            <button className="beta-notice-close" type="button" onClick={closeBetaNotice} aria-label="关闭公告">×</button>
            <span className="seal">限时免费公测</span>
            <h2 id="beta-notice-title">新站刚刚上线，现阶段免费开放使用</h2>
            <p>为了欢迎第一批用户体验，本站目前处于限时免费公测阶段。八字、紫微、梅花、六爻、奇门、择日、起名和综合咨询等功能均可先行使用。</p>
            <p>页面中保留的套餐金额和支付按钮，是为了展示后续服务分层与正式价格；当前不会跳转支付，也不会产生扣费。</p>
            <small>内容仅作传统文化、娱乐、反思与规划参考，不替代医疗、法律、心理、投资、婚姻等专业建议。</small>
            <div className="beta-notice-actions">
              <button type="button" className="btn primary" onClick={() => { closeBetaNotice(); setRoute("consult"); }}>立即免费体验</button>
              <button type="button" className="btn secondary" onClick={closeBetaNotice}>我知道了</button>
            </div>
          </section>
        </div>
      ) : null}

      <main className={isAuth ? "auth-main" : ""}>{children}</main>

      <footer className="site-footer">
        <div>
          <strong>{appName}</strong>
          <p>{safetyText}</p>
        </div>
        <div className="footer-links">
          <button onClick={() => setRoute("about")}>隐私与免责声明</button>
          <button onClick={() => setRoute("methods")}>术数体系</button>
          <button onClick={() => setRoute("billing")}>会员套餐</button>
          <button onClick={() => setRoute("consult")}>免费体验</button>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc, actions }) {
  return (
    <section className="page-head">
      <span className="seal">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{desc}</p>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </section>
  );
}
