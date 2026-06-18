import { fieldLabels, knowledgeGraphs, methods } from "../data/siteData";
import { Button } from "../components/Primitives";
import { PageHeader } from "../components/Layout";

export function MethodDetailPage({ selectedMethod, selectMethod, setRoute }) {
  const method = methods.find((item) => item.id === selectedMethod) || methods[0];
  const relatedGraph = knowledgeGraphs.find((item) => method.name.includes(item.name.slice(0, 2))) || knowledgeGraphs[0];
  const siblings = methods.filter((item) => item.category === method.category && item.id !== method.id).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={method.categoryName}
        title={method.name}
        desc={method.scene}
        actions={
          <>
            <Button onClick={() => setRoute("consult")}>使用此方法</Button>
            <Button variant="secondary" onClick={() => setRoute("methods")}>返回功能页</Button>
          </>
        }
      />

      <section className="detail-layout">
        <article className="detail-main">
          <img className="detail-image" src={method.image} alt="" />
          <div className="detail-grid">
            <div>
              <span>适用场景</span>
              <p>{method.scene}</p>
            </div>
            <div>
              <span>需要信息</span>
              <p>{method.need}</p>
            </div>
            <div>
              <span>输出内容</span>
              <p>{method.output}</p>
            </div>
            <div>
              <span>禁止事项</span>
              <p>{method.unsuitable}</p>
            </div>
          </div>
        </article>

        <aside className="detail-side">
          <div className="side-card">
            <span>输入字段</span>
            {method.fields.map((field) => (
              <p key={field}>· {fieldLabels[field] || field}</p>
            ))}
          </div>
          <div className="side-card">
            <span>相关图谱</span>
            <img src={relatedGraph.image} alt="" />
            <strong>{relatedGraph.name}</strong>
            <p>{relatedGraph.desc}</p>
          </div>
        </aside>
      </section>

      {siblings.length ? (
        <section className="related-methods">
          <h2>同类方法</h2>
          <div>
            {siblings.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  selectMethod(item.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span>{item.tag}</span>
                <strong>{item.name}</strong>
                <small>{item.scene}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
