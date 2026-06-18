import heroImage from "../assets/luxury-hero-ziwei.png";
import coinsImage from "../assets/luxury-coins.png";
import meihuaImage from "../assets/luxury-meihua.png";
import liuyaoImage from "../assets/luxury-liuyao.png";
import qimenImage from "../assets/luxury-qimen.png";
import ziweiKnowledge from "../assets/knowledge-ziwei.png";
import qimenKnowledge from "../assets/knowledge-qimen.png";
import coinsProcess from "../assets/knowledge-coins-process.png";
import meihuaKnowledge from "../assets/knowledge-meihua.png";
import liuyaoKnowledge from "../assets/knowledge-liuyao.png";

export const appMeta = {
  name: "天机观象",
  subtitle: "易经命理测算平台",
  safety:
    "本平台仅作传统文化、娱乐、反思与规划参考，不替代医疗、法律、心理、投资、婚姻等专业建议。",
};

export const navItems = [
  { id: "home", label: "首页" },
  { id: "methods", label: "卦术功能" },
  { id: "consult", label: "免费体验" },
  { id: "about", label: "关于与边界" },
];

export const methods = [
  {
    id: "bazi",
    name: "八字精批",
    category: "birth",
    categoryName: "出生盘",
    tag: "四柱十神",
    image: heroImage,
    accent: "甲子",
    scene: "适合长期性格、事业节律、资源压力结构与年度规划。",
    need: "出生年月日时、出生地、重点问题。出生时间不愿提供时，可走简化路径。",
    output: "日主旺衰、十神取象、五行流通、喜忌倾向、阶段建议。",
    unsuitable: "不适合用来下死亡、疾病、必然离婚、必然破财等断语。",
    fields: ["birthDate", "birthTime", "birthPlace"],
  },
  {
    id: "ziwei",
    name: "紫微斗数",
    category: "birth",
    categoryName: "出生盘",
    tag: "十二宫位",
    image: heroImage,
    accent: "紫微",
    scene: "适合命宫、官禄、财帛、夫妻、福德等人生主题整理。",
    need: "出生日期、时辰、性别、关注宫位或具体问题。",
    output: "命身宫、三方四正、四化飞星、宫位联参、现实建议。",
    unsuitable: "不适合把星曜当作绝对命令，也不替代现实关系判断。",
    fields: ["birthDate", "birthTime", "gender"],
  },
  {
    id: "coins",
    name: "铜钱占卜",
    category: "event",
    categoryName: "占断",
    tag: "三钱成卦",
    image: coinsImage,
    accent: "乾坤",
    scene: "适合一个具体问题的短期趋势观察与行动提醒。",
    need: "明确问题、事件背景、时间范围；可手动输入摇卦结果或由系统模拟。",
    output: "本卦、变卦、动爻、卦辞象辞、吉凶倾向与现实建议。",
    unsuitable: "不适合彩票、股票买卖、赌博结果、违法规避。",
    fields: ["castTime", "timeRange"],
  },
  {
    id: "meihua",
    name: "梅花易数",
    category: "event",
    categoryName: "占断",
    tag: "数起卦",
    image: meihuaImage,
    accent: "体用",
    scene: "适合用时间、数字、声音、物象快速观察一事一象。",
    need: "问题、数字或起卦时间、事件背景。",
    output: "体用生克、本互变卦、应象、应对策略。",
    unsuitable: "不适合过度重复追问同一问题以寻求确定答案。",
    fields: ["numberSeed", "castTime"],
  },
  {
    id: "liuyao",
    name: "六爻占断",
    category: "event",
    categoryName: "占断",
    tag: "世应用神",
    image: liuyaoImage,
    accent: "六亲",
    scene: "适合 offer、合作、考试、等待结果等具体事件。",
    need: "问题、卦象、起卦时间、事件截止点。",
    output: "用神、世应、六亲、六神、动变与应期参考。",
    unsuitable: "不适合恐吓式灾祸判断或代替合同、法律、医学判断。",
    fields: ["castTime", "deadline"],
  },
  {
    id: "qimen",
    name: "奇门遁甲",
    category: "space",
    categoryName: "时空策略",
    tag: "九宫八门",
    image: qimenImage,
    accent: "九宫",
    scene: "适合谈判、出行、择时、方案比较与短期策略。",
    need: "目标、时间、地点、可选方案。",
    output: "九宫、八门、九星、八神、用神定位与策略建议。",
    unsuitable: "不适合宣称某个方向必然致富或必然招灾。",
    fields: ["location", "options"],
  },
  {
    id: "fengshui",
    name: "风水布局",
    category: "space",
    categoryName: "空间时间",
    tag: "阳宅动线",
    image: qimenImage,
    accent: "宅相",
    scene: "适合居住、办公、书桌、卧室、采光与动线优化。",
    need: "户型或文字描述、门窗床桌灶厕位置、主要困扰。",
    output: "形势观察、动线建议、采光通风、功能区调整。",
    unsuitable: "不做恐吓式形煞营销，不推销消灾物品。",
    fields: ["location", "background"],
  },
  {
    id: "naming",
    name: "起名整理",
    category: "naming",
    categoryName: "命名整理",
    tag: "音形义",
    image: meihuaImage,
    accent: "文心",
    scene: "适合宝宝、品牌、店铺、账号、项目命名。",
    need: "姓氏或主体、风格方向、避讳字、行业或寓意偏好。",
    output: "五行意象、音形义、文化寓意、候选名称与解释。",
    unsuitable: "不承诺名字必然改变命运或保证商业成功。",
    fields: ["nameBase", "style"],
  },
  {
    id: "integrated",
    name: "综合咨询",
    category: "integrated",
    categoryName: "推荐路径",
    tag: "先问后断",
    image: heroImage,
    accent: "观象",
    scene: "适合不知道选哪种术数、问题混合、需要先整理思路的用户。",
    need: "一个核心问题、背景、期待获得的帮助。",
    output: "问题拆解、方法推荐、象征性推演、现实行动建议。",
    unsuitable: "不替用户做重大人生决定，不制造焦虑。",
    fields: ["background", "timeRange"],
    recommended: true,
  },
];

