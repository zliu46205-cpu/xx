const topicProfiles = {
  career: {
    keys: ["工作", "事业", "跳槽", "offer", "创业", "升职", "合作", "项目", "领导", "岗位", "面试", "客户", "转行", "失业"],
    label: "事业",
    palace: "官禄、迁移、财帛与命身承载",
    core: "责任位置、资源承接、外部机会与执行节奏",
    worry: ["上有压力、下缺承接", "有动念而条件未齐", "外部机会看似可取，但内在底盘要先稳", "贵在先立名分与证据，再谈进退"],
    advice: ["把近期目标拆成“保底收入、能力证明、外部机会”三栏，不要只凭情绪换方向。", "先做一次小范围试探：投递、沟通、报价或复盘，用真实反馈代替空想。", "若牵涉合同、薪资、投资或离职节点，必须以书面信息和现实现金流为准。"],
  },
  love: {
    keys: ["感情", "姻缘", "桃花", "复合", "恋爱", "结婚", "合婚", "对象", "分手", "喜欢", "前任", "婚姻", "脱单"],
    label: "姻缘",
    palace: "夫妻、福德、迁移与情绪承载",
    core: "缘分热度、沟通成本、现实阻力与相处节奏",
    worry: ["情有牵连，但名分和边界未定", "表面有互动，内里仍有旧结", "期待偏高，真实行动偏少", "不是没有缘分，而是相处规则尚未成形"],
    advice: ["先验证对方是否有持续、明确、可兑现的行动，不要只看一两句情绪表达。", "把想问的问题落到一次具体沟通：时间、态度、边界、下一步安排。", "关系问题不宜用术数替代尊重和沟通，更不能用报告去逼迫对方选择。"],
  },
  money: {
    keys: ["财", "钱", "收入", "投资", "生意", "订单", "副业", "借钱", "债", "亏", "盈利", "赚钱"],
    label: "财运",
    palace: "财帛、田宅、资源流通与风险边界",
    core: "来财路径、支出漏洞、合作边界与现金节奏",
    worry: ["财气有动，但入库不稳", "有财机也有耗泄，宜先守后攻", "合作可谈，但权责与分账要先明", "短期求快容易失衡，宜重现金流"],
    advice: ["先列清楚固定收入、固定支出、可冒风险额度，不要把玄学判断当投资指令。", "合作、借贷、投资必须留下书面记录，先看风险上限，再看收益想象。", "若要开副业，先用小成本验证订单，不要一次性重投入。"],
  },
  study: {
    keys: ["学习", "考试", "考研", "证书", "上岸", "面试", "录取", "成绩", "备考", "学校"],
    label: "学业",
    palace: "印星、文昌、福德与执行秩序",
    core: "知识吸收、信息渠道、临场发挥与复盘节奏",
    worry: ["心气尚在，但节奏易散", "有学习意愿，缺稳定章法", "临门一脚在细节，不在焦虑", "贵人信息可借，但最终仍靠复盘"],
    advice: ["把复习拆成每日固定时段、错题复盘和模拟检验三部分。", "不要频繁改计划，先连续执行七天，再判断方法是否有效。", "考试和申请仍要以官方规则、截止时间、材料真实性为准。"],
  },
  naming: {
    keys: ["起名", "名字", "品牌", "店名", "宝宝", "公司名", "账号", "改名", "取名"],
    label: "起名",
    palace: "五行意象、音形义与使用场景",
    core: "气质方向、读音节奏、字形稳定与文化避讳",
    worry: ["寓意想装太满，反失清朗", "字义尚可，但音律要再筛", "风格未定，候选名容易散", "宜先定用场，再取字义"],
    advice: ["先确定名字使用场景：人名、品牌、店铺、账号或项目名。", "候选字要同时过读音、字形、含义、谐音和传播五关。", "起名不承诺改变命运，真正影响长期结果的是产品、关系、能力和行动。"],
  },
  timing: {
    keys: ["择时", "发布", "上线", "开业", "签约", "搬家", "出行", "时机", "什么时候", "哪天", "日期"],
    label: "择时",
    palace: "时令、门星、行动窗口与现实约束",
    core: "启动窗口、外部响应、行动顺序与避冲条件",
    worry: ["时机可用，但入口要选", "不宜只求吉日，先看准备是否齐全", "动在外部，成在内功", "先小启后放大，比一次定生死更稳"],
    advice: ["先列出可选时间、不可变约束和必须准备的材料。", "选择日期前，先确认人、钱、场地、合同、传播是否已经到位。", "择日只能优化节奏，不能替代准备质量。"],
  },
  healthRisk: {
    keys: ["生病", "疾病", "怀孕", "手术", "死亡", "活多久", "癌", "抑郁", "自杀", "吃药"],
    label: "高风险问题",
    palace: "安全边界",
    core: "此类问题不能用命理替代专业判断",
    worry: ["问题已触及医疗、生命或心理风险，不能做恐吓式断语"],
    advice: ["如果涉及身体症状、用药、手术、怀孕或心理危机，请优先联系医生、心理咨询师或身边可信赖的人。", "本平台只能把焦虑转成可整理的问题，不做疾病诊断和寿命预测。"],
  },
};

