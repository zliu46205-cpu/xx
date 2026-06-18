import { useMemo, useState } from "react";
import { fieldLabels, methods } from "../data/siteData";
import { Button, EmptyState } from "../components/Primitives";
import { PageHeader } from "../components/Layout";

const categories = [
  ["all", "全部"],
  ["birth", "出生盘"],
  ["event", "占断"],
  ["space", "空间时间"],
  ["naming", "命名整理"],
  ["integrated", "推荐路径"],
];

const searchAliases = {
  工作: "事业",
  职业: "事业",
  感情: "关系",
  恋爱: "关系",
  婚姻: "关系",
  搬家: "风水",
  装修: "风水",
  公司: "品牌",
};

export function MethodsPage({ setRoute, selectedMethod, selectMethod }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recommended");

  const filtered = useMemo(() => {
    const text = query.trim();
    const alias = searchAliases[text] || text;
    return methods
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => !text || `${item.name}${item.tag}${item.scene}${item.output}${item.need}`.includes(text) || `${item.name}${item.tag}${item.scene}${item.output}${item.need}`.includes(alias))
      .sort((a, b) => {
        if (sort === "recommended") return Number(Boolean(b.recommended)) - Number(Boolean(a.recommended));
        if (sort === "name") return a.name.localeCompare(b.name, "zh-CN");
        return a.categoryName.localeCompare(b.categoryName, "zh-CN");
      });
  }, [category, query, sort]);

  return (
    <>
      <PageHeader
        eyebrow="卦术功能"
        title="选择合适的方法，而不是盲目测算"
        desc="每一种术数都有适用范围、输入要求和不适合处理的问题。功能页提供搜索、筛选、排序与详情说明。"
        actions={<Button onClick={() => setRoute("consult")}>不知道选什么，直接综合咨询</Button>}
      />

      <section className="toolbar-panel">
        <label>
          搜索方法
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：工作、感情、择时、起名" />
        </label>
        <label>
          分类
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          排序
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recommended">推荐优先</option>
            <option value="category">按分类</option>
            <option value="name">按名称</option>
          </select>
        </label>
      </section>

      {filtered.length ? (
        <section className="method-list">
          {filtered.map((method) => (
            <article className={selectedMethod === method.id ? "method-row selected" : "method-row"} key={method.id}>
              <img src={method.image} alt="" />
              <div>
                <span>{method.categoryName} · {method.tag}</span>
                <h2>{method.name}</h2>
                <p>{method.scene}</p>
                <dl>
                  <dt>需要信息</dt>
                  <dd>{method.need}</dd>
                  <dt>报告内容</dt>
                  <dd>{method.output}</dd>
                </dl>
                <div className="field-pills">
                  {method.fields.map((field) => (
                    <small key={field}>{fieldLabels[field] || field}</small>
                  ))}
                </div>
              </div>
              <div className="row-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    selectMethod(method.id);
                    setRoute("detail");
                  }}
                >
                  查看详情
                </Button>
                <Button
                  onClick={() => {
                    selectMethod(method.id);
                    setRoute("consult");
                  }}
                >
                  使用此法
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="没有找到匹配的方法"
          desc="可以换一个关键词，或使用综合咨询先整理问题。"
          action={<Button onClick={() => setCategory("all")}>查看全部</Button>}
        />
      )}
    </>
  );
}
