import { appMeta, navItems } from "../data/siteData";

export function AppShell({ route, setRoute, children }) {
  const isAuth = route === "login" || route === "admin";

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setRoute("home")} aria-label="返回首页">
          <span className="brand-mark">象</span>
          <span>
            <strong>{appMeta.name}</strong>
            <small>{appMeta.subtitle}</small>
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
          <button className={route === "login" ? "ghost active" : "ghost"} onClick={() => setRoute("login")}>
            用户登录
          </button>
          <button className={route === "admin" ? "ghost active" : "ghost"} onClick={() => setRoute("admin")}>
            管理员
          </button>
          <button className="nav-cta" onClick={() => setRoute("consult")}>
            开始测算
          </button>
        </div>
      </header>

      <main className={isAuth ? "auth-main" : ""}>{children}</main>

      <footer className="site-footer">
        <div>
          <strong>{appMeta.name}</strong>
          <p>{appMeta.safety}</p>
        </div>
        <div className="footer-links">
          <button onClick={() => setRoute("about")}>隐私与免责声明</button>
          <button onClick={() => setRoute("methods")}>术数体系</button>
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