const defaultTopic = {
  label: "综合",
  palace: "命身、事机、资源、关系与现实约束",
  core: "问题主线、可控边界、外部回应与下一步选择",
  worry: ["问题尚混杂，需先分清轻重", "心中已有方向，但缺验证", "外部条件未明，不宜急断", "宜先问清楚，再看进退"],
  advice: ["把问题改写成一句可验证的话，例如“我是否应在三个月内做某个动作”。", "先分清：哪些是事实，哪些是猜测，哪些是情绪。", "下一步只做一个小动作，用反馈决定是否继续。"],
};

const methodSystems = {
  bazi: {
    scoreBase: 77,
    name: "八字命理",
    mode: "birth",
    anchors: ["日主", "月令", "十神", "格局", "调候", "大运流年"],
    main: ["日主得印", "财官相见", "食伤透意", "身弱得扶", "比劫分财", "杀印相生"],
    changed: ["先印后财", "官杀有制", "岁运待发", "财来需承", "食伤生财", "印比护身"],
    classical: "八字以日主为体，以月令为纲，以十神分人事。先观旺衰，再看财官印食是否有情，最后才谈岁运触发。",
    derive: (ctx) => [
      `此问落在${ctx.topic.palace}，八字不宜只看一句“旺不旺”，而要看日主能否承接所问之事。`,
      ctx.hasBirth ? "你已提供部分出生信息，可按四柱思路作初步取象；若时辰准确，格局和用神会更细。" : "出生信息不足，当前只能走轻量路径：以问题和主题取象，不做完整四柱定盘。",
      `若以${ctx.topic.label}论，重点在“${ctx.topic.core}”。财官印食若能相生，事情推进较顺；若相战，则先补资源和秩序。`,
    ],
    terms: [["日主", "四柱中代表自身承载力的核心，不等同于性格标签。"], ["月令", "看季节气势和命局大环境，是判断旺衰的重要入口。"], ["十神", "把责任、资源、表达、财富、关系等人事功能分层观察。"], ["用神", "不是固定幸运物，而是命局或问题中最需要被扶正的功能。"]],
  },
  ziwei: {
    scoreBase: 79,
    name: "紫微斗数",
    mode: "birth",
    anchors: ["命宫", "身宫", "三方四正", "四化", "官禄宫", "福德宫"],
    main: ["命宫见机", "官禄宫成局", "夫妻宫动象", "财帛宫守势", "迁移宫见动", "福德宫需养"],
    changed: ["三方四正互照", "化禄入局", "化权催动", "化忌示结", "借对宫之气", "身宫落事"],
    classical: "紫微重宫位与星曜同参。先看命身立场，再看问题落宫，最后合三方四正与四化，不可只凭单星断全局。",
    derive: (ctx) => [
      `此问适合以宫位看角色关系：${ctx.topic.label}问题不能只看结果，还要看你在局中扮演什么位置。`,
      ctx.hasBirth ? "你已给出出生类信息，可按命宫、身宫和相关宫位建立粗盘意识。" : "缺出生时辰时，紫微不能严谨排盘，只能借宫位逻辑作咨询式分析。",
      `若以${ctx.topic.palace}为主线，三方四正提示：事件往往牵动不止一个人或一个条件，需要联动判断。`,
    ],
    terms: [["命宫", "人生主线和处理问题的惯性入口。"], ["身宫", "后天行动落点，看你真正把力气放在哪里。"], ["三方四正", "把相关宫位联动看，避免单点误判。"], ["四化", "禄、权、科、忌代表资源、推动、名声、阻滞等变化。"]],
  },
  meihua: {
    scoreBase: 74,
    name: "梅花易数",
    mode: "event",
    anchors: ["本卦", "互卦", "变卦", "体用", "生克", "外应"],
    main: ["山火贲", "雷风恒", "风山渐", "水火既济", "泽火革", "地山谦"],
    changed: ["风山渐", "泽天夬", "雷地豫", "火水未济", "火风鼎", "风雷益"],
    classical: "梅花重取象，贵在一事一问。本卦看当前，互卦看内里，变卦看去向；体用生克看我与外境的消长。",
    derive: (ctx) => [
      `你问的是短期事机，梅花宜从“当下气口”看，不宜反复追问同一事。`,
      ctx.hasEventSeed ? "你提供了数字、时间或背景，可作为起象依据。" : "未提供明确数字或起卦时间，本报告采用系统种子取象，精度低于正式起卦。",
      `体为自身立场，用为外部对象或事件推动力。此问的关键不只是成败，而是体用是否相生、阻力在哪一边。`,
    ],
    terms: [["本卦", "当前局面。"], ["互卦", "内部暗线。"], ["变卦", "后续转向。"], ["体用", "体多指自己，用多指对方、环境或事件力量。"]],
  },
  liuyao: {
    scoreBase: 76,
    name: "六爻占断",
    mode: "event",
    anchors: ["用神", "世应", "六亲", "六神", "动变", "应期"],
    main: ["世爻持官", "世爻持财", "用神得生", "应爻发动", "父母临世", "子孙泄秀"],
    changed: ["动爻化进", "财爻伏藏", "官鬼受制", "兄弟分财", "父母化生", "应爻回头"],
    classical: "六爻先定用神，再看世应。世为我，应为对方、环境或结果端；动爻为事机，变爻为去向。",
    derive: (ctx) => [
      `此问若按六爻看，必须一事一卦，先定用神，再看世应强弱。`,
      ctx.hasEventSeed ? "你提供了起问时间、截止点或背景，可用于判断事机。" : "未给出正式卦象，本报告只能模拟世应用神逻辑，不作应期断语。",
      `若${ctx.topic.label}为用神，当前应重点看“我方是否有力、对方是否有应、动处是否能化解”。`,
    ],
    terms: [["世爻", "代表自己与可控部分。"], ["应爻", "代表对方、环境或结果端。"], ["用神", "针对问题选出的核心象。"], ["动爻", "正在变化的环节。"]],
  },
  coins: {
    scoreBase: 73,
    name: "铜钱占卜",
    mode: "event",
    anchors: ["三钱六掷", "本卦", "变卦", "动爻", "卦辞", "象辞"],
    main: ["雷风恒", "泽火革", "地山谦", "山泽损", "水雷屯", "火地晋"],
    changed: ["泽天夬", "火风鼎", "雷地豫", "风雷益", "山火贲", "水火既济"],
    classical: "铜钱成卦自下而上，初爻为始，上爻为终。动爻是变化之门，不宜只看卦名定吉凶。",
    derive: (ctx) => [
      `铜钱卦适合看一件具体事的短期走势，尤其适合“要不要、能不能、何时动”的问题。`,
      "当前为系统模拟成卦；若你手动摇卦并输入六爻阴阳动静，判断会更贴近传统六爻。",
      `此问应先看本卦所示现状，再看变卦所指去向，最后把动爻对应到现实行动。`,
    ],
    terms: [["初爻", "事情开端。"], ["上爻", "事情末端或极处。"], ["动爻", "变化发生的位置。"], ["变卦", "变化后的趋势。"]],
  },
  qimen: {
    scoreBase: 78,
    name: "奇门遁甲",
    mode: "strategy",
    anchors: ["九宫", "八门", "九星", "八神", "用神", "值符值使"],
    main: ["开门入局", "生门有气", "景门逢星", "值符临乙", "休门得地", "杜门藏机"],
    changed: ["九宫换位", "乙奇得使", "门星相生", "天芮受制", "值使转宫", "生克有序"],
    classical: "奇门先定用神：问人看人，问事看门，问财看生门，问名看景门。九宫看位置，八门看行动方式。",
    derive: (ctx) => [
      `此问更像时空策略题，奇门不只问结果，而是问从哪个入口、在什么节奏下做更顺。`,
      ctx.hasOptions ? "你提供了可选方案，可用奇门思路比较入口与阻力。" : "可选方案不足，建议补充 A/B 选项、地点、时间窗口。",
      `若以${ctx.topic.label}为用神，当前重点是找“开门”而不是硬冲：先选路径，再加力度。`,
    ],
    terms: [["九宫", "方位和场域。"], ["八门", "行动方式。"], ["九星", "资源与气势。"], ["用神", "所问事项的代表点。"]],
  },
  fengshui: {
    scoreBase: 72,
    name: "风水布局",
    mode: "space",
    anchors: ["明堂", "气口", "动线", "采光", "坐向", "形煞"],
    main: ["明堂偏散", "动线受阻", "采光可借", "坐向需审", "气口不聚", "中宫宜清"],
    changed: ["先理气口", "再调动线", "后补功能", "少动大局", "明暗分区", "动静归位"],
    classical: "阳宅先看门、窗、床、桌、灶、厕，再看采光、动线与停留感。形势先于摆件，体感先于恐吓。",
    derive: (ctx) => [
      `风水问题应先看空间能否承接人的作息和行动，而不是先买摆件。`,
      ctx.hasLocation ? "你已提供地点或空间背景，可先作文字版形势观察。" : "缺户型和方位，只能给通用调整顺序，不做坐向断语。",
      `若以${ctx.topic.label}为目标，先整理入口、桌床、采光和杂物，再谈更细的方位。`,
    ],
    terms: [["明堂", "前方开阔与承接感。"], ["气口", "门窗和主要入口。"], ["动线", "人在空间中的移动路径。"], ["形煞", "带来压迫、冲撞或不适的空间形态。"]],
  },
  naming: {
    scoreBase: 81,
    name: "起名整理",
    mode: "naming",
    anchors: ["五行意象", "音律", "字形", "字义", "避讳", "传播"],
    main: ["木火通明", "金水相涵", "土厚载物", "水木清华", "火土成象", "金声玉振"],
    changed: ["音律需稳", "字形宜开", "寓意宜正", "避讳需查", "传播要顺", "气质成组"],
    classical: "起名先定用途，再审音形义。五行看意象，不是机械缺什么补什么；好名贵在清、稳、顺、可传播。",
    derive: (ctx) => [
      `此问属于命名整理，重点不是玄乎地“补命”，而是让名字和人、品牌或项目的气质一致。`,
      ctx.hasNameBase ? "你已提供姓氏或主体，可进一步筛选候选字。" : "缺姓氏/主体，当前只能判断方向，不能直接定名。",
      `若取${ctx.topic.label}方向，宜先定风格，再从音律、字形、字义、避讳四关筛选。`,
    ],
    terms: [["五行意象", "木火土金水所代表的气质方向。"], ["音律", "读音是否顺、是否有节奏。"], ["字形", "书写结构是否稳定。"], ["避讳", "避开歧义、生僻、不雅谐音。"]],
  },
  integrated: {
    scoreBase: 75,
    name: "综合咨询",
    mode: "integrated",
    anchors: ["问题分类", "取象", "轻重", "现实约束", "行动次序", "反馈验证"],
    main: ["先问后断", "问题归类", "多法参看", "取象成策", "轻重分层", "以事定法"],
    changed: ["宜先澄清", "再定术数", "择要行动", "小步验证", "观其回应", "以实校象"],
    classical: "综合咨询先辨问题类型，再决定用八字、紫微、六爻、梅花、奇门或风水。多法并用时取共同倾向，不取最吓人的一句。",
    derive: (ctx) => [
      `当前问题适合先做综合拆解：先看你真正问的是什么，再决定是否需要八字、紫微、六爻或奇门。`,
      `此问主线落在${ctx.topic.core}，若不先分清事实、猜测和情绪，任何术数都会变成泛泛安慰。`,
      "综合法的价值是把问题整理成可执行步骤，而不是制造绝对结论。",
    ],
    terms: [["取象", "把现实问题转成可观察的象征线索。"], ["主线", "最值得先处理的矛盾。"], ["轻重", "区分马上处理和可以观察的部分。"], ["以实校象", "用现实反馈校正象意，不把推演当事实。"]],
  },
};