export const heroStats = [
  ["128,492", "累计测算", "演示指标"],
  ["2,381", "今日测算", "演示指标"],
  ["26万+", "卦象解析", "示例展示"],
  ["98%", "满意反馈", "上线后接真实统计"],
];

export const trustProofs = [
  "报告结构固定包含依据、推演、建议、边界，不用恐吓式断语。",
  "敏感问题默认提示现实专业帮助，避免把术数当作唯一答案。",
  "出生资料、关系困扰、空间信息均按最少必要原则展示。",
  "收费规划透明，不做法事、消灾、保证复合、保证发财。",
];

export const frontFortuneTests = [
  {
    id: "bazi",
    title: "测八字",
    subtitle: "四柱十神 · 五行喜忌",
    desc: "看日主旺衰、格局取象、事业节律、性情倾向与流年起伏。",
    price: "免费试测",
  },
  {
    id: "ziwei",
    title: "测命数",
    subtitle: "命宫身宫 · 十二宫位",
    desc: "看命宫主星、三方四正、财帛官禄、夫妻福德等人生主题。",
    price: "¥19.9 起",
  },
  {
    id: "integrated",
    title: "测姻缘",
    subtitle: "缘分走势 · 相处格局",
    desc: "看关系缘分、沟通模式、桃花时机、相处阻力与修合方向。",
    price: "¥29.9 起",
  },
  {
    id: "bazi",
    title: "测事业",
    subtitle: "官杀财印 · 事业时机",
    desc: "看适合行业、贵人助力、压力来源、跳槽创业与阶段选择。",
    price: "¥29.9 起",
  },
  {
    id: "qimen",
    title: "测财运",
    subtitle: "财星流通 · 进退取舍",
    desc: "看求财方式、合作风险、资源流动、短期时机与守成建议。",
    price: "¥19.9 起",
  },
  {
    id: "bazi",
    title: "测流年",
    subtitle: "大运流年 · 岁运参看",
    desc: "看一年运势主题、事业财运、感情节律、注意事项与月份重点。",
    price: "¥69 起",
  },
  {
    id: "ziwei",
    title: "测合婚",
    subtitle: "夫妻宫 · 相处缘法",
    desc: "看双方性情互补、冲突点、相处模式、婚恋节奏与现实建议。",
    price: "¥99 起",
  },
  {
    id: "naming",
    title: "测起名",
    subtitle: "五行意象 · 音形义",
    desc: "看名字气质、五行偏向、音形义寓意、品牌/宝宝起名方向。",
    price: "¥39 起",
  },
];

