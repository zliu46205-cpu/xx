import heroImage from "../assets/luxury-hero-ziwei.png";
import { chartMetrics, caseStudies, frontFortuneTests, heroStats, knowledgeGraphs, methods, pricingNotes, processSteps, serviceCatalog, trustProofs } from "../data/siteData";
import { Button, Section } from "../components/Primitives";
import { MetricBars, MiniTrend } from "../components/Charts";

export function HomePage({ setRoute, selectMethod }) {
  const popular = methods.filter((item) => ["bazi", "ziwei", "meihua", "liuyao", "qimen", "integrated"].includes(item.id));

  return (
    <>
      <section className="hero-section">
        <img className="hero-bg" src={heroImage} alt="" />
        <div className="hero-shade" />
        <div className="gold-particles" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <i key={index} />
          ))}
        </div>

        <div className="hero-inner">
          <div className="hero-copy">
            <span className="seal">易经命理 · 八字姻缘 · 流年测算</span>
            <h1>观八字命数，测姻缘财运。</h1>
            <p>
              融合八字、紫微、梅花、六爻、奇门、合婚、起名、流年等传统术数，提供更适合玄学用户的命理测算与报告解读。
            </p>
            <div className="hero-actions">
              <Button onClick={() => setRoute("consult")}>免费体验</Button>
              <Button variant="secondary" onClick={() => setRoute("methods")}>
                查看卦术
              </Button>
            </div>
            <div className="hero-trust">
              {trustProofs.map((item) => (
                <span key={item}>✓ {item}</span>
              ))}
            </div>
          </div>

          <div className="hero-orb">
            <div className="bagua-ring">乾 坤 震 巽 坎 离 艮 兑</div>
            <div className="live-card">
              <span>天机观象盘</span>
              <strong>命理测算中</strong>
              <MetricBars items={chartMetrics} />
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band">
        {heroStats.map(([value, label, note]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
            <small>{note}</small>
          </div>
        ))}
        <MiniTrend />
      </section>

      <Section eyebrow="热门测算" title="先选你最想看的命题" desc="把用户最关心的八字、命数、姻缘、事业、财运、流年放在最前面，进入后再匹配具体术数。">
        <div className="fortune-grid">
          {frontFortuneTests.map((item) => (
            <button
              className="fortune-card"
              key={`${item.title}-${item.subtitle}`}
              onClick={() => {
                selectMethod(item.id);
                setRoute("consult");
              }}
            >
              <span>{item.subtitle}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <strong>{item.price}</strong>
            </button>
          ))}
        </div>
      </Section>

      <Section eyebrow="术数体系" title="从问题出发选择方法" desc="不知道选什么时，可直接使用综合咨询，由系统先帮你归类。">
        <div className="method-grid">
          {popular.map((method) => (
            <button
              className={`method-card ${method.recommended ? "recommended" : ""}`}
              key={method.id}
              onClick={() => {
                selectMethod(method.id);
                setRoute("detail");
              }}
            >
              <img src={method.image} alt="" />
              <span>{method.categoryName}</span>
              <h3>{method.name}</h3>
              <p>{method.scene}</p>
              <small>{method.tag}</small>
            </button>
          ))}
        </div>
      </Section>

      <Section eyebrow="占卜流程" title="先立问，再观象，最后回到行动" className="process-section">
        <div className="process-grid">
          {processSteps.map(([num, title, desc]) => (
            <div className="process-card" key={num}>
              <b>{num}</b>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="功能与价格" title="免费体验先建立信任，付费服务按价值分层" desc="这里是商业化上线建议，不做恐吓式付费，不承诺保证结果。">
        <div className="service-grid">
          {serviceCatalog.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-top">
                <span>{service.tier}</span>
                <small>{service.badge}</small>
              </div>
              <h3>{service.title}</h3>
              <div className="service-price">
                <strong>{service.price}</strong>
                <em>{service.unit}</em>
              </div>
              <ul>
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p>{service.bestFor}</p>
              <Button variant={service.tier === "免费功能" ? "primary" : "secondary"} onClick={() => setRoute("consult")}>
                {service.tier === "免费功能" ? "立即免费体验" : "查看可测项目"}
              </Button>
            </article>
          ))}
        </div>
        <div className="pricing-notes">
          {pricingNotes.map((note) => (
            <small key={note}>{note}</small>
          ))}
        </div>
      </Section>

      <Section eyebrow="知识图谱" title="让用户看见方法，而不是只看结论">
        <div className="knowledge-strip">
          {knowledgeGraphs.slice(0, 4).map((graph) => (
            <article key={graph.id}>
              <img src={graph.image} alt="" />
              <div>
                <span>{graph.category}</span>
                <h3>{graph.name}</h3>
                <p>{graph.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="测算案例" title="把玄学语言翻译成现实问题">
        <div className="case-grid">
          {caseStudies.map((item) => (
            <article className="case-card" key={item.title}>
              <span>{item.type}</span>
              <h3>{item.title}</h3>
              <p className="case-question">问：{item.question}</p>
              <strong>{item.result}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
