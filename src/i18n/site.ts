export const supportedLocales = ["en", "zh-cn", "es"] as const;
export type Locale = "en" | "zh-cn" | "es";

export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-cn": "简体中文",
  es: "Español"
};

export const ui = {
  en: {
    skip: "Skip to content", nav: ["Learn", "Culture", "Festivals", "Books", "Events"], about: "About",
    explore: "Explore", language: "Language", footerTitle: "A world of stories is waiting.",
    footerNote: "An independent, approachable cultural learning project.", exploreLabel: "Explore",
    projectLabel: "The project", approach: "Our approach", editorial: "Editorial policy",
    privacy: "Privacy", accessibility: "Accessibility", footerBottom: "Keep exploring. Keep discovering.",
    read: "Read the article", minRead: "min read", keepExploring: "Keep exploring",
    back: "Back to", guides: "guides", guide: "guide", originalGuide: "Original learning guide",
    home: "Home", events: "Events", upcoming: "Upcoming events",
    eventHeading: "Culture is something we share.", eventIntro: "Exhibitions, talks, workshops and celebrations can bring a story off the page and into everyday life.",
    noEvents: "No verified events listed yet.", eventNote: "We are establishing an editorial process to check dates, organizers, location details and registration links before posting announcements. We will not publish invented or outdated events.",
    exploreFestivals: "Explore festival traditions", aboutTitle: "About the project", accessibilityTitle: "Accessibility",
    contactTitle: "Contact", editorialTitle: "Editorial policy", privacyTitle: "Privacy"
  },
  "zh-cn": {
    skip: "跳转到正文", nav: ["学习", "文化", "节日", "书籍", "活动"], about: "关于我们",
    explore: "探索", language: "语言", footerTitle: "一个充满故事的世界正等待你来发现。",
    footerNote: "一个独立、平易近人的文化学习项目。", exploreLabel: "探索",
    projectLabel: "关于项目", approach: "我们的理念", editorial: "编辑政策",
    privacy: "隐私", accessibility: "无障碍访问", footerBottom: "继续探索，持续发现。",
    read: "阅读文章", minRead: "分钟阅读", keepExploring: "继续探索",
    back: "返回", guides: "篇指南", guide: "篇指南", originalGuide: "原创学习指南",
    home: "首页", events: "活动", upcoming: "即将举行的活动",
    eventHeading: "文化因分享而生。", eventIntro: "展览、讲座、工作坊和庆典能让书页上的故事走进日常生活。",
    noEvents: "目前还没有经过核实的活动。", eventNote: "我们正在建立编辑审核流程，在发布活动前核实日期、主办方、地点和报名链接。我们不会发布虚构或过期的活动。",
    exploreFestivals: "探索节日传统", aboutTitle: "了解项目", accessibilityTitle: "无障碍访问",
    contactTitle: "联系我们", editorialTitle: "编辑政策", privacyTitle: "隐私政策"
  },
  es: {
    skip: "Ir al contenido", nav: ["Aprender", "Cultura", "Festivales", "Libros", "Eventos"], about: "Acerca de",
    explore: "Explorar", language: "Idioma", footerTitle: "Un mundo de historias te espera.",
    footerNote: "Un proyecto independiente y accesible para aprender sobre culturas.", exploreLabel: "Explorar",
    projectLabel: "El proyecto", approach: "Nuestro enfoque", editorial: "Política editorial",
    privacy: "Privacidad", accessibility: "Accesibilidad", footerBottom: "Sigue explorando. Sigue descubriendo.",
    read: "Leer el artículo", minRead: "min de lectura", keepExploring: "Sigue explorando",
    back: "Volver", guides: "guías", guide: "guía", originalGuide: "Guía de aprendizaje original",
    home: "Inicio", events: "Eventos", upcoming: "Próximos eventos",
    eventHeading: "La cultura se comparte.", eventIntro: "Las exposiciones, charlas, talleres y celebraciones llevan las historias de la página a la vida cotidiana.",
    noEvents: "Todavía no hay eventos verificados.", eventNote: "Estamos estableciendo un proceso editorial para comprobar fechas, organizadores, ubicaciones y enlaces oficiales de inscripción antes de publicar anuncios. No publicaremos eventos inventados ni desactualizados.",
    exploreFestivals: "Explorar las tradiciones festivas", aboutTitle: "Acerca del proyecto", accessibilityTitle: "Accesibilidad",
    contactTitle: "Contacto", editorialTitle: "Política editorial", privacyTitle: "Privacidad"
  }
} as const;