export const processSteps = [
  ["01", "立问", "先定一事一问，避免杂念混问。"],
  ["02", "建模", "按出生盘、时间、数字或摇卦生成分析结构。"],
  ["03", "观象", "从阴阳、五行、宫位、体用、世应中取象。"],
  ["04", "成策", "把象意转成现实行动、节律调整与风险边界。"],
];

export const knowledgeGraphs = [
  {
    id: "ziwei",
    name: "紫微命盘",
    category: "出生盘",
    image: ziweiKnowledge,
    desc: "十二宫位、命身宫、三方四正、四化飞星，适合人生主题地图。",
  },
  {
    id: "qimen",
    name: "奇门遁甲",
    category: "时空策略",
    image: qimenKnowledge,
    desc: "九宫为体，八门为用，九星为气，八神为应，适合时空策略。",
  },
  {
    id: "meihua",
    name: "梅花易数",
    category: "占断",
    image: meihuaKnowledge,
    desc: "以数起卦，观本卦、互卦、变卦与体用生克。",
  },
  {
    id: "liuyao",
    name: "六爻占断",
    category: "占断",
    image: liuyaoKnowledge,
    desc: "六爻由下往上，辨阴阳、动变、世应、用神与六亲。",
  },
  {
    id: "coins",
    name: "铜钱流程",
    category: "占断",
    image: coinsProcess,
    desc: "三枚铜钱反复六次，自初爻至上爻成卦。",
  },
];

export const caseStudies = [
  {
    title: "事业方向整理",
    method: "八字 + 综合咨询",
    type: "事业",
    question: "是否该在三个月内换工作？",
    result: "先整理技能与资源，再验证外部机会。",
    text: "从印星、食伤、财官的象意出发，把“想换工作”的焦虑拆成学习、表达、资源交换和责任边界。",
  },
  {
    title: "关系沟通复盘",
    method: "紫微 + 福德宫联参",
    type: "关系",
    question: "这段关系是否还有沟通空间？",
    result: "先看互动模式，不做分合断语。",
    text: "观察情绪承载、沟通成本和可修复条件，把注意力放回尊重、边界与现实行动。",
  },
  {
    title: "短期选择参考",
    method: "梅花易数 + 奇门择时",
    type: "选择",
    question: "该先谈合作还是先完善作品？",
    result: "先固本，再开门。",
    text: "把时间窗口、外部阻力、可借助资源和下一步行动整理成可执行清单。",
  },
];

export const chartMetrics = [
  { label: "问题澄清", value: 86 },
  { label: "行动建议", value: 78 },
  { label: "边界提示", value: 94 },
  { label: "情绪安定", value: 82 },
];

