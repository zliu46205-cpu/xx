export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`btn ${variant}`} {...props}>
      {children}
    </button>
  );
}

export function Section({ id, eyebrow, title, desc, children, className = "" }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="section-title">
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
        {desc ? <p>{desc}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, desc, action }) {
  return (
    <div className="empty-state">
      <span className="empty-mark">空</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      {action}
    </div>
  );
}

export function SkeletonReport() {
  return (
    <div className="report-panel skeleton-panel" aria-label="报告生成中">
      <div className="skeleton-line long" />
      <div className="skeleton-grid">
        <div />
        <div />
      </div>
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
      <div className="skeleton-line" />
    </div>
  );
}

export function Notice({ type = "info", children }) {
  if (!children) return null;
  return <div className={`notice ${type}`}>{children}</div>;
}