export const localizedSections = {
  en: [
    { route: "learn", collection: "lessons", nav: "Learn", eyebrow: "Guided learning", title: "Start with the foundations.", description: "An approachable introduction to language, customs, celebrations and creative traditions — one idea at a time.", note: "Read in order or choose any starting point." },
    { route: "culture", collection: "culture", nav: "Culture", eyebrow: "Explore by curiosity", title: "Many traditions. Many perspectives.", description: "Discover objects, ideas and creative practices that connect past and present.", note: "Each story offers a starting point for further discovery." },
    { route: "festivals", collection: "festivals", nav: "Festivals", eyebrow: "The calendar of culture", title: "Moments worth sharing.", description: "Explore the stories and community customs around celebrations across the year.", note: "Many festivals follow a traditional lunisolar calendar; their Gregorian dates change." },
    { route: "books", collection: "books", nav: "Books", eyebrow: "The reading room", title: "A good story opens a door.", description: "Reading guides to classic works, ideas and the many worlds of Chinese literature.", note: "These are original guides, not unauthorized downloads of books." },
    { route: "events", collection: null, nav: "Events", eyebrow: "Gather and learn", title: "Culture is something we share.", description: "Exhibitions, talks, workshops and celebrations can bring a story off the page and into everyday life.", note: "No verified events are listed yet." }
  ],
  "zh-cn": [
    { route: "learn", collection: "lessonsZh", nav: "学习", eyebrow: "循序渐进", title: "从基础开始。", description: "循序了解语言、习俗、节庆与艺术传统，一次认识一个主题。", note: "按顺序阅读，或从任何感兴趣的主题开始。" },
    { route: "culture", collection: "cultureZh", nav: "文化", eyebrow: "随兴趣探索", title: "多样的传统，多元的视角。", description: "探索连接过去与现在的物件、思想和创作实践。", note: "每篇故事都是进一步探索的起点。" },
    { route: "festivals", collection: "festivalsZh", nav: "节日", eyebrow: "文化的岁时日历", title: "值得分享的时刻。", description: "了解一年之中各种庆典背后的故事与社群习俗。", note: "许多节日遵循传统阴阳合历，因此公历日期每年不同。" },
    { route: "books", collection: "booksZh", nav: "书籍", eyebrow: "阅读空间", title: "好故事会打开一扇门。", description: "通过阅读指南走近中国文学经典、思想与多彩世界。", note: "这里提供原创阅读指南，不提供未经授权的书籍下载。" },
    { route: "events", collection: null, nav: "活动", eyebrow: "相聚与学习", title: "文化因分享而生。", description: "展览、讲座、工作坊和庆典能让书页上的故事走进日常生活。", note: "目前还没有经过核实的活动。" }
  ],
  es: [
    { route: "learn", collection: "lessonsEs", nav: "Aprender", eyebrow: "Aprendizaje guiado", title: "Empieza por los fundamentos.", description: "Una introducción accesible al idioma, las costumbres, las celebraciones y las tradiciones creativas, paso a paso.", note: "Lee en orden o elige cualquier punto de partida." },
    { route: "culture", collection: "cultureEs", nav: "Cultura", eyebrow: "Explora según tu curiosidad", title: "Muchas tradiciones. Muchas perspectivas.", description: "Descubre objetos, ideas y prácticas creativas que conectan el pasado con el presente.", note: "Cada historia es un punto de partida para seguir descubriendo." },
    { route: "festivals", collection: "festivalsEs", nav: "Festivales", eyebrow: "El calendario de la cultura", title: "Momentos para compartir.", description: "Explora las historias y costumbres comunitarias de las celebraciones a lo largo del año.", note: "Muchas fiestas siguen un calendario lunisolar tradicional; sus fechas gregorianas cambian." },
    { route: "books", collection: "booksEs", nav: "Libros", eyebrow: "La sala de lectura", title: "Una buena historia abre una puerta.", description: "Guías de lectura sobre obras clásicas, ideas y los muchos mundos de la literatura china.", note: "Son guías originales, no descargas no autorizadas de libros." },
    { route: "events", collection: null, nav: "Eventos", eyebrow: "Reunirse y aprender", title: "La cultura se comparte.", description: "Las exposiciones, charlas, talleres y celebraciones llevan las historias de la página a la vida cotidiana.", note: "Todavía no hay eventos verificados." }
  ]
} as const;

