const profiles = {
  career: {
    keys: ["工作", "事业", "跳槽", "offer", "创业", "升职", "合作", "项目"],
    label: "事业",
    focus: "官禄、财星、外部机会与责任边界",
    action: "先看资源与压力是否同向，再决定进取或守成。",
  },
  love: {
    keys: ["感情", "姻缘", "桃花", "复合", "恋爱", "结婚", "合婚", "对象"],
    label: "姻缘",
    focus: "夫妻宫、桃花、相处节奏与情绪承载",
    action: "先分辨缘分热度、沟通成本与现实阻力。",
  },
  money: {
    keys: ["财", "钱", "收入", "投资", "生意", "客户", "订单"],
    label: "财运",
    focus: "财星流通、资源交换、风险承受与现金节奏",
    action: "先求稳流通，再谈扩张；高风险事项需另行现实评估。",
  },
  study: {
    keys: ["学习", "考试", "考研", "证书", "面试", "上岸"],
    label: "学业",
    focus: "印星、文昌、准备节奏与临场发挥",
    action: "先定复习秩序，再看贵人、信息与时间窗口。",
  },
  naming: {
    keys: ["起名", "名字", "品牌", "店名", "宝宝", "公司名"],
    label: "起名",
    focus: "五行意象、音形义、行业气质与避讳",
    action: "先定风格和禁忌，再筛音律、字形和寓意。",
  },
};

