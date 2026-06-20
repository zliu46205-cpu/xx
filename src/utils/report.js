const profiles = {
  career: {
    keys: ["工作", "事业", "跳槽", "offer", "创业", "升职", "合作", "项目", "领导", "岗位"],
    label: "事业",
    focus: "官禄、财星、外部机会与责任边界",
    action: "先看资源与压力是否同向，再决定进取或守成。",
    worries: ["被规则压住", "机会不够清晰", "能力证明不足", "资源承接不稳"],
  },
  love: {
    keys: ["感情", "姻缘", "桃花", "复合", "恋爱", "结婚", "合婚", "对象", "分手"],
    label: "姻缘",
    focus: "夫妻宫、桃花、相处节奏与情绪承载",
    action: "先分辨缘分热度、沟通成本与现实阻力。",
    worries: ["有情绪但缺沟通", "有牵挂但边界不清", "期待高于行动", "旧问题仍在重复"],
  },
  money: {
    keys: ["财", "钱", "收入", "投资", "生意", "客户", "订单", "副业"],
    label: "财运",
    focus: "财星流通、资源交换、风险承受与现金节奏",
    action: "先求稳流通，再谈扩张；高风险事项需另行现实评估。",
    worries: ["来财慢", "支出散", "合作边界不清", "收益和风险不对等"],
  },
  study: {
    keys: ["学习", "考试", "考研", "证书", "面试", "上岸"],
    label: "学业",
    focus: "印星、文昌、准备节奏与临场发挥",
    action: "先定复习秩序，再看贵人、信息与时间窗口。",
    worries: ["心气浮", "准备散", "临场压力大", "信息渠道不足"],
  },
  naming: {
    keys: ["起名", "名字", "品牌", "店名", "宝宝", "公司名", "账号"],
    label: "起名",
    focus: "五行意象、音形义、行业气质与避讳",
    action: "先定风格和禁忌，再筛音律、字形和寓意。",
    worries: ["寓意太满", "读音不顺", "字形不稳", "风格不聚焦"],
  },
  timing: {
    keys: ["择时", "发布", "视频", "引流", "宣传", "上线", "开业", "签约", "时机", "节奏"],
    label: "择时",
    focus: "时机窗口、发布节奏、外部反馈与行动顺序",
    action: "先用小范围验证反馈，再选择更强的窗口集中放大。",
    worries: ["时机未明", "入口不顺", "外部回应慢", "行动顺序需调整"],
  },
};

const defaultProfile = {
  label: "综合",
  focus: "问题主线、现实约束与下一步选择",
  action: "先澄清问题，再看象意和行动顺序。",
  worries: ["问题混杂", "轻重未分", "信息不足", "下一步不清楚"],
};