export const homeCopy = {
  en: {
    eyebrow: "FRESH FROM THE CULTURE ATLAS", heading: "Discover something new", intro: "Stories, traditions and ideas worth exploring.",
    all: "Explore all stories", topics: "FIND YOUR NEXT ADVENTURE", exploreTitle: "Explore the world of Chinese culture",
    exploreIntro: "Pick a topic and follow your curiosity.", culture: "Arts & traditions", festivals: "Celebrate together",
    learn: "Start discovering", books: "Stories & ideas", more: "More stories to discover", moreIntro: "There is always another story waiting around the corner.",
    callout: "A world of stories is waiting.", calloutText: "Explore with curiosity. Discover with context. Share what you learn.", about: "About the project"
  },
  "zh-cn": {
    eyebrow: "来自文化地图的新内容", heading: "发现新知", intro: "值得探索的故事、传统与思想。",
    all: "浏览全部故事", topics: "寻找下一段探索之旅", exploreTitle: "探索中国文化的广阔世界",
    exploreIntro: "选择一个主题，跟随好奇心继续前行。", culture: "艺术与传统", festivals: "一起庆祝",
    learn: "开始探索", books: "故事与思想", more: "更多精彩故事", moreIntro: "前方总有另一个故事等待发现。",
    callout: "一个充满故事的世界正等待你来发现。", calloutText: "带着好奇去探索，结合背景去理解，分享你的所学。", about: "关于项目"
  },
  es: {
    eyebrow: "Novedades del Atlas Cultural", heading: "Descubre algo nuevo", intro: "Historias, tradiciones e ideas que merecen ser exploradas.",
    all: "Ver todas las historias", topics: "Encuentra tu próxima aventura", exploreTitle: "Explora el mundo de la cultura china",
    exploreIntro: "Elige un tema y sigue tu curiosidad.", culture: "Artes y tradiciones", festivals: "Celebremos juntos",
    learn: "Empieza a descubrir", books: "Historias e ideas", more: "Más historias por descubrir", moreIntro: "Siempre hay otra historia esperando a la vuelta de la esquina.",
    callout: "Un mundo de historias te espera.", calloutText: "Explora con curiosidad. Descubre con contexto. Comparte lo que aprendes.", about: "Acerca del proyecto"
  }
} as const;