const methodReadings = {
  bazi: {
    scoreBase: 78,
    main: ["日主偏稳", "身弱得印", "食伤透意", "财官相见"],
    changed: ["岁运待发", "先印后财", "财来需库", "官杀有制"],
    labels: ["十神取象", "五行流通"],
    classic: [
      "以日主为体，观印比为根，食伤为用，财官为事。此局先看根气，再看财官是否能承载。",
      "四柱取象偏向先蓄后发，若资料不全，应以季节、时辰与现实背景互证。",
      "十神不宜孤读：印主学习与凭依，财主交换与目标，官杀主责任与压力。",
    ],
    symbol: [
      "五行流通不贵一味偏旺，贵在有源、有泄、有制。当前问题更像资源与压力并行。",
      "若问事业，宜看官杀与食伤是否相接；若问姻缘，宜看财官与日支是否相安。",
      "流年只作阶段气候，不作绝对结局；岁运见动，先应在选择和节奏上。",
    ],
    plain:
      "八字角度看，这不是单纯“好或坏”的问题，而是你当前承压点和资源点同时出现。先把能支撑你的能力、贵人、证据整理出来，再去碰更大的机会，胜算会更稳。",
    basis: ["日主旺衰", "十神结构", "五行流通", "大运流年倾向"],
  },
  ziwei: {
    scoreBase: 80,
    main: ["命宫见机月", "夫妻宫动象", "官禄宫成局", "财帛宫守势"],
    changed: ["三方四正互照", "化禄入局", "迁移宫见动", "福德宫需养"],
    labels: ["宫位主线", "星曜取象"],
    classic: [
      "紫微先看命宫、身宫，再看问题所落宫位，不能只读单宫。",
      "三方四正若有照拱，代表此事不是孤立发生，而是牵动角色、资源与外部环境。",
      "四化取象：化禄看资源和吸引，化权看推动与掌控，化科看名声秩序，化忌看卡点。",
    ],
    symbol: [
      "若问感情，夫妻宫需联参福德宫与命宫；若问事业，官禄宫需联参财帛与迁移。",
      "当前象意偏向“角色调整”：不是缺机会，而是要先确认自己在关系或事务中的位置。",
      "宫位有动象时，适合调整策略、更新关系边界、重新分配精力。",
    ],
    plain:
      "紫微角度看，这件事牵动的不只是结果，而是你在其中扮演什么角色。先看你愿意承担到哪一步，再看对方或外部环境是否配合，会比只问成败更有用。",
    basis: ["命宫身宫", "问题宫位", "三方四正", "四化飞星"],
  },
  meihua: {
    scoreBase: 74,
    main: ["本卦山火贲", "本卦雷风恒", "本卦风山渐", "本卦水火既济"],
    changed: ["变卦风山渐", "变卦泽天夬", "变卦雷地豫", "变卦火水未济"],
    labels: ["体用关系", "本互变卦"],
    classic: [
      "梅花重取象，先分体用：体为自身与所问，用为外境、对象或事件推动力。",
      "体用相生则事有承接，体用相克则先有阻隔；动爻所在多为变化之处。",
      "本卦看当下，互卦看内里，变卦看去向。",
    ],
    symbol: [
      "此象不宜猛断吉凶，宜先看“谁生谁、谁克谁、动在何处”。",
      "若体弱用强，代表外部压力较大；若体生用，代表自己投入多而回收慢。",
      "变卦见渐，宜循序；见夬，宜决断；见豫，宜借势；见未济，宜补缺。",
    ],
    plain:
      "梅花易数看的是当下这个问题的气口。现在更像是事情已经有苗头，但还需要顺着变化去做，不适合只凭情绪立刻下结论。",
    basis: ["起卦数字/时间", "体用生克", "动爻位置", "本卦互卦变卦"],
  },
  liuyao: {
    scoreBase: 76,
    main: ["世爻持官", "世爻持财", "用神得生", "应爻发动"],
    changed: ["动爻化进", "财爻伏藏", "官鬼受制", "子孙泄秀"],
    labels: ["用神世应", "动变关系"],
    classic: [
      "六爻先定用神，再看世应。世为我，应为对方、环境或结果端。",
      "用神旺相有气，多主事情有根；用神休囚受克，则需先补条件。",
      "动爻为事机，变爻为去向，伏神为暗线。",
    ],
    symbol: [
      "此问要看用神是否得月日扶持，再看世应关系是否相合或相冲。",
      "若世爻强而应爻弱，主动权在自己；若应爻动而克世，外部条件变化更快。",
      "应期不宜写死，只能看近期是否有动象和回音。",
    ],
    plain:
      "六爻角度看，关键不在一句成败，而在用神有没有力量、你和外部条件是否同向。现在适合先看对方或结果端有没有回应，再决定是否继续投入。",
    basis: ["用神选择", "世应关系", "六亲六神", "动爻变爻"],
  },
  coins: {
    scoreBase: 73,
    main: ["本卦雷风恒", "本卦泽火革", "本卦地山谦", "本卦山泽损"],
    changed: ["变卦泽天夬", "变卦火风鼎", "变卦雷地豫", "变卦风雷益"],
    labels: ["卦辞取象", "变卦去向"],
    classic: [
      "铜钱起卦以六爻成象，初爻为始，上爻为终，动爻为变化之门。",
      "本卦看当前格局，变卦看后续趋势，卦辞象辞只作取象参考。",
      "一事一占，不宜短时间重复追问同一问题。",
    ],
    symbol: [
      "本卦若见恒，重在持久；见革，重在更换旧局；见谦，重在降姿态；见损，重在先舍后得。",
      "动爻越靠近中爻，越多现实操作空间；靠近上爻，多为事已近尾声。",
      "变卦为益或鼎，多有重整资源之象；变卦为夬，则需做取舍。",
    ],
    plain:
      "铜钱卦更适合看一件事的短期走势。这个问题的关键是先确认变化点在哪里，再看要守、要改、要等，还是要做明确取舍。",
    basis: ["三钱六掷", "本卦变卦", "动爻位置", "卦辞象辞"],
  },
  qimen: {
    scoreBase: 79,
    main: ["值符临乾", "开门入局", "生门有气", "景门逢星"],
    changed: ["九宫换位", "乙奇得使", "天辅入宫", "门星相生"],
    labels: ["用神定位", "九宫门星"],
    classic: [
      "奇门先定用神：问人看人，问事看门，问财看生门，问名看景门。",
      "九宫定方位和场域，八门看行动方式，九星看气势，八神看外应。",
      "门星宫相生，行动顺；门迫或击刑，先有卡点。",
    ],
    symbol: [
      "此局偏重时机和方位，不宜只问“成不成”，更应问“何时做、从哪边入手”。",
      "若开门、生门得地，适合推进；若杜门、死门压事，宜先避实击虚。",
      "用神落宫若受克，先补资源；若得生，宜借势行动。",
    ],
    plain:
      "奇门角度看，这件事最重要的是时机和入口。你不一定要硬推，可以先找更顺的路径、合适的人和合适的时间点。",
    basis: ["用神定位", "九宫落点", "八门九星", "时机方向"],
  },
  fengshui: {
    scoreBase: 72,
    main: ["明堂偏散", "动线受阻", "采光可借", "坐向需审"],
    changed: ["先理气口", "再调动线", "后补功能", "少动大局"],
    labels: ["形势观察", "空间调整"],
    classic: [
      "阳宅先看门、窗、床、桌、灶、厕，再看采光、动线和停留感。",
      "形势不只看方位，也看人真实使用空间时是否顺手、安稳、明亮。",
      "风水调整宜小步，不宜恐吓式大拆大改。",
    ],
    symbol: [
      "若门口杂乱，主气口不清；若桌床受冲，主心神不稳；若暗湿闭塞，主气机不畅。",
      "先清理入口、过道和长期堆积处，再谈摆件或方位。",
      "办公和睡眠区域应分清动静，避免把压力带入休息区。",
    ],
    plain:
      "风水角度看，先别急着买东西化解。更有效的是把门口、动线、采光、床桌位置处理顺，让空间先能承接人的状态。",
    basis: ["门窗气口", "床桌灶厕", "采光动线", "形势与体验"],
  },
  naming: {
    scoreBase: 81,
    main: ["木火通明", "金水相涵", "土厚载物", "水木清华"],
    changed: ["音律需稳", "字形宜开", "寓意宜正", "避讳需查"],
    labels: ["五行意象", "音形义"],
    classic: [
      "起名先定用途：人名、品牌名、店名、账号名，各自重心不同。",
      "五行看意象，不宜机械缺什么补什么；音形义要同时过关。",
      "名字要避生僻、歧义、谐音不雅和过度堆砌吉祥字。",
    ],
    symbol: [
      "若取清雅感，宜用水木、月、玉、书、景等意象；若取稳重感，宜用山、宁、衡、章等意象。",
      "品牌名要短、顺口、可记忆；人名要兼顾姓氏声调和书写结构。",
      "名字只能增加辨识度和气质，不承诺改变命运。",
    ],
    plain:
      "起名方向上，先别只追求“旺”。更重要的是读起来顺、写出来稳、寓意不俗，并且和使用场景匹配。",
    basis: ["五行意象", "音律声调", "字形结构", "文化寓意"],
  },
  integrated: {
    scoreBase: 75,
    main: ["先问后断", "问题归类", "多法参看", "取象成策"],
    changed: ["宜先澄清", "再定术数", "轻重分层", "择要行动"],
    labels: ["问题拆解", "方法建议"],
    classic: [
      "综合咨询先辨问题类型，再决定用八字、紫微、六爻、梅花、奇门或风水。",
      "若问长期命势，偏出生盘；若问一件具体事，偏占断；若问空间，偏风水。",
      "多术数交叉时，应取共同倾向，不取最吓人的一句。",
    ],
    symbol: [
      "当前问题需要先拆成时间、人物、资源、风险四层。",
      "若信息不足，先走简化路径；若用户补充出生或起卦资料，再进入专门术数。",
      "综合咨询的价值在于把混乱问题整理成可测、可看、可做。",
    ],
    plain:
      "综合角度看，你现在最需要的不是马上定生死成败，而是先把问题拆清楚：你想要什么、卡在哪里、近期能做哪一步。",
    basis: ["问题分类", "信息完整度", "术数匹配", "现实约束"],
  },
};