const methodReadings = {
  bazi: {
    scoreBase: 78,
    main: ["日主得印", "财官相见", "食伤透意", "身弱得扶"],
    changed: ["先印后财", "官杀有制", "岁运待发", "财来需承"],
    labels: ["十神取象", "五行流通"],
    terms: [
      ["日主", "代表命局中的自身状态，可理解为你处理事情的底气与承载力。"],
      ["十神", "用来观察责任、资源、表达、财富、关系等不同人生功能。"],
      ["官杀", "象征规则、压力、职位、约束与外部评价。"],
      ["印星", "象征学习、凭证、贵人、保护和支持系统。"],
    ],
    classic: "以日主为体，观印比为根，食伤为用，财官为事。此局先看根气，再看财官是否能承载。",
    symbol: "五行流通贵在有源、有泄、有制。当前更像资源与压力并行，宜先蓄势后发。",
    plain: "八字角度看，这不是单纯好坏的问题，而是你当前的承压点和资源点同时出现。先把能支撑你的能力、贵人、证据整理出来，再去碰更大的机会，胜算会更稳。",
    basis: ["日主旺衰", "十神结构", "五行流通", "大运流年倾向"],
  },
  ziwei: {
    scoreBase: 80,
    main: ["命宫见机", "夫妻宫动象", "官禄宫成局", "财帛宫守势"],
    changed: ["三方四正互照", "迁移宫见动", "福德宫需养", "化禄入局"],
    labels: ["宫位主线", "星曜取象"],
    terms: [
      ["命宫", "观察一个人的主线气质、人生主题和处理问题的惯性。"],
      ["身宫", "偏向后天行动方式，代表你会把精力落到哪里。"],
      ["夫妻宫", "不只看婚姻，也看亲密关系中的互动模式。"],
      ["三方四正", "把相关宫位放在一起看，避免只读单点。"],
    ],
    classic: "紫微先看命宫、身宫，再看问题所落宫位；三方四正若有照拱，说明此事牵动多个角色与环境。",
    symbol: "当前象意偏向角色调整：不是没有机会，而是要先确认自己在关系或事务中的位置。",
    plain: "紫微角度看，这件事牵动的不只是结果，而是你在其中扮演什么角色。先看你愿意承担到哪一步，再看对方或外部环境是否配合，会比只问成败更有用。",
    basis: ["命宫身宫", "问题宫位", "三方四正", "四化飞星"],
  },
  meihua: {
    scoreBase: 74,
    main: ["本卦山火贲", "本卦雷风恒", "本卦风山渐", "本卦水火既济"],
    changed: ["变卦风山渐", "变卦泽天夬", "变卦雷地豫", "变卦火水未济"],
    labels: ["体用关系", "本互变卦"],
    terms: [
      ["本卦", "代表事情当前的基本状态。"],
      ["互卦", "代表事情内部隐藏的结构和暗线。"],
      ["变卦", "代表后续可能转向，不是绝对结果。"],
      ["体用", "体多指自己或所问之事，用多指外部对象、环境和推动力。"],
    ],
    classic: "梅花重取象，先分体用：体为自身与所问，用为外境、对象或事件推动力。",
    symbol: "本卦看当下，互卦看内里，变卦看去向。此象宜循序，不宜凭一时情绪定终局。",
    plain: "梅花易数看的是当下这个问题的气口。现在更像事情已经有苗头，但还需要顺着变化去做，不适合只凭情绪立刻下结论。",
    basis: ["起卦数字/时间", "体用生克", "动爻位置", "本卦互卦变卦"],
  },
  liuyao: {
    scoreBase: 76,
    main: ["世爻持官", "世爻持财", "用神得生", "应爻发动"],
    changed: ["动爻化进", "财爻伏藏", "官鬼受制", "子孙泄秀"],
    labels: ["用神世应", "动变关系"],
    terms: [
      ["世爻", "代表自己、主观位置和当前可控部分。"],
      ["应爻", "代表对方、外部环境或结果端。"],
      ["用神", "针对问题选出的核心象，决定分析重心。"],
      ["动爻", "代表正在变化的环节，通常是判断下一步的关键。"],
    ],
    classic: "六爻先定用神，再看世应。世为我，应为对方、环境或结果端。",
    symbol: "用神有气则事有根；用神受制则先补条件。动爻为事机，变爻为去向。",
    plain: "六爻角度看，关键不在一句成败，而在用神有没有力量、你和外部条件是否同向。现在适合先看对方或结果端有没有回应，再决定是否继续投入。",
    basis: ["用神选择", "世应关系", "六亲六神", "动爻变爻"],
  },
  coins: {
    scoreBase: 73,
    main: ["本卦雷风恒", "本卦泽火革", "本卦地山谦", "本卦山泽损"],
    changed: ["变卦泽天夬", "变卦火风鼎", "变卦雷地豫", "变卦风雷益"],
    labels: ["卦辞取象", "变卦去向"],
    terms: [
      ["本卦", "代表事情当前状态。"],
      ["变卦", "代表事情后续可能转向。"],
      ["动爻", "代表出现变化或需要行动的位置。"],
      ["卦象", "用象征语言描述问题结构，不等同于现实定论。"],
    ],
    classic: "铜钱起卦以六爻成象，初爻为始，上爻为终，动爻为变化之门。",
    symbol: "本卦看当前格局，变卦看后续趋势；卦辞象辞只作取象参考。",
    plain: "铜钱卦适合看一件事的短期走势。这个问题的关键是先确认变化点在哪里，再看要守、要改、要等，还是要做明确取舍。",
    basis: ["三钱六掷", "本卦变卦", "动爻位置", "卦辞象辞"],
  },
  qimen: {
    scoreBase: 79,
    main: ["值符临乙", "开门入局", "生门有气", "景门逢星"],
    changed: ["九宫换位", "乙奇得使", "天芮入宫", "门星相生"],
    labels: ["用神定位", "九宫门星"],
    terms: [
      ["九宫", "代表方位、场域和事情所处的位置。"],
      ["八门", "代表行动方式，如开、休、生、伤、杜、景、死、惊。"],
      ["九星", "代表气势、资源和事情状态。"],
      ["用神", "根据问题选出的关键对象或关键环节。"],
    ],
    classic: "奇门先定用神：问人看人，问事看门，问财看生门，问名看景门。",
    symbol: "此局重在时机和入口，不宜只问成不成，更应问何时做、从哪里入手。",
    plain: "奇门角度看，这件事最重要的是时机和入口。你不一定要硬推，可以先找更顺的路径、合适的人和合适的时间点。",
    basis: ["用神定位", "九宫落点", "八门九星", "时机方向"],
  },
  fengshui: {
    scoreBase: 72,
    main: ["明堂偏散", "动线受阻", "采光可借", "坐向需审"],
    changed: ["先理气口", "再调动线", "后补功能", "少动大局"],
    labels: ["形势观察", "空间调整"],
    terms: [
      ["明堂", "空间前方的开阔与承接感，可理解为视野和缓冲区。"],
      ["气口", "门窗、入口和主要空气/人流进入的位置。"],
      ["动线", "人在空间中日常移动的路线。"],
      ["形煞", "令人不适、压迫、冲撞或阻滞的空间形态。"],
    ],
    classic: "阳宅先看门、窗、床、桌、灶、厕，再看采光、动线和停留感。",
    symbol: "空间调整宜小步，不宜恐吓式大拆大改。先清入口，再理动线。",
    plain: "风水角度看，先别急着买东西化解。更有效的是把门口、动线、采光、床桌位置处理顺，让空间先能承接人的状态。",
    basis: ["门窗气口", "床桌灶厕", "采光动线", "形势与体感"],
  },
  naming: {
    scoreBase: 81,
    main: ["木火通明", "金水相涵", "土厚载物", "水木清华"],
    changed: ["音律需稳", "字形宜开", "寓意宜正", "避讳需查"],
    labels: ["五行意象", "音形义"],
    terms: [
      ["五行意象", "用木火土金水表达气质和方向，不是机械缺什么补什么。"],
      ["音律", "名字读起来是否顺口、有节奏、不拗口。"],
      ["字形", "书写结构是否稳、开合是否合适。"],
      ["避讳", "避开生僻、歧义、不雅谐音和不适合场景的字。"],
    ],
    classic: "起名先定用途：人名、品牌名、店名、账号名，各自重心不同。",
    symbol: "五行看意象，不宜机械缺什么补什么；音形义要同时过关。",
    plain: "起名方向上，先别只追求旺。更重要的是读起来顺、写出来稳、寓意不俗，并且和使用场景匹配。",
    basis: ["五行意象", "音律声调", "字形结构", "文化寓意"],
  },
  integrated: {
    scoreBase: 75,
    main: ["先问后断", "问题归类", "多法参看", "取象成策"],
    changed: ["宜先澄清", "再定术数", "轻重分层", "择要行动"],
    labels: ["问题拆解", "方法建议"],
    terms: [
      ["取象", "把问题转成可观察的象征线索。"],
      ["主线", "当前问题里最值得先看的矛盾。"],
      ["轻重", "区分必须马上处理和可以观察等待的部分。"],
      ["简化路径", "资料不足时，先用问题结构和现实背景做低风险分析。"],
    ],
    classic: "综合咨询先辨问题类型，再决定用八字、紫微、六爻、梅花、奇门或风水。",
    symbol: "多术数交叉时，应取共同倾向，不取最吓人的一句。",
    plain: "综合角度看，你现在最需要的不是马上定生死成败，而是先把问题拆清楚：你想要什么、卡在哪里、近期能做哪一步。",
    basis: ["问题分类", "信息完整度", "术数匹配", "现实约束"],
  },
};