export const localizedPages = {
  en: {
    about: { title: "About the project", eyebrow: "Our story", heading: "A window into a living culture.", intro: "Chinese Culture Atlas is an independent learning project for curious people around the world. We make thoughtful introductions to festivals, arts, language, literature and everyday practices.", paragraphs: ["Culture is not one fixed narrative. Practices vary across regions, communities, families and generations. A good introduction should help readers see that variety rather than reduce it to stereotypes.", "We distinguish between historical evidence, traditional stories and modern customs; we include reading links to help you go deeper. This website is educational, not an official cultural institution."], headings: ["What we believe", "How to begin"], note: "Editorial note: the site is in its first development phase. Further independent subject review and a public feedback contact channel are planned before full launch." },
    accessibility: { title: "Accessibility", eyebrow: "For everyone", heading: "Learning should be accessible.", paragraphs: ["We design for readable text, keyboard-friendly navigation, visible focus indicators, clear headings and mobile access. We avoid automatic media playback and use Chinese characters alongside English explanation where possible.", "The site is under development and has not completed a formal accessibility audit. Testing with assistive technologies and fixing identified issues are launch requirements."] },
    contact: { title: "Contact", eyebrow: "Stay in touch", heading: "A conversation is coming.", paragraphs: ["We have not yet published a verified project contact address. Please do not send personal information through unrelated accounts claiming to represent this site.", "Before public launch we plan to publish a clear channel for corrections, educational feedback and event inquiries."] },
    "editorial-policy": { title: "Editorial policy", eyebrow: "Trust & learning", heading: "How we tell these stories.", headings: ["Clarity over certainty", "Sources and attribution", "Corrections", "Event listings"], paragraphs: ["We aim to make complex subjects approachable without pretending that a tradition has only one history or that all communities celebrate the same way. We distinguish historical scholarship from folklore and modern interpretation.", "Educational articles link to further sources when available. We write original summaries and respect the rights of authors, artists and translators. We do not host unauthorized book copies.", "We review substantive issues before revising articles. This project is still establishing a public contact channel and editorial review process, so please consider these pages a developing educational collection rather than an encyclopedia.", "We only intend to list events with verified organizer information, dates and official registration links. Events are not endorsements by the project."] },
    privacy: { title: "Privacy", eyebrow: "Respect for readers", heading: "Privacy, by design.", paragraphs: ["This initial version is a static educational website. It has no visitor accounts, newsletter subscriptions, contact form, cookies intentionally set by our application, or site-integrated analytics.", "Our hosting provider may process ordinary request information, such as IP addresses, for security and delivery. We have not added third-party advertising trackers or visitor profiling services.", "If future versions add forms, analytics or accounts, we will revise this notice before enabling those features. This page should be reviewed against the actual deployed hosting configuration before public launch."] }
  },
  "zh-cn": {
    about: { title: "关于项目", eyebrow: "我们的故事", heading: "一扇了解鲜活文化的窗口。", intro: "Chinese Culture Atlas 是一个面向世界各地好奇读者的独立学习项目。我们以平实而深入的方式介绍节日、艺术、语言、文学和日常生活。", paragraphs: ["文化并不是固定不变的单一叙事。不同地区、社群、家庭和世代的实践各不相同。好的介绍应帮助读者看见这种多样性，而不是将文化简化为刻板印象。", "我们会区分历史证据、传统故事和现代习俗，并提供延伸阅读链接。本网站用于教育学习，并非官方文化机构。"], headings: ["我们的理念", "如何开始"], note: "编辑说明：网站仍处于初期开发阶段。正式发布前，我们计划进行更多独立的主题审阅，并建立公开的反馈联系渠道。" },
    accessibility: { title: "无障碍访问", eyebrow: "面向每一个人", heading: "学习应该人人可及。", paragraphs: ["我们致力于提供易读的文字、支持键盘操作的导航、清晰可见的焦点提示、明确的标题层级和移动设备访问体验。我们避免自动播放媒体，并尽可能在英文说明旁提供汉字。", "网站仍在开发中，尚未完成正式的无障碍审计。正式发布前，必须使用辅助技术进行测试并修复发现的问题。"] },
    contact: { title: "联系我们", eyebrow: "保持联系", heading: "期待与你交流。", paragraphs: ["我们尚未公布经过核实的项目联系邮箱。请勿通过声称代表本网站、但未经确认的其他账户发送个人信息。", "正式公开发布前，我们计划建立明确的渠道，用于内容更正、教育反馈和活动咨询。"] },
    "editorial-policy": { title: "编辑政策", eyebrow: "信任与学习", heading: "我们如何讲述这些故事。", headings: ["清晰，而非武断", "资料来源与署名", "内容更正", "活动信息"], paragraphs: ["我们希望让复杂主题更容易理解，但不会假装一种传统只有单一历史，也不会认为所有社群都以相同方式庆祝。我们会区分历史研究、民间传说和现代诠释。", "在条件允许时，教育文章会链接到延伸资料。我们撰写原创摘要，并尊重作者、艺术家和译者的权利。本网站不会托管未经授权的书籍副本。", "修订文章前，我们会审查实质性问题。本项目仍在建立公开联系渠道和编辑审阅流程，因此请将这些页面视为持续完善中的教育内容，而非百科全书。", "我们只计划发布主办方信息、日期和官方报名链接均经过核实的活动。活动信息不代表本项目对主办方的背书。"] },
    privacy: { title: "隐私政策", eyebrow: "尊重每一位读者", heading: "从设计之初保护隐私。", paragraphs: ["当前版本是一个静态教育网站，不提供访客账户、新闻订阅或联系表单；应用本身不会主动设置 Cookie，也没有集成网站分析工具。", "托管服务提供商可能会为安全和内容交付处理常规请求信息，例如 IP 地址。我们没有添加第三方广告跟踪器或访客画像服务。", "如果未来版本增加表单、分析工具或账户功能，我们会在启用前更新本隐私说明。正式公开发布前，还应根据实际部署配置重新审核本页面。"] }
  },
  es: {
    about: { title: "Acerca del proyecto", eyebrow: "Nuestra historia", heading: "Una ventana a una cultura viva.", intro: "Chinese Culture Atlas es un proyecto educativo independiente para personas curiosas de todo el mundo. Ofrecemos introducciones cuidadosas a las fiestas, las artes, el idioma, la literatura y las prácticas cotidianas.", paragraphs: ["La cultura no es un relato único e inmutable. Las prácticas varían entre regiones, comunidades, familias y generaciones. Una buena introducción debe ayudar a ver esa diversidad, no reducirla a estereotipos.", "Distinguimos entre evidencias históricas, relatos tradicionales y costumbres modernas; también incluimos enlaces de lectura para profundizar. Este sitio es educativo y no representa a una institución cultural oficial."], headings: ["Lo que creemos", "Nuestro enfoque"], note: "Nota editorial: el sitio se encuentra en su primera fase de desarrollo. Antes del lanzamiento completo están previstas una revisión independiente adicional y un canal público para recibir comentarios." },
    accessibility: { title: "Accesibilidad", eyebrow: "Para todas las personas", heading: "Aprender debe estar al alcance de todos.", paragraphs: ["Diseñamos el sitio para ofrecer textos legibles, navegación mediante teclado, indicadores de foco visibles, encabezados claros y acceso desde móviles. Evitamos la reproducción automática de contenido multimedia y, cuando es posible, mostramos caracteres chinos junto con explicaciones.", "El sitio sigue en desarrollo y todavía no ha completado una auditoría formal de accesibilidad. Las pruebas con tecnologías de asistencia y la corrección de los problemas detectados son requisitos antes del lanzamiento."] },
    contact: { title: "Contacto", eyebrow: "Sigamos en contacto", heading: "Pronto podremos conversar.", paragraphs: ["Todavía no hemos publicado una dirección de contacto del proyecto que haya sido verificada. No envíes información personal a cuentas no relacionadas que afirmen representar este sitio.", "Antes del lanzamiento público, esperamos publicar un canal claro para correcciones, comentarios educativos y consultas sobre eventos."] },
    "editorial-policy": { title: "Política editorial", eyebrow: "Confianza y aprendizaje", heading: "Cómo contamos estas historias.", headings: ["Claridad, no falsas certezas", "Fuentes y atribución", "Correcciones", "Anuncios de eventos"], paragraphs: ["Queremos acercar temas complejos sin fingir que una tradición tiene una sola historia ni que todas las comunidades celebran del mismo modo. Distinguimos la investigación histórica del folclore y de las interpretaciones modernas.", "Cuando están disponibles, los artículos educativos enlazan a fuentes adicionales. Escribimos resúmenes originales y respetamos los derechos de autores, artistas y traductores. No alojamos copias no autorizadas de libros.", "Revisamos los asuntos importantes antes de modificar artículos. El proyecto todavía está estableciendo un canal público de contacto y un proceso de revisión editorial; por eso, estas páginas deben entenderse como una colección educativa en desarrollo, no como una enciclopedia.", "Solo pretendemos publicar eventos con información verificada del organizador, fechas y enlaces oficiales de inscripción. Los anuncios no constituyen un respaldo del proyecto."] },
    privacy: { title: "Privacidad", eyebrow: "Respeto por quienes nos leen", heading: "La privacidad, desde el diseño.", paragraphs: ["Esta versión inicial es un sitio educativo estático. No tiene cuentas de visitantes, suscripciones a boletines ni formularios de contacto; la aplicación no instala cookies de forma intencionada ni integra herramientas de analítica del sitio.", "Nuestro proveedor de alojamiento puede procesar información habitual de las solicitudes, como direcciones IP, para ofrecer seguridad y entregar el contenido. No hemos añadido rastreadores publicitarios de terceros ni perfiles de visitantes.", "Si futuras versiones incorporan formularios, analítica o cuentas, actualizaremos este aviso antes de activar esas funciones. Esta página deberá revisarse según la configuración real del alojamiento antes del lanzamiento público."] }
  }
} as const;