export const serviceCatalog = [
  {
    tier: "免费功能",
    title: "免费基础测算",
    price: "¥0",
    unit: "每日 1 次",
    badge: "拉新入口",
    features: ["综合咨询", "梅花易数简版", "铜钱占卜简版", "报告摘要", "边界提示"],
    bestFor: "新用户体验、低门槛留存、让用户先感受到报告质量。",
  },
  {
    tier: "按次测算",
    title: "单项精批",
    price: "¥9.9-29.9",
    unit: "每次",
    badge: "转化主力",
    features: ["八字简析", "紫微宫位简析", "六爻占断", "奇门择时", "择日/起名初筛"],
    bestFor: "有明确问题的用户，适合做小额付费验证。",
  },
  {
    tier: "深度报告",
    title: "完整专题报告",
    price: "¥69-199",
    unit: "每份",
    badge: "高价值",
    features: ["八字年度规划", "紫微人生主题", "事业/感情专题", "空间布局建议", "命名方案"],
    bestFor: "需要长报告、结构化建议、可导出留存的用户。",
  },
  {
    tier: "会员方案",
    title: "月卡 / 季卡 / 年卡",
    price: "¥39 / ¥99 / ¥299",
    unit: "会员期",
    badge: "稳定收入",
    features: ["每日多次简测", "报告历史", "高级模板", "多术数交叉参考", "优先生成"],
    bestFor: "高频用户、内容型产品、后续 App 订阅模式。",
  },
];

export const pricingNotes = [
  "以上为上线建议价，真实价格应根据报告成本、系统生成成本、人工复核成本和用户转化数据调整。",
  "不设置“消灾解厄”“保证复合”“保证发财”等收费项，不用焦虑制造紧迫感。",
  "建议先开放免费与低价单次，验证留存后再上线会员与人工复核。",
];

export const encyclopediaItems = [
  {
    title: "易经百科",
    text: "易经以阴阳变化为核，以卦象、爻位、动静、体用观察事物状态。平台将其作为象征语言，用来帮助用户整理问题结构，而非替代现实判断。",
  },
  {
    title: "六爻百科",
    text: "六爻重一事一卦，常看世应、用神、六亲、六神、动爻与变卦。适合具体事件的趋势参考，尤其适用于合作、考试、求职、等待结果等问题。",
  },
  {
    title: "梅花易数百科",
    text: "梅花易数重取象，可由时间、数字、声音、方位、物象起卦。其价值在于快速把当下状态转成观察框架，再回到现实行动。",
  },
  {
    title: "奇门遁甲百科",
    text: "奇门以九宫为盘，八门、九星、八神为层，适合短期策略、方向选择、谈判节奏与择时参考。它更像时空决策工具，而非绝对预言。",
  },
  {
    title: "紫微斗数百科",
    text: "紫微斗数以十二宫位组织人生主题，结合命宫、身宫、三方四正、四化飞星观察角色关系。适合人生地图式的长期咨询。",
  },
];

export const faqs = [
  ["这个平台是在算命吗？", "它把传统术数作为文化、象征和反思工具，输出参考性分析，不把结果包装成绝对事实。"],
  ["测算一定准确吗？", "不会承诺一定准确。系统会说明依据、假设、推演和限制，帮助你获得另一个观察角度。"],
  ["出生时间不知道怎么办？", "可以走简化路径，报告会降低盘局精度，并转向五行意象、问题结构和现实建议。"],
  ["可以预测疾病、死亡、彩票或股票吗？", "不可以。平台不做死亡预测、疾病诊断、彩票股票指令、付费消灾、保证发财或保证复合。"],
];

export const apiSpec = [
  ["POST", "/api/intake", "提交问题、方法、背景与隐私确认，返回任务 id。"],
  ["GET", "/api/reports/:id", "读取报告正文、卦象结构、建议事项与边界提醒。"],
  ["GET", "/api/methods", "读取术数方法、输入要求、适用场景与禁用边界。"],
  ["POST", "/api/auth/login", "大众用户登录。真实上线需短信/邮箱校验与风控。"],
  ["POST", "/api/admin/login", "管理员登录。真实上线必须启用 2FA、审计日志与权限隔离。"],
];

export const fieldLabels = {
  birthDate: "出生日期",
  birthTime: "出生时间",
  birthPlace: "出生地",
  gender: "性别",
  castTime: "起卦时间",
  timeRange: "关注时间范围",
  numberSeed: "数字或外应",
  deadline: "事件截止点",
  location: "地点或空间",
  options: "可选方案",
  nameBase: "姓氏/主体",
  style: "风格偏好",
  background: "补充背景",
};