function hashText(text) {
  return Array.from(text || "").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length];
}

function detectProfile(values) {
  const text = `${values.question || ""} ${values.concernType || ""} ${values.focusProblem || ""}`;
  return Object.values(profiles).find((profile) => profile.keys.some((key) => text.includes(key))) || defaultProfile;
}

function getReading(methodId) {
  return methodReadings[methodId] || methodReadings.integrated;
}

export function validateIntake(values) {
  const errors = {};
  if (!values.question?.trim()) errors.question = "请先写下一个清楚的问题。";
  if (values.question?.trim().length > 260) errors.question = "问题建议控制在 260 字以内，便于一事一问。";
  if (!values.privacyAccepted) errors.privacyAccepted = "请确认隐私与安全边界后再生成报告。";
  if (values.contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact)) {
    errors.contact = "邮箱格式不正确；也可以留空，报告会在当前页面生成。";
  }
  return errors;
}

export function buildReport(values, method) {
  const question = values.question.trim();
  const seed = hashText(`${question}-${method.id}-${values.timeRange}-${values.background}-${values.focusProblem}-${values.reportTone}`);
  const reading = getReading(method.id);
  const profile = detectProfile(values);
  const mainHexagram = pick(reading.main, seed, 0);
  const changedHexagram = pick(reading.changed, seed, 1);
  const score = Math.min(96, Math.max(52, reading.scoreBase + (seed % 13) - 4));
  const worry = pick(profile.worries, seed, 2);
  const tone = values.reportTone || "温和清楚";
  const detailLevel = values.detailLevel || "大众易懂";

  const oneLine = `此问主象为“${mainHexagram}”，变象为“${changedHexagram}”。整体不是定死的吉凶，而是提示你先处理“${worry}”，再看下一步进退。`;
  const situation = `你问的是“${question}”。从${method.name}的取象看，当前问题落在“${profile.focus}”这一条线上：外部变化已经出现，但真正影响结果的，是你能否把信息、资源、情绪和行动顺序理清。`;
  const symbolicBasis = [
    `所用方法：${method.name}`,
    `问题归类：${profile.label}`,
    `取象重点：${profile.focus}`,
    `表达模式：${detailLevel}，语气偏向：${tone}`,
    `资料完整度：${values.birthDate || values.castTime || values.background ? "已有基础信息，可作简化推演" : "资料偏少，按隐私轻量路径取象"}`,
    ...reading.basis.map((item) => `本法参看：${item}`),
  ];

  const inference = [
    reading.classic,
    reading.symbol,
    `结合你补充的背景，当前更像“${worry}”的阶段。若只追问成败，容易忽略真正能改变局面的那一步。`,
  ];

  const plainText = `${reading.plain} 换成更直白的话说：你现在不必急着把事情定义为好或坏，先看自己能掌握哪一块、外部条件卡在哪一块。把可控部分做实，后面的变化才有承接。`;
  const tendency = `未来一段时间的倾向是：事情会随着你补足资料、明确边界、调整节奏而变得更清楚。若继续模糊推进，容易反复消耗；若先做小范围验证，再决定是否加码，风险会低很多。`;

  const actionPlan = [
    `先把问题拆成三栏：我想得到什么、我现在卡在哪里、我本周能做哪一步。`,
    profile.action,
    `如果涉及他人，先验证对方是否有真实回应，不要只凭想象推演。`,
    `如果涉及金钱、合同、医疗、婚姻等重大事项，请把本报告当作参考，不要替代专业意见。`,
  ];

  const suggestions = [
    ...actionPlan,
    method.id === "bazi" ? "若要进一步精批，应补充出生地、准确时辰，并区分公历/农历。" : null,
    method.id === "ziwei" ? "若看姻缘或合婚，应补双方出生资料，并重点看夫妻宫、福德宫与命身宫。" : null,
    method.id === "meihua" ? "若用梅花起数，建议补充数字、时间或外应，体用关系会更清楚。" : null,
    method.id === "liuyao" || method.id === "coins" ? "若是一事一卦，请写明截止时间和你已经采取的行动。" : null,
    method.id === "qimen" ? "若做择时或谈判，请补充地点、可选时间和目标对象。" : null,
    method.id === "fengshui" ? "若看空间，请补充户型、门窗床桌灶厕位置和主要困扰。" : null,
    method.id === "naming" ? "若做起名，请补充姓氏、性别/品牌行业、风格和避讳字。" : null,
  ].filter(Boolean);

  return {
    id: `R-${Date.now().toString(36).toUpperCase()}`,
    title: `${method.name} · ${profile.label}参考报告`,
    method: method.name,
    question,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    summary: oneLine,
    situation,
    tendency,
    actionPlan,
    termGlossary: reading.terms,
    oracle: {
      mainHexagram,
      changedHexagram,
      score,
      firstTitle: reading.labels[0],
      secondTitle: reading.labels[1],
      guaci: reading.classic,
      xiangci: reading.symbol,
      plainText,
      caution: "本报告为传统术数取象参考，不作为医疗、法律、投资、婚姻等重大现实决策的唯一依据。",
      similarCase: `${profile.label}类问题常见于“心中已有倾向，但仍缺少验证”的阶段。适合先补资料、试小步，再看后续回应。`,
    },
    basis: symbolicBasis,
    inference,
    suggestions,
    limits: [
      "报告采用传统文化、象征系统与现实规划结合的方式，不制造绝对断言。",
      "资料越完整，报告越能减少泛泛而谈；资料不足时会自动降低断语强度。",
      "不做死亡恐吓、疾病诊断、彩票股票指令、付费消灾或保证结果。",
    ],
  };
}

export function reportToText(report) {
  if (!report) return "";
  return [
    `《${report.title}》`,
    `编号：${report.id}`,
    `时间：${report.createdAt}`,
    `问题：${report.question}`,
    "",
    "一、一句话总断",
    report.summary,
    "",
    "二、当前局势",
    report.situation,
    "",
    "三、术数依据",
    ...report.basis.map((item, index) => `${index + 1}. ${item}`),
    "",
    "四、白话解释",
    report.oracle.plainText,
    "",
    "五、未来倾向",
    report.tendency,
    "",
    "六、行动建议",
    ...report.suggestions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "七、边界提醒",
    ...report.limits.map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");
}
