export function MetricBars({ items }) {
  return (
    <div className="metric-bars" aria-label="平台质量指标示意">
      {items.map((item) => (
        <div className="metric-row" key={item.label}>
          <div className="metric-copy">
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
          <div className="metric-track">
            <i style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniTrend() {
  const values = [38, 56, 49, 72, 66, 84, 78, 91];
  const points = values.map((value, index) => `${index * 42},${100 - value}`).join(" ");
  return (
    <div className="trend-card">
      <div>
        <span>今日问题热度</span>
        <strong>事业 / 关系 / 择时</strong>
      </div>
      <svg viewBox="0 0 294 110" role="img" aria-label="演示折线图">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        {values.map((value, index) => (
          <circle key={value + index} cx={index * 42} cy={100 - value} r="4" />
        ))}
      </svg>
      <small>演示数据，上线后接真实统计。</small>
    </div>
  );
}
