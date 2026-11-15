export const supportedLocales = ["zh-tw"] as const;
export type Locale = "zh-tw";
export const localeNames: Record<Locale,string> = {"zh-tw":"繁體中文"};
export const ui = { "zh-tw": {
    skip: "跳至主要內容", nav: ["學習", "文化", "節慶", "書籍", "活動"], about: "關於我們",
    explore: "探索", language: "語言", footerTitle: "一個充滿故事的世界，正等待您來發現。",
    footerNote: "一個獨立、親切易懂的文化學習計畫。", exploreLabel: "探索",
    projectLabel: "關於本計畫", approach: "我們的理念", editorial: "編輯政策",
    privacy: "隱私權", accessibility: "無障礙", footerBottom: "持續探索，持續發現。",
    read: "閱讀文章", minRead: "分鐘閱讀", keepExploring: "繼續探索",
    back: "返回", guides: "篇指南", guide: "篇指南", originalGuide: "原創學習指南",
    home: "首頁", events: "活動", upcoming: "近期活動",
    eventHeading: "文化因分享而生。", eventIntro: "展覽、講座、工作坊與慶典，能讓書頁上的故事走進日常生活。",
    noEvents: "目前尚無經過查證的活動。", eventNote: "我們會先確認日期、主辦單位、地點與官方報名連結，再刊登活動資訊；不會發布虛構或過期的活動。",
    noArticles: "這個分類目前還沒有文章。全新的內容正在準備中。",
    exploreFestivals: "探索節慶傳統", aboutTitle: "關於本計畫", accessibilityTitle: "無障礙",
    contactTitle: "聯絡我們", editorialTitle: "編輯政策", privacyTitle: "隱私權政策"
  } } as const;
export const localizedSections = { "zh-tw": [
    { route: "learn", collection: "lessonsTw", nav: "學習", eyebrow: "循序學習", title: "從基礎開始。", description: "以清楚易懂的方式認識語言、習俗、節慶與藝術傳統，一次探索一個主題。", note: "可以依序閱讀，也可以從感興趣的主題開始。" },
    { route: "culture", collection: "cultureTw", nav: "文化", eyebrow: "跟隨好奇心探索", title: "多元傳統，多元觀點。", description: "探索連結過去與現在的器物、思想與創作實踐。", note: "每個主題都是深入探索的起點。" },
    { route: "festivals", collection: "festivalsTw", nav: "節慶", eyebrow: "文化的歲時日曆", title: "值得分享的時刻。", description: "認識一年之中各種慶典背後的故事與社群習俗。", note: "許多節慶依循傳統陰陽合曆，因此公曆日期每年不同。" },
    { route: "books", collection: "booksTw", nav: "書籍", eyebrow: "閱讀空間", title: "好故事，開啟新視野。", description: "透過閱讀指南，走近中國文學經典、思想與多彩世界。", note: "本站提供原創閱讀指南，不提供未經授權的書籍下載。" },
    { route: "events", collection: null, nav: "活動", eyebrow: "相聚與學習", title: "文化因分享而生。", description: "展覽、講座、工作坊與慶典，能讓書頁上的故事走進日常生活。", note: "目前尚無經過查證的活動。" }
  ] } as const;
export const homeCopy = { "zh-tw": {
    eyebrow: "文化地圖・最新消息", heading: "探索新的文化故事", intro: "值得認識的故事、傳統與思想。",
    all: "探索所有主題", topics: "尋找下一段探索旅程", exploreTitle: "探索中國文化的豐富世界",
    exploreIntro: "選擇一個主題，跟隨好奇心繼續前進。", culture: "藝術與傳統", festivals: "一起感受節慶",
    learn: "開始學習", books: "故事與思想", more: "更多值得探索的主題", moreIntro: "前方總有新的故事，等待您來發現。",
    callout: "一個充滿故事的世界，正等待您來發現。", calloutText: "帶著好奇心探索，結合脈絡理解，分享您的所學。", about: "關於本計畫"
  } } as const;
export const localizedPages = { "zh-tw": {
    about: { title: "關於本計畫", eyebrow: "我們的故事", heading: "一扇認識鮮活文化的窗口。", intro: "Chinese Culture Atlas 是一個面向世界各地好奇讀者的獨立學習計畫。我們以平實而深入的方式介紹節慶、藝術、語言、文學與日常生活。", paragraphs: ["文化不是固定不變的單一敘事。不同地區、社群、家庭與世代的生活實踐各有特色。好的介紹應幫助讀者看見多樣性，而不是將文化簡化為刻板印象。", "我們會區分歷史證據、傳統故事與現代習俗，並提供延伸閱讀連結。本網站以教育學習為目的，並非官方文化機構。"], headings: ["我們相信的事", "如何開始"], note: "編輯說明：本網站仍在持續發展。正式推出前，我們計畫進行更多獨立主題審閱，並建立公開的意見回饋管道。" },
    accessibility: { title: "無障礙", eyebrow: "適合每一個人", heading: "學習應該人人都能參與。", paragraphs: ["我們致力於提供易讀文字、鍵盤友善的導覽、清楚可見的焦點提示、明確的標題層級，以及適合行動裝置的閱讀體驗。我們避免媒體自動播放，並在適當處提供中文文字說明。", "網站仍在開發中，尚未完成正式的無障礙稽核。正式推出前，必須使用輔助科技進行測試，並修正所發現的問題。"] },
    contact: { title: "聯絡我們", eyebrow: "保持聯繫", heading: "期待與您交流。", paragraphs: ["我們尚未公布經過查證的計畫聯絡信箱。請勿透過未經確認、聲稱代表本網站的其他帳號傳送個人資料。", "正式公開推出前，我們計畫建立明確管道，供讀者回報更正、提供教育回饋與詢問活動資訊。"] },
    "editorial-policy": { title: "編輯政策", eyebrow: "信任與學習", heading: "我們如何講述這些故事。", headings: ["清楚，而非武斷", "資料來源與署名", "內容更正", "活動資訊"], paragraphs: ["我們希望讓複雜主題更容易理解，但不會假裝一種傳統只有單一歷史，也不會認為所有社群都以相同方式慶祝。我們會區分歷史研究、民間傳說與現代詮釋。", "在條件允許時，教育文章會連結延伸資料。我們撰寫原創摘要，並尊重作者、藝術家與譯者的權利。本網站不會託管未經授權的書籍副本。", "修訂文章前，我們會審查實質問題。本計畫仍在建立公開聯絡管道與編輯審閱流程，因此請將這些頁面視為持續完善中的教育內容，而非百科全書。", "我們只會刊登主辦單位、日期與官方報名連結均經過查證的活動。活動資訊不代表本計畫為主辦單位背書。"] },
    privacy: { title: "隱私權政策", eyebrow: "尊重每一位讀者", heading: "從設計之初保護隱私。", paragraphs: ["面向公眾的網站採用靜態頁面，不提供訪客帳戶、電子報訂閱或聯絡表單；一般瀏覽體驗不會整合網站分析工具或廣告追蹤器，應用程式也不會為一般瀏覽主動設定 Cookie。", "受保護的 Admin 管理區使用 Cloudflare Access 驗證管理員身分。Cloudflare Access 可能因此設定身分驗證 Cookie。這類 Cookie 用於存取控制，不用於廣告或分析。託管服務提供者也可能為安全與內容傳遞處理 IP 位址等一般請求資訊。", "如果未來版本新增訪客表單、分析工具或帳戶功能，我們會在啟用前更新本政策。本政策說明目前公開網站與受保護管理區的設定；部署配置變更時，也會重新審查。"] }
  } } as const;