function hashText(text) {
  return Array.from(text || "").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
}

function pick(list, seed, offset = 0) {
  return list[Math.abs(seed + offset * 17) % list.length];
}

function detectTopic(values) {
  const text = `${values.question || ""} ${values.concernType || ""} ${values.focusProblem || ""} ${values.background || ""}`;
  const found = Object.values(topicProfiles).find((profile) => profile.keys.some((key) => text.includes(key)));
  return found || defaultTopic;
}

function detectIntent(question) {
  if (/该不该|要不要|是否|能不能|可不可以/.test(question)) return "抉择判断";
  if (/什么时候|多久|哪天|时机|何时/.test(question)) return "时机判断";
  if (/怎么|如何|怎么办|怎么做/.test(question)) return "行动策略";
  if (/会不会|有没有|能否|结果/.test(question)) return "趋势观察";
  return "综合观察";
}

function getCompleteness(values, method) {
  const required = method?.fields || [];
  const filled = required.filter((field) => String(values[field] || "").trim());
  const missing = required.filter((field) => !String(values[field] || "").trim());
  const base = values.background ? 20 : 0;
  const score = Math.min(100, Math.round((filled.length / Math.max(required.length, 1)) * 70 + base + (values.question?.length > 18 ? 10 : 0)));
  return { filled, missing, score };
}

