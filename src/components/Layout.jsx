const appName = "天机观象";
const appSubtitle = "AI 易经命理测算平台";
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

