import { apiSpec, encyclopediaItems, faqs } from "../data/siteData";
import { PageHeader } from "../components/Layout";

export function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="关于与边界"
        title="可信的关键，不是说得玄，而是知道什么不能说"
        desc="平台定位是传统文化咨询、象征性反思与生活规划辅助。越面向大众，越要把隐私、边界和风险处理讲清楚。"
      />

      <section className="about-grid">
        <article>
          <h2>我们做什么</h2>
          <p>帮助用户澄清问题、选择方法、理解象征语言，并把报告转化为现实可执行的下一步。</p>
          <p>输出包括依据、推演、倾向、建议与限制，避免只给一句玄而又玄的结论。</p>
        </article>
        <article>
          <h2>我们不做什么</h2>
          <p>不做死亡预测、灾祸恐吓、疾病诊断、彩票股票预测、付费消灾、诅咒害人、保证复合或保证发财。</p>
          <p>不鼓励用户放弃医疗、法律、心理咨询、财务顾问等专业帮助。</p>
        </article>
        <article>
          <h2>隐私原则</h2>
          <p>出生时间、关系困扰、住址空间、家庭信息都属于敏感资料。上线版本应提供最少采集、明示用途、导出与删除能力。</p>
        </article>
        <article>
          <h2>高风险处理</h2>
          <p>遇到强烈焦虑、自伤倾向、重大法律医疗投资问题时，应先给支持性回应，并建议联系现实中的专业人士或可信赖的人。</p>
        </article>
      </section>

      <section className="api-section">
        <h2>后续接口设计</h2>
        <div className="api-table">
          {apiSpec.map(([method, path, desc]) => (
            <div key={path}>
              <code>{method}</code>
              <strong>{path}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="encyclopedia-section">
        <h2>易学百科入口</h2>
        <div className="encyclopedia-grid">
          {encyclopediaItems.map((item) => (
            <article key={item.title}>
              <span>知识库</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <h2>FAQ</h2>
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}