function getFlags(values) {
  return {
    hasBirth: Boolean(values.birthDate || values.birthTime || values.birthPlace || values.gender),
    hasEventSeed: Boolean(values.castTime || values.numberSeed || values.deadline),
    hasOptions: Boolean(values.options),
    hasLocation: Boolean(values.location || values.background?.includes("户型") || values.background?.includes("房")),
    hasNameBase: Boolean(values.nameBase || values.style),
  };
}

function riskCheck(topic, question) {
  if (topic.label === "高风险问题") {
    return {
      blocked: true,
      summary: "这个问题涉及医疗、生命或心理风险，不能用命理作诊断或恐吓式判断。",
    };
  }
  if (/彩票|股票|赌博|稳赚|必赚|暴富|消灾|做法|诅咒|害人/.test(question)) {
    return {
      blocked: true,
      summary: "这个问题涉及高风险或不合规诉求，本平台不能给出保证收益、赌博预测、伤害他人或付费消灾类建议。",
    };
  }
  return { blocked: false };
}

function methodById(id) {
  return methodSystems[id] || methodSystems.integrated;
}

function fieldLabel(field) {
  const labels = {
    birthDate: "出生日期",
    birthTime: "出生时间",
    birthPlace: "出生地点",
    gender: "性别",
    castTime: "起卦时间",
    timeRange: "时间范围",
    numberSeed: "数字/外应",
    deadline: "截止点",
    location: "地点/空间",
    options: "可选方案",
    nameBase: "姓氏/主体",
    style: "风格偏好",
    background: "背景资料",
  };
  return labels[field] || field;
}