function hashText(text) {
  return Array.from(text || "").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length];
}

function detectProfile(question) {
  const text = question || "";
  return Object.values(profiles).find((profile) => profile.keys.some((key) => text.includes(key))) || {
    label: "综合",
    focus: "问题主线、现实约束与下一步选择",
    action: "先澄清问题，再看象意和行动顺序。",
  };
}

export function validateIntake(values) {
  const errors = {};
  if (!values.question?.trim()) errors.question = "请先写下一个清楚的问题。";
  if (values.question?.trim().length > 220) errors.question = "问题建议控制在 220 字以内，便于一事一问。";
  if (!values.privacyAccepted) errors.privacyAccepted = "请确认隐私与安全边界后再生成报告。";
  if (values.contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact)) {
    errors.contact = "邮箱格式不正确；也可以留空，当前版本不会真实发送报告。";
  }
  return errors;
}

export function buildReport(values, method) {
  const question = values.question.trim();
  const seed = hashText(`${question}-${method.id}-${values.timeRange}-${values.background}`);
  const reading = methodReadings[method.id] || methodReadings.integrated;
  const profile = detectProfile(question);
  const mainHexagram = pick(reading.main, seed, 0);
  const changedHexagram = pick(reading.changed, seed, 1);
  const score = Math.min(96, reading.scoreBase + (seed % 13) - 4);

  const basis = [
    `所用法门：${method.name}`,
    `问题归类：${profile.label}`,
    `取象重点：${profile.focus}`,
    `资料完整度：${values.birthDate || values.castTime || values.background ? "有基础信息，可作简化推演" : "资料偏少，按简化路径取象"}`,
    ...reading.basis.map((item) => `本法参看：${item}`),
  ];

  const inference = [
    pick(reading.classic, seed, 0),
    pick(reading.symbol, seed, 1),
    `结合你的问题“${question}”，此处更应看${profile.focus}，不宜只用一句吉凶概括。`,
  ];

  const suggestions = [
    profile.action,
    method.id === "bazi" ? "若要进一步精批，应补充出生地、准确时辰，并区分公历/农历。" : null,
    method.id === "ziwei" ? "若看姻缘或合婚，应补双方出生资料，并重点看夫妻宫、福德宫与命身宫。" : null,
    method.id === "meihua" ? "若用梅花起数，建议补充数字、时间或外应，体用关系会更清楚。" : null,
    method.id === "liuyao" || method.id === "coins" ? "若是一事一占，请写明截止时间和你已经采取的行动。" : null,
    method.id === "qimen" ? "若做择时或谈判，请补充地点、可选时间和目标对象。" : null,
    method.id === "fengshui" ? "若看空间，请补充户型、门窗床桌灶厕位置和主要困扰。" : null,
    method.id === "naming" ? "若做起名，请补充姓氏、性别/品牌行业、风格和避讳字。" : null,
    "先做一个小验证动作，再决定是否加大投入。",
  ].filter(Boolean);

  return {
    id: `R-${Date.now().toString(36).toUpperCase()}`,
    title: `${method.name} · ${profile.label}测算报告`,
    method: method.name,
    question,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    summary: `${method.name}取象显示，此问重点在${profile.focus}。${pick(reading.symbol, seed, 2)}整体倾向不是一锤定音，而是先辨轻重、再定进退。`,
    oracle: {
      mainHexagram,
      changedHexagram,
      score,
      firstTitle: reading.labels[0],
      secondTitle: reading.labels[1],
      guaci: pick(reading.classic, seed, 2),
      xiangci: pick(reading.symbol, seed, 3),
      plainText: reading.plain,
      caution:
        "本报告为传统术数取象参考，不作为医疗、法律、投资、婚姻等重大现实决策的唯一依据。",
      similarCase:
        `${profile.label}类问题常见于“心中已有倾向，但仍缺少验证”的阶段。适合先补资料、试小步，再看后续回响。`,
    },
    basis,
    inference,
    suggestions,
    limits: [
      "当前为前端演示测算，尚未接入真实排盘、起卦算法和人工复核。",
      "不同术数需要的信息不同；资料越完整，报告越能避免泛泛而谈。",
      "不做死亡恐吓、疾病诊断、彩票股票指令、付费消灾或保证结果。",
    ],
  };
}

export function reportToText(report) {
  if (!report) return "";
  return [
    `【${report.title}】`,
    `编号：${report.id}`,
    `时间：${report.createdAt}`,
    `问题：${report.question}`,
    "",
    "一、简要结论",
    report.summary,
    "",
    "二、测算结构",
    `主象：${report.oracle.mainHexagram}`,
    `变象：${report.oracle.changedHexagram}`,
    `${report.oracle.firstTitle}：${report.oracle.guaci}`,
    `${report.oracle.secondTitle}：${report.oracle.xiangci}`,
    "",
    "三、白话解读",
    report.oracle.plainText,
    "",
    "四、现实建议",
    ...report.suggestions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "五、边界提醒",
    ...report.limits.map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");
}