function buildDecision(ctx) {
  const { intent, topic, mainSymbol, changedSymbol, score } = ctx;
  if (intent === "抉择判断") {
    return score >= 78
      ? `倾向可推进，但宜“先小后大”。${mainSymbol}主当前有可用之势，${changedSymbol}示后续仍需取舍，不能一次押满。`
      : `倾向先缓一步。${mainSymbol}说明事情已有动象，但${changedSymbol}提示条件未齐，贸然决定容易反复。`;
  }
  if (intent === "时机判断") {
    return `时机不宜只看某一天。此象更像“先蓄后发”：先完成准备和沟通，再选一个外部回应较顺的窗口放大。`;
  }
  if (intent === "行动策略") {
    return `重点不是等结果，而是调整行动顺序。先处理${pick(topic.worry, ctx.seed, 3)}，再把下一步压缩成可验证的小动作。`;
  }
  return `此问不宜断成单纯吉凶。${mainSymbol}为当前主象，${changedSymbol}为后续转向，整体提示先理清${topic.core}。`;
}

function buildStageAdvice(ctx) {
  const { topic, methodSystem, completeness, values } = ctx;
  const range = values.timeRange || "近期";
  return [
    {
      title: "先定主线",
      symbol: `取${topic.label}为用，参${methodSystem.anchors.slice(0, 3).join("、")}`,
      real: `把“${values.question}”改写成一个可验证问题，避免同时问结果、时机、对方想法和长期命运。`,
    },
    {
      title: "补足条件",
      symbol: completeness.missing.length ? `缺${completeness.missing.map(fieldLabel).join("、")}` : "资料较足，可进入细分判断",
      real: completeness.missing.length
        ? `若要更准，下一次优先补：${completeness.missing.map(fieldLabel).join("、")}。现在只能按简化路径看。`
        : "已有资料能支撑当前层级判断，但仍需用现实反馈校正。",
    },
    {
      title: "观察窗口",
      symbol: `${range}以内看动静，不以单日定终身`,
      real: `在${range}内观察一次明确反馈：对方回应、面试结果、订单变化、资金回款或自身状态改善。`,
    },
    {
      title: "落到行动",
      symbol: "以实校象",
      real: pick(topic.advice, ctx.seed, 2),
    },
  ];
}

export function validateIntake(values) {
  const errors = {};
  if (!values.question?.trim()) errors.question = "请先写下一个清楚的问题。";
  if (values.question?.trim().length > 260) errors.question = "问题建议控制在 260 字以内，便于一事一问。";
  if (!values.privacyAccepted) errors.privacyAccepted = "请确认隐私与安全边界后再生成报告。";
  if (values.contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact)) errors.contact = "邮箱格式不正确；也可以留空，报告会在当前页面生成。";
  return errors;
}

export function buildReport(values, method) {
  const question = String(values.question || "").trim();
  const methodSystem = methodById(method?.id);
  const topic = detectTopic(values);
  const risk = riskCheck(topic, question);
  const intent = detectIntent(question);
  const completeness = getCompleteness(values, method);
  const flags = getFlags(values);
  const seed = hashText(`${question}-${method?.id}-${values.timeRange}-${values.background}-${values.focusProblem}-${values.readingFocus}-${values.numberSeed}-${values.castTime}`);
  const mainSymbol = pick(methodSystem.main, seed, 0);
  const changedSymbol = pick(methodSystem.changed, seed, 1);
  const score = Math.min(96, Math.max(48, methodSystem.scoreBase + (seed % 17) - 6 + Math.round(completeness.score / 20)));
  const ctx = { values, method, methodSystem, topic, intent, completeness, seed, mainSymbol, changedSymbol, score, ...flags };

  if (risk.blocked) {
    return {
      id: `R-${Date.now().toString(36).toUpperCase()}`,
      title: `${method?.name || "综合咨询"} · 安全边界提醒`,
      method: method?.name || "综合咨询",
      question,
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      summary: risk.summary,
      situation: "你提出的问题触及高风险现实决策。传统术数可以作为情绪整理和问题澄清工具，但不能替代医生、律师、心理咨询师、财务顾问或其他专业支持。",
      tendency: "建议先把问题转成现实层面的安全行动：求助、核实、保存证据、咨询专业人士，而不是继续用占断增加焦虑。",
      actionPlan: topic.advice,
      termGlossary: [["边界", "不把象征性分析当成现实证据或专业诊断。"], ["转化", "把恐惧问题改写成可执行的现实步骤。"]],
      oracle: { mainHexagram: "安全边界", changedHexagram: "现实求证", score: 0, firstTitle: "不予断凶", secondTitle: "转为支持", guaci: "此问不宜以命理断定。", xiangci: "先护现实安全，再谈象意参考。", plainText: risk.summary, caution: "涉及医疗、生命、法律、投资等事项时，请优先寻求专业帮助。", similarCase: "高焦虑问题常会越算越怕，正确做法是先稳定现实支持系统。" },
      basis: ["触发安全边界", "不提供灾祸恐吓", "不替代专业建议"],
      inference: ["此处不做吉凶推演。"],
      suggestions: topic.advice,
      limits: ["不做死亡预测、疾病诊断、投资指令、付费消灾或违法建议。"],
    };
  }

  const decision = buildDecision(ctx);
  const stageAdvice = buildStageAdvice(ctx);
  const derive = methodSystem.derive(ctx);
  const missingText = completeness.missing.length ? completeness.missing.map(fieldLabel).join("、") : "暂无关键缺项";
  const worry = pick(topic.worry, seed, 2);

  const summary = `${decision} 核心卡点在“${worry}”，不是一句好坏可以概括。`;
  const situation = `你问的是：“${question}”。按${method?.name || methodSystem.name}来看，此问属于“${topic.label}”类，意图偏向“${intent}”。当前资料完整度约为 ${completeness.score}/100；缺项为：${missingText}。因此本报告采用“${methodSystem.mode} 方法 + 简化取象 + 现实建议”的层级，不作绝对断语。`;
  const tendency = `趋势上，${mainSymbol}代表当前主象，${changedSymbol}代表后续转向。若你能先处理“${worry}”，并在${values.timeRange || "近期"}内取得一次明确反馈，局势会比现在清楚；若继续只在心里反复推演，容易把小阻力拖成长消耗。`;

  const basis = [
    `所用法门：${method?.name || methodSystem.name}`,
    `问题分类：${topic.label}`,
    `提问意图：${intent}`,
    `参看术语：${methodSystem.anchors.join("、")}`,
    `已填资料：${completeness.filled.length ? completeness.filled.map(fieldLabel).join("、") : "仅问题本身"}`,
    `缺失资料：${missingText}`,
    `判断层级：${completeness.score >= 75 ? "可作较完整参考" : completeness.score >= 45 ? "可作中等参考" : "仅作初步参考"}`,
  ];

  const inference = [
    methodSystem.classical,
    ...derive,
    `取象上，${mainSymbol}为当前状态，${changedSymbol}为变化方向。二者合看，不是让你等待命运安排，而是提示先找出可以改变的环节。`,
    `现实翻译：${topic.core}是本问真正的主线。若这个主线不清，报告再长也会显得空。`,
  ];

  const suggestions = [
    pick(topic.advice, seed, 0),
    pick(topic.advice, seed, 1),
    `本周只做一个验证动作：${intent === "抉择判断" ? "把两个选项各列三条真实成本和三条真实收益。" : intent === "时机判断" ? "确认可执行时间、关键人和必备材料是否到位。" : "找一个能产生反馈的现实动作，不再只停留在想。"}`,
    completeness.missing.length ? `若要升级为精批，请补充：${missingText}。` : "若要升级为精批，可以补充更具体的时间、人物、地点和已发生事实。",
    "涉及医疗、法律、投资、婚姻等重大现实决定时，请把本报告作为参考，不作为唯一依据。",
  ];

  return {
    id: `R-${Date.now().toString(36).toUpperCase()}`,
    title: `${method?.name || methodSystem.name} · ${topic.label}参考报告`,
    method: method?.name || methodSystem.name,
    question,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    summary,
    situation,
    tendency,
    actionPlan: stageAdvice.map((item) => `${item.title}：${item.real}`),
    termGlossary: methodSystem.terms,
    oracle: {
      mainHexagram: mainSymbol,
      changedHexagram: changedSymbol,
      score,
      firstTitle: methodSystem.anchors[0] || "分析依据",
      secondTitle: methodSystem.anchors[1] || "象意推演",
      guaci: methodSystem.classical,
      xiangci: derive.join(" "),
      plainText: `换成白话：你现在真正要看的不是“命好不好”，而是${topic.core}。${decision} 所以当前最实际的做法，是先把可控条件补齐，再用一次现实反馈验证方向。`,
      caution: "本报告为传统文化与象征分析参考，不作为医疗、法律、投资、婚姻等重大现实决策的唯一依据。",
      similarCase: `${topic.label}类问题常见于“心中已有倾向，但缺少证据”的阶段。最有效的不是反复测，而是补资料、做小步验证、看真实回应。`,
    },
    basis,
    inference,
    suggestions,
    stageAdvice,
    limits: [
      "报告采用传统术数、象征系统与现实规划结合的方式，不制造绝对断言。",
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
    "三、分析依据",
    ...report.basis.map((item, index) => `${index + 1}. ${item}`),
    "",
    "四、象意推演",
    ...report.inference.map((item, index) => `${index + 1}. ${item}`),
    "",
    "五、白话解释",
    report.oracle.plainText,
    "",
    "六、未来倾向",
    report.tendency,
    "",
    "七、行动建议",
    ...report.suggestions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "八、边界提醒",
    ...report.limits.map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");
}
