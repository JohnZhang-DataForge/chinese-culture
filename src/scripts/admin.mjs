import { filterContent, paginate, parseTags, translationStatus, wordCount } from "../lib/admin-ui.mjs";
import {
  ADMIN_API_BASE, AdminApiError, clearAdminCsrfToken, getAdminSession, listContent,
  getContent, createContent, createTranslation, saveDraft, previewContent,
  uploadMedia, submitContent, discardDraft
} from "../lib/admin-api.mjs";

const root = document.querySelector("[data-admin-app]");
if (root) {
  const demoMode = root.dataset.demo === "true";
  const demoItems = demoMode ? [
    {id:"story-calligraphy",slug:"calligraphy-and-the-brush",type:"articles",title:{en:"The art of calligraphy",zh:"书法艺术"},description:{en:"Explore the expressive tradition of Chinese brush writing.",zh:"探索中国毛笔书写的表现力与传统。"},body:{en:"## A living art\n\nCalligraphy brings movement, balance and intention together.",zh:"## 一门鲜活的艺术\n\n书法将笔势、平衡与意念融为一体。"},category:"Arts & traditions",tags:["calligraphy","art"],status:"published",featured:true,updatedAt:"Nov 4, 2026"},
    {id:"guide-first-steps",slug:"a-living-culture",type:"lessons",title:{en:"A living culture",zh:"活态文化"},description:{en:"A welcoming first step into Chinese culture.",zh:"认识中国文化的入门指南。"},body:{en:"## Begin with curiosity\n\nCulture is lived, shared and continually changing.",zh:"## 从好奇开始\n\n文化在生活与分享中不断发展。"},category:"Beginner",tags:["learning","introduction"],status:"published",featured:false,updatedAt:"Nov 3, 2026"},
    {id:"festival-mid-autumn",slug:"mid-autumn-festival",type:"festivals",title:{en:"The Mid-Autumn Festival",zh:"中秋节"},description:{en:"A festival of the moon, reunion and seasonal food.",zh:"关于月亮、团圆与时令美食的节日。"},body:{en:"## A time to gather\n\nFamilies share food and stories under the autumn moon.",zh:"## 团聚的时刻\n\n家人们在秋月下分享美食与故事。"},category:"Festivals",tags:["moon","family"],status:"draft",featured:true,updatedAt:"Nov 2, 2026"},
    {id:"book-analects",slug:"the-analects",type:"books",title:{en:"A guide to the Analects",zh:"《论语》阅读指南"},description:{en:"A reader-friendly introduction to the conversations of Confucius.",zh:"以易读的方式介绍孔子及其弟子的对话。"},body:{en:"## Reading the Analects\n\nRead slowly and consider the historical context.",zh:"## 阅读《论语》\n\n慢慢阅读，并结合历史背景理解。"},category:"Reading guides",tags:["classics","philosophy"],status:"published",featured:false,updatedAt:"Oct 31, 2026"},
    {id:"event-autumn-talk",slug:"autumn-culture-talk",type:"events",title:{en:"Autumn culture talk",zh:"秋季文化讲座"},description:{en:"A sample event draft for editorial review.",zh:"供编辑审核的活动草稿示例。"},body:{en:"Event details are pending verification.",zh:"活动详情有待核实。"},category:"Community",tags:["event"],status:"unpublished",featured:false,updatedAt:"Oct 29, 2026"}
  ] : [];
  const collectionNames = {
    articles:{title:"Articles",singular:"article",apiCollection:"culture",subtitle:"Manage culture stories, editorial metadata and publication status."},
    lessons:{title:"Learning guides",singular:"learning guide",apiCollection:"lessons",subtitle:"Organize the learning path and beginner-friendly lessons."},
    festivals:{title:"Festivals",singular:"festival",apiCollection:"festivals",subtitle:"Manage festival guides, seasonal stories and traditions."},
    books:{title:"Books",singular:"book",apiCollection:"books",subtitle:"Manage book introductions and reading guides."},
    events:{title:"Events",singular:"event",apiCollection:"events",subtitle:"Publish verified events and community announcements."}
  };
  const state = {items:demoItems.slice(),page:"dashboard",collection:"articles",pageNumber:1,pageSize:8,selectedId:null,isNew:false,dirty:false,pendingDelete:null,previewLocale:"en",media:[],returnPage:null,returnDirty:false,session:null,variants:{en:null,"zh-CN":null},etags:{en:null,"zh-CN":null},submissions:[]};
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];
  const form = $("[data-content-form]");
  const toastRegion = document.querySelector("[data-toast-region]");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " error" : type === "info" ? " info" : "");
    toast.textContent = message;
    toastRegion.append(toast);
    window.setTimeout(() => toast.remove(), 3400);
  };
  const collectionItems = () => state.items.filter((item) => item.type === state.collection);
  const setConnection = (message) => { const node = $("[data-connection-status]", document); if (node) node.textContent = message; };
  const setPage = (page) => {
    if (state.dirty && !window.confirm("You have unsaved changes. Leave this editor and discard them?")) return;
    state.dirty = false;
    state.page = page;
    $$("[data-page]").forEach((node) => { node.hidden = node.dataset.page !== page; });
    $$("[data-nav]").forEach((node) => node.classList.toggle("is-active", node.dataset.nav === (page === "content" || page === "editor" ? state.collection : page)));
    const title = page === "content" ? collectionNames[state.collection].title : page === "editor" ? "Content editor" : ({dashboard:"Overview",homepage:"Homepage",settings:"Navigation & settings",media:"Media library",languages:"Languages"}[page] || "Overview");
    const crumb = $("[data-breadcrumb]", document);
    if (crumb) crumb.textContent = title;
    if (page === "content") renderList();
    if (page === "dashboard") renderDashboard();
    if (page === "languages") renderLanguages();
    $("#admin-sidebar")?.classList.remove("is-open");
  };
  const setCollection = (name) => {
    if (!collectionNames[name]) return;
    if (state.dirty && !window.confirm("You have unsaved changes. Leave this editor and discard them?")) return;
    state.collection = name;
    state.pageNumber = 1;
    state.dirty = false;
    setPage("content");
    const title = $("[data-content-heading]");
    if (title) title.textContent = collectionNames[name].title;
    const subtitle = $("[data-content-subtitle]");
    if (subtitle) subtitle.textContent = collectionNames[name].subtitle;
    const label = $("[data-new-label]");
    if (label) label.textContent = collectionNames[name].singular;
    const back = $("[data-editor-back]");
    if (back) back.textContent = collectionNames[name].title.toLocaleLowerCase();
  };
  const updateCounts = () => {
    Object.keys(collectionNames).forEach((name) => {
      const node = $("[data-count='" + name + "']");
      if (node) node.textContent = demoMode ? String(state.items.filter((item) => item.type === name).length) : "—";
    });
    const published = state.items.filter((item) => item.status === "published").length;
    const drafts = state.items.filter((item) => item.status === "draft").length;
    const incomplete = state.items.filter((item) => { const t = translationStatus(item); return !t.en || !t.zh; }).length;
    const setStat = (name, value) => { const node = $("[data-stat='" + name + "']"); if (node) node.textContent = String(value); };
    setStat("total", demoMode ? state.items.length : "—");
    setStat("published", demoMode ? published : "—");
    setStat("drafts", demoMode ? drafts : "—");
    setStat("translations", demoMode ? incomplete : "—");
    setStat("coverage", demoMode ? (state.items.length ? Math.round((state.items.length - incomplete) / state.items.length * 100) + "%" : "0%") : "—");
    setStat("missing", demoMode ? incomplete : "—");
  };
  const languagePills = (item) => {
    const t = translationStatus(item);
    return '<div class="language-pills"><span class="language-pill ' + (t.en ? "" : "missing") + '">EN</span><span class="language-pill ' + (t.zh ? "" : "missing") + '">中文</span></div>';
  };
  const statusPill = (status) => '<span class="status-pill status-' + escapeHtml(status) + '">' + escapeHtml(status) + '</span>';
  const renderList = () => {
    updateCounts();
    const search = $("[data-list-search]")?.value || "";
    const status = $("[data-status-filter]")?.value || "";
    const language = $("[data-language-filter]")?.value || "";
    const filtered = filterContent(collectionItems(), {query:search,status,language});
    const result = paginate(filtered,state.pageNumber,state.pageSize);
    state.pageNumber = result.page;
    const rows = $("[data-content-rows]");
    if (!demoMode) {
      rows.innerHTML = '<tr><td colspan="8" class="table-empty">Connect this screen to the approved Agent 5 API contract to load live content. No sample records are shown in production.</td></tr>';
    } else if (!result.items.length) {
      rows.innerHTML = '<tr><td colspan="8" class="table-empty">No content matches these filters. Try another search or create a new item.</td></tr>';
    } else {
      rows.innerHTML = result.items.map((item) => '<tr data-row-id="' + escapeHtml(item.id) + '"><td><input type="checkbox" aria-label="Select ' + escapeHtml(item.title.en || item.title.zh) + '" /></td><td><div class="content-cell"><span class="content-thumb">' + (item.type === "books" ? "冊" : item.type === "festivals" ? "節" : item.type === "lessons" ? "學" : "文") + '</span><span><strong>' + escapeHtml(item.title.en || item.title.zh) + '</strong><small>' + escapeHtml(item.id) + '</small></span></div></td><td>' + languagePills(item) + '</td><td>' + escapeHtml(item.category || "—") + '</td><td>' + statusPill(item.status) + '</td><td><button class="row-action" type="button" data-action="feature" data-id="' + escapeHtml(item.id) + '" aria-label="Toggle featured">' + (item.featured ? '<span class="featured-star">★</span>' : "☆") + '</button></td><td>' + escapeHtml(item.updatedAt || "—") + '</td><td><div class="row-actions"><button class="row-action" type="button" data-action="edit" data-id="' + escapeHtml(item.id) + '" aria-label="Edit content">✎</button><button class="row-action" type="button" data-action="delete" data-id="' + escapeHtml(item.id) + '" aria-label="Delete content">⌫</button></div></td></tr>').join("");
    }
    const summary = $("[data-pagination-summary]");
    if (summary) summary.textContent = "Showing " + result.start + "–" + result.end + " of " + result.total + " items";
    const pageNumber = $("[data-page-number]");
    if (pageNumber) pageNumber.textContent = result.page + " / " + result.pages;
    $("[data-page-prev]").disabled = result.page <= 1;
    $("[data-page-next]").disabled = result.page >= result.pages;
  };
  const renderDashboard = () => {
    updateCounts();
    const recent = state.items.slice().sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,5);
    const rows = $("[data-recent-rows]");
    if (!demoMode) {
      rows.innerHTML = '<tr><td colspan="5" class="table-empty">Live dashboard metrics will appear when the Agent 5 API is connected.</td></tr>';
      return;
    }
    rows.innerHTML = recent.map((item) => '<tr><td><div class="content-cell"><span class="content-thumb">文</span><span><strong>' + escapeHtml(item.title.en || item.title.zh) + '</strong><small>' + escapeHtml(item.id) + '</small></span></div></td><td>' + escapeHtml(collectionNames[item.type].title) + '</td><td>' + statusPill(item.status) + '</td><td>' + escapeHtml(item.updatedAt) + '</td><td><button class="row-action" type="button" data-action="edit" data-id="' + escapeHtml(item.id) + '">→</button></td></tr>').join("");
  };
  const renderLanguages = () => {
    const tbody = $("[data-language-rows]");
    if (!demoMode) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Translation coverage will load from the content API.</td></tr>';
      return;
    }
    tbody.innerHTML = Object.keys(collectionNames).map((name) => {
      const items = state.items.filter((item) => item.type === name);
      const en = items.filter((item) => translationStatus(item).en).length;
      const zh = items.filter((item) => translationStatus(item).zh).length;
      const paired = items.filter((item) => { const t = translationStatus(item); return t.en && t.zh; }).length;
      return '<tr><td>' + collectionNames[name].title + '</td><td>' + en + ' / ' + items.length + '</td><td>' + zh + ' / ' + items.length + '</td><td>' + paired + '</td><td>' + (items.length - paired) + '</td></tr>';
    }).join("");
  };
  const formValue = (name) => form.elements.namedItem(name)?.value || "";
  const formChecked = (name) => Boolean(form.elements.namedItem(name)?.checked);
  const uiLocale = (locale) => locale === "zh-CN" ? "zh" : "en";
  const apiLocale = (locale) => locale === "zh" ? "zh-CN" : locale;
  const showAdminBanner = (message, kind = "warning") => {
    const banner = $("[data-admin-banner]");
    banner.hidden = !message;
    banner.textContent = message || "";
    banner.dataset.kind = kind;
  };
  const localeFormData = (locale) => {
    const suffix = uiLocale(locale);
    return {
      locale,
      slug:formValue("slug." + suffix).trim(),
      title:formValue("title." + suffix).trim(),
      description:formValue("description." + suffix).trim(),
      bodyMarkdown:formValue("body." + suffix),
      category:formValue("category." + suffix).trim(),
      featured:formChecked("featured." + suffix),
      readingMinutes:Number(formValue("readingMinutes." + suffix) || 5),
      level:formValue("level." + suffix).trim(),
      chinese:locale === "en" ? formValue("chinese.en").trim() : "",
      pinyin:locale === "en" ? formValue("pinyin.en").trim() : "",
      mediaSrc:formValue("mediaSrc." + suffix).trim(),
      mediaAlt:formValue("mediaAlt." + suffix).trim(),
      mediaCredit:formValue("mediaCredit." + suffix).trim(),
      mediaLicense:formValue("mediaLicense." + suffix).trim(),
      mediaSource:formValue("mediaSource." + suffix).trim()
    };
  };
  const formData = () => ({
    id:formValue("id"),
    type:formValue("type") || state.collection,
    locales:{en:localeFormData("en"),"zh-CN":localeFormData("zh-CN")},
    tags:parseTags(formValue("tags")),
    seo:{title:{en:formValue("seoTitle.en"),"zh-CN":formValue("seoTitle.zh")},description:{en:formValue("seoDescription.en"),"zh-CN":formValue("seoDescription.zh")}}
  });
  const setField = (name,value) => { const field = form.elements.namedItem(name); if (!field) return; if (field.type === "checkbox") field.checked = Boolean(value); else field.value = value ?? ""; };
  const markClean = () => { state.dirty = false; $("[data-save-state]").textContent = "All changes saved"; $("[data-save-state]").classList.remove("is-dirty"); };
  const markDirty = () => { state.dirty = true; $("[data-save-state]").textContent = "Unsaved changes"; $("[data-save-state]").classList.add("is-dirty"); };
  const localeHasAnyContent = (value) => Boolean(value.title || value.description || value.bodyMarkdown || value.slug || value.category);
  const localeIsComplete = (value) => Boolean(value.title && value.description && value.bodyMarkdown.trim() && value.slug && value.category);
  const toApiPayload = (locale) => {
    const value = localeFormData(locale);
    const existing = state.variants[locale];
    if (!localeIsComplete(value)) {
      throw new Error((locale === "en" ? "English" : "简体中文") + " needs a title, URL slug, description, category and article body before it can be saved.");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) {
      throw new Error("URL slug must use lowercase letters, numbers and hyphens.");
    }
    let media = existing?.media || [];
    if (value.mediaSrc) {
      if (!value.mediaAlt || !value.mediaCredit || !value.mediaLicense) {
        throw new Error("Add image alt text, credit and license before saving a cover image.");
      }
      media = [{
        src:value.mediaSrc,
        alt:value.mediaAlt,
        decorative:false,
        credit:value.mediaCredit,
        license:value.mediaLicense,
        ...(value.mediaSource ? {sourceUrl:value.mediaSource} : {})
      }];
    } else if (existing?.media?.length && !value.mediaSrc) {
      media = existing.media;
    }
    const payload = {
      locale,
      collection:collectionNames[formValue("type") || state.collection].apiCollection,
      slug:value.slug,
      title:value.title,
      description:value.description,
      category:value.category,
      featured:value.featured,
      readingMinutes:value.readingMinutes,
      bodyMarkdown:value.bodyMarkdown,
      media,
      sources:existing?.sources || []
    };
    if (value.level) payload.level = value.level;
    if (value.chinese) payload.chinese = value.chinese;
    if (value.pinyin) payload.pinyin = value.pinyin;
    if (typeof existing?.order === "number") payload.order = existing.order;
    return payload;
  };
  const mapCollectionToUi = (collection) => collection === "culture" ? "articles" : collection;
  const mergeSummaries = (enItems, zhItems) => {
    const merged = new Map();
    const add = (summary) => {
      const id = summary.contentId;
      if (!merged.has(id)) merged.set(id,{id,slug:"",type:mapCollectionToUi(summary.collection),title:{en:"",zh:""},description:{en:"",zh:""},body:{en:"",zh:""},category:"",tags:[],status:"draft",statuses:[],featured:false,updatedAt:summary.updatedAt,translationLocales:summary.translationLocales || [],variants:{en:null,"zh-CN":null},pullRequest:null});
      const item = merged.get(id);
      const locale = summary.locale;
      const suffix = uiLocale(locale);
      item.variants[locale] = summary;
      item.title[suffix] = summary.title || "";
      item.slug = item.slug || summary.slug;
      item.statuses.push(summary.status);
      item.featured = item.featured || Boolean(summary.featured);
      if (!item.updatedAt || Date.parse(summary.updatedAt) > Date.parse(item.updatedAt)) item.updatedAt = summary.updatedAt;
      if (summary.pullRequest) item.pullRequest = summary.pullRequest;
      item.translationLocales = [...new Set([...(item.translationLocales || []),...(summary.translationLocales || []),locale])];
    };
    enItems.forEach(add); zhItems.forEach(add);
    return [...merged.values()].map((item) => {
      item.statuses = [...new Set(item.statuses)];
      item.status = item.statuses.length > 1 ? (item.statuses.every((x)=>x===item.statuses[0]) ? item.statuses[0] : "mixed") : (item.statuses[0] || "draft");
      item.updatedAt = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
      return item;
    }).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  };
  const fetchAllSummaries = async (locale, collection = "") => {
    const pageSize = 100;
    const first = await listContent({locale,collection,page:1,pageSize});
    const items = [...(first.items || [])];
    const pages = Math.ceil((first.total || items.length) / pageSize);
    for (let page = 2; page <= pages; page += 1) {
      const next = await listContent({locale,collection,page,pageSize});
      items.push(...(next.items || []));
    }
    return items;
  };
  const loadAllContent = async () => {
    const [enItems,zhItems] = await Promise.all([fetchAllSummaries("en"),fetchAllSummaries("zh-CN")]);
    state.items = mergeSummaries(enItems,zhItems);
    updateCounts();
    if (state.page === "dashboard") renderDashboard();
    if (state.page === "content") renderList();
    if (state.page === "languages") renderLanguages();
  };
  const loadVariantDetails = async (contentId) => {
    const locales = ["en","zh-CN"];
    const results = await Promise.all(locales.map(async (locale) => {
      try {
        const result = await getContent(contentId,locale);
        return {locale,data:result.data,etag:result.etag};
      } catch (error) {
        if (error instanceof AdminApiError && error.status === 404) return {locale,data:null,etag:null};
        throw error;
      }
    }));
    state.variants = {en:null,"zh-CN":null};
    state.etags = {en:null,"zh-CN":null};
    results.forEach((result) => {
      state.variants[result.locale] = result.data;
      state.etags[result.locale] = result.etag;
    });
    return state.variants;
  };
  const populateEditor = (item = null) => {
    form.reset();
    const value = item || {};
    setField("id",value.id || "");
    setField("type",value.type || state.collection);
    ["en","zh-CN"].forEach((locale) => {
      const suffix = uiLocale(locale);
      const variant = value.variants?.[locale] || null;
      const demo = value.locales?.[locale] || null;
      setField("title." + suffix,variant?.title ?? demo?.title ?? value.title?.[suffix] ?? "");
      setField("slug." + suffix,variant?.slug ?? demo?.slug ?? (locale === "en" ? value.slug : "") ?? "");
      setField("description." + suffix,variant?.description ?? demo?.description ?? value.description?.[suffix] ?? "");
      setField("body." + suffix,variant?.bodyMarkdown ?? demo?.bodyMarkdown ?? value.body?.[suffix] ?? "");
      setField("category." + suffix,variant?.category ?? demo?.category ?? "");
      setField("featured." + suffix,variant?.featured ?? demo?.featured ?? false);
      setField("readingMinutes." + suffix,variant?.readingMinutes ?? demo?.readingMinutes ?? 5);
      setField("level." + suffix,variant?.level ?? demo?.level ?? "");
      setField("mediaSrc." + suffix,variant?.media?.[0]?.src ?? demo?.mediaSrc ?? "");
      setField("mediaAlt." + suffix,variant?.media?.[0]?.alt ?? demo?.mediaAlt ?? "");
      setField("mediaCredit." + suffix,variant?.media?.[0]?.credit ?? demo?.mediaCredit ?? "");
      setField("mediaLicense." + suffix,variant?.media?.[0]?.license ?? demo?.mediaLicense ?? "");
      setField("mediaSource." + suffix,variant?.media?.[0]?.sourceUrl ?? demo?.mediaSource ?? "");
      if (locale === "en") { setField("chinese.en",variant?.chinese ?? demo?.chinese ?? ""); setField("pinyin.en",variant?.pinyin ?? demo?.pinyin ?? ""); }
    });
    setField("tags",(value.tags || []).join(", "));
    setField("status","draft");
  };
  const updateStatusControls = () => {
    const variants = Object.values(state.variants).filter(Boolean);
    const hasPublished = variants.some((variant) => variant.status === "published");
    const hasDiscardableDraft = variants.some((variant) => variant.status === "draft" && !variant.pullRequest);
    $("[data-action='unpublish']").hidden = !hasPublished;
    $("[data-action='delete-current']").hidden = !hasDiscardableDraft;
  };
  const openEditor = async (item = null) => {
    state.selectedId = item?.id || null;
    state.isNew = !item;
    state.dirty = false;
    state.variants = {en:null,"zh-CN":null};
    state.etags = {en:null,"zh-CN":null};
    if (!demoMode && item) {
      setConnection("Loading content");
      try { await loadVariantDetails(item.id); }
      catch (error) { handleApiError(error); return; }
    } else if (demoMode && item) {
      state.variants = {en:item.variants?.en || null,"zh-CN":item.variants?.["zh-CN"] || null};
    }
    const editorItem = item ? {...item,variants:state.variants} : null;
    populateEditor(editorItem);
    state.submissions = [];
    $("[data-editor-heading]").textContent = item ? "Edit content" : "Create " + collectionNames[state.collection].singular;
    updateTranslationIndicators();
    updateStatusControls();
    $("[data-action='back-to-list']").dataset.backTo = state.collection;
    setPage("editor");
    markClean();
    if (!demoMode) setConnection(state.session ? "Connected as " + state.session.email : "API session pending");
  };
  const updateTranslationIndicators = () => {
    ["en","zh-CN"].forEach((locale) => {
      const suffix = uiLocale(locale);
      const title = formValue("title." + suffix);
      const desc = formValue("description." + suffix);
      const body = formValue("body." + suffix);
      const complete = Boolean(title.trim() && desc.trim() && body.trim());
      const node = $("[data-language-state='" + suffix + "']");
      node.textContent = complete ? "Complete" : (title || desc || body ? "In progress" : "Not started");
      node.classList.toggle("is-missing",!complete);
      const count = $("[data-word-count='" + suffix + "']");
      if (count) count.textContent = wordCount(body) + (suffix === "zh" ? " 字" : " words");
    });
  };
  const refreshVariant = async (locale) => {
    const result = await getContent(state.selectedId,locale);
    state.variants[locale] = result.data;
    state.etags[locale] = result.etag;
    return result;
  };
  const saveLiveDrafts = async () => {
    const locales = ["en","zh-CN"].filter((locale) => localeHasAnyContent(localeFormData(locale)));
    if (!locales.length) throw new Error("Add content in English or 简体中文 before saving.");
    for (const locale of locales) {
      const payload = toApiPayload(locale);
      if (!state.selectedId) {
        const created = await createContent(payload);
        state.selectedId = created.contentId;
        state.isNew = false;
        state.variants[locale] = created;
        await refreshVariant(locale);
      } else if (!state.variants[locale]) {
        const created = await createTranslation(state.selectedId,payload);
        state.variants[locale] = created;
        await refreshVariant(locale);
      } else {
        let etag = state.etags[locale];
        if (!etag) etag = (await refreshVariant(locale)).etag;
        if (!etag) throw new Error("The server did not return a revision ETag for " + locale + ". Refresh and retry.");
        const saved = await saveDraft(state.selectedId,locale,payload,etag);
        state.variants[locale] = saved.data;
        state.etags[locale] = saved.etag;
      }
    }
    setField("id",state.selectedId);
    markClean();
    updateStatusControls();
    return state.selectedId;
  };
  const preview = async (openDialog = true) => {
    const value = formData();
    const locale = state.previewLocale === "zh" ? "zh-CN" : "en";
    const variant = value.locales[locale];
    if (!variant.title || !variant.description || !variant.bodyMarkdown.trim()) {
      showToast("Complete the selected language before previewing it.","error");
      return;
    }
    if (demoMode) {
      $("[data-preview-title]").textContent = variant.title;
      $("[data-preview-description]").textContent = variant.description;
      $("[data-preview-body]").textContent = variant.bodyMarkdown;
      $("[data-preview-category]").textContent = variant.category || collectionNames[value.type]?.title || "Culture";
      $("[data-preview-frame]").hidden = true;
      $("[data-preview-body]").hidden = false;
      $("[data-preview-language-status]").textContent = "Development preview";
    } else {
      try {
        if (!state.selectedId) await saveLiveDrafts();
        const payload = toApiPayload(locale);
        const result = await previewContent(state.selectedId,{locale,metadata:payload,bodyMarkdown:payload.bodyMarkdown});
        $("[data-preview-title]").textContent = variant.title;
        $("[data-preview-description]").textContent = variant.description;
        $("[data-preview-category]").textContent = variant.category;
        $("[data-preview-frame]").srcdoc = result.html;
        $("[data-preview-frame]").hidden = false;
        $("[data-preview-body]").hidden = true;
        $("[data-preview-language-status]").textContent = (result.warnings || []).join(" · ") || "Sanitized server preview";
      } catch (error) { handleApiError(error); return; }
    }
    if (openDialog && !$("[data-preview-dialog]").open) $("[data-preview-dialog]").showModal();
  };
  const saveContent = async () => {
    if (demoMode) {
      const value = formData();
      const complete = ["en","zh-CN"].filter((locale)=>localeIsComplete(value.locales[locale]));
      if (!complete.length) { showToast("Complete at least one language version before saving.","error"); return; }
      const item = {
        id:state.selectedId || "demo-" + Date.now().toString(36),
        type:value.type,
        title:{en:value.locales.en.title,zh:value.locales["zh-CN"].title},
        description:{en:value.locales.en.description,zh:value.locales["zh-CN"].description},
        body:{en:value.locales.en.bodyMarkdown,zh:value.locales["zh-CN"].bodyMarkdown},
        slug:value.locales.en.slug || value.locales["zh-CN"].slug,
        category:value.locales.en.category || value.locales["zh-CN"].category,
        tags:value.tags,status:"draft",featured:value.locales.en.featured || value.locales["zh-CN"].featured,
        updatedAt:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
        translationLocales:complete.map((locale)=>locale)
      };
      const index=state.items.findIndex((entry)=>entry.id===item.id);
      if(index>=0) state.items[index]={...state.items[index],...item}; else state.items.unshift(item);
      state.selectedId=item.id; setField("id",item.id); markClean(); updateCounts(); updateStatusControls();
      showToast("Draft saved in development preview.","info");
      return;
    }
    try {
      await saveLiveDrafts();
      await loadAllContent();
      showToast("Draft saved to the CMS branch. It is not public yet.","success");
    } catch (error) { handleApiError(error); }
  };
  const submitWorkflow = async (intent) => {
    if (demoMode) {
      await saveContent();
      showToast(intent === "publish" ? "Publish request previewed in development mode." : "Unpublish request previewed in development mode.","info");
      return;
    }
    try {
      await saveLiveDrafts();
      const locales = ["en","zh-CN"].filter((locale)=>state.variants[locale] && (intent !== "unpublish" || state.variants[locale].status === "published"));
      if (!locales.length) throw new Error(intent === "unpublish" ? "There are no published language variants to unpublish." : "Save at least one language version before requesting publication.");
      const results = [];
      for (const locale of locales) {
        if (!state.etags[locale]) await refreshVariant(locale);
        const result = await submitContent(state.selectedId,locale,state.etags[locale],intent,"Submitted from the bilingual editorial CMS.");
        results.push(result);
      }
      state.submissions = results;
      markClean();
      const prNumbers = results.map((result)=>"#" + result.pullRequest.number).join(", ");
      showToast((intent === "publish" ? "Publish" : "Unpublish") + " request submitted for review: " + prNumbers + ". A reviewer must merge the PR.","success");
      await loadAllContent();
      updateStatusControls();
    } catch (error) { handleApiError(error); }
  };
  const requestDelete = (id) => {
    state.pendingDelete = id;
    $("[data-confirm-dialog]").showModal();
  };
  const deleteContent = async () => {
    if (demoMode) {
      state.items = state.items.filter((item) => item.id !== state.pendingDelete);
      state.pendingDelete = null;
      $("[data-confirm-dialog]").close();
      showToast("Content deleted in development preview.","info");
      if (state.page === "editor") setPage("content"); else renderList();
      updateCounts();
      return;
    }
    try {
      await loadVariantDetails(state.pendingDelete);
      const drafts = ["en","zh-CN"].filter((locale)=>state.variants[locale]?.status === "draft" && !state.variants[locale]?.pullRequest);
      if (!drafts.length) throw new Error("Only an unsubmitted draft variant can be discarded. Published content must go through a reviewed unpublish workflow.");
      for (const locale of drafts) await discardDraft(state.pendingDelete,locale);
      state.pendingDelete = null;
      $("[data-confirm-dialog]").close();
      showToast("Unsubmitted draft variant(s) discarded.","success");
      if (state.page === "editor") setPage("content");
      await loadAllContent();
    } catch (error) { handleApiError(error); }
  };
  const handleApiError = (error) => {
    if (error instanceof AdminApiError && error.status === 401) {
      clearAdminCsrfToken();
      setConnection("Authentication required");
      showAdminBanner("Sign in with the authorized Cloudflare Access account, then reload this page. The admin API rejected the session.", "error");
    } else if (error instanceof AdminApiError && error.status === 403) {
      setConnection("Permission denied");
      showAdminBanner("Your Cloudflare Access identity is recognized but does not have an authorized CMS role.", "error");
    } else if (error instanceof AdminApiError && error.status === 409) {
      showAdminBanner("This content changed on the server. Reload the variant before saving again to avoid overwriting another editor's changes.", "warning");
    }
    const detail = error instanceof AdminApiError && error.requestId ? error.message + " (Request " + error.requestId + ")" : (error.message || "The request failed.");
    showToast(detail,"error");
  };
  const bootstrapLive = async () => {
    try {
      setConnection("Checking Access session");
      const session = await getAdminSession();
      state.session = session;
      const email = $("[data-session-email]",document);
      const role = $("[data-session-role]",document);
      if (email) email.textContent = session.email;
      if (role) role.textContent = session.role;
      setConnection("Connected");
      showAdminBanner("", "success");
      await loadAllContent();
      renderDashboard();
    } catch (error) {
      handleApiError(error);
      if (!(error instanceof AdminApiError && (error.status === 401 || error.status === 403))) {
        showAdminBanner("The CMS API is temporarily unavailable or not fully deployed yet. No sample content is shown in production.", "warning");
      }
    }
  };
  const uploadCurrentMedia = async (file) => {
    const locale = $("[data-media-locale]").value;
    if (demoMode) {
      if (!file.type.startsWith("image/")) { showToast("Choose a supported image file.","error"); return; }
      state.media.push({name:file.name,url:URL.createObjectURL(file),size:file.size});
      renderMedia();
      showToast("Local preview added. It has not been uploaded.","info");
      return;
    }
    if (!state.selectedId || !state.variants[locale] || !state.etags[locale]) {
      showToast("Save a draft for this language before uploading its cover image.","error");
      return;
    }
    const suffix=uiLocale(locale);
    const metadata={
      alt:formValue("mediaAlt."+suffix),
      decorative:false,
      credit:formValue("mediaCredit."+suffix),
      license:formValue("mediaLicense."+suffix),
      ...(formValue("mediaSource."+suffix) ? {sourceUrl:formValue("mediaSource."+suffix)} : {})
    };
    if (!metadata.alt || !metadata.credit || !metadata.license) {
      showToast("Enter image alt text, credit and license in the language editor before upload.","error");
      return;
    }
    try {
      const result=await uploadMedia(state.selectedId,locale,state.etags[locale],file,metadata);
      setField("mediaSrc."+suffix,result.src);
      await refreshVariant(locale);
      markClean();
      showToast("Image uploaded and attached to the " + (locale==="en" ? "English" : "Chinese") + " draft.","success");
      renderMedia();
    } catch(error) { handleApiError(error); }
  };
  root.addEventListener("click", async (event) => {
    const nav = event.target.closest("[data-nav]");
    if (nav) {
      const name = nav.dataset.nav;
      if (collectionNames[name]) setCollection(name); else setPage(name);
      return;
    }
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const name = action.dataset.action;
    if (name === "toggle-sidebar") $("#admin-sidebar").classList.toggle("is-open");
    if (name === "new-content") openEditor();
    if (name === "open-articles") setCollection("articles");
    if (name === "back-to-list") setPage("content");
    if (name === "edit") {
      const item = state.items.find((entry) => entry.id === action.dataset.id);
      if (item) { state.collection = item.type; openEditor(item); }
    }
    if (name === "delete") requestDelete(action.dataset.id);
    if (name === "delete-current") requestDelete(state.selectedId);
    if (name === "confirm-delete") deleteContent();
    if (name === "cancel-delete") $("[data-confirm-dialog]").close();
    if (name === "feature") {
      if (!demoMode) { apiNotReady(); return; }
      const item = state.items.find((entry) => entry.id === action.dataset.id);
      if (item) { item.featured = !item.featured; renderList(); showToast(item.featured ? "Added to featured content." : "Removed from featured content.","info"); }
    }
    if (name === "preview") preview();
    if (name === "close-preview") $("[data-preview-dialog]").close();
    if (name === "save-draft") await saveContent("draft");
    if (name === "publish") await saveContent("published");
    if (name === "clear-filters") { $("[data-list-search]").value=""; $("[data-status-filter]").value=""; $("[data-language-filter]").value=""; state.pageNumber=1; renderList(); }
    if (name === "save-settings") showToast(demoMode ? "Settings preview only; backend API integration is pending." : "Settings API integration is pending.","info");
    if (name === "choose-upload") $("[data-media-input]").click();
    if (name === "open-media") { state.returnPage=state.page; state.returnDirty=state.dirty; state.dirty=false; $("[data-action=back-to-editor]").hidden=state.returnPage!=="editor"; setPage("media"); }
    if (name === "add-navigation") showToast("Navigation editing will be enabled by the site-settings API.","info");
    if (name === "back-to-editor") { state.dirty=false; setPage("editor"); if(state.returnDirty) markDirty(); }
  });
  root.addEventListener("input", (event) => {
    if (event.target.matches("[data-list-search]")) { state.pageNumber=1; renderList(); }
    if (event.target.matches("[data-global-search]")) {
      const input = event.target.value;
      if (input.trim()) { setCollection(state.collection); $("[data-list-search]").value=input; renderList(); }
    }
    if (event.target.closest("[data-content-form]")) { markDirty(); updateTranslationIndicators(); }
    if (event.target.matches("[data-media-search]")) {
      const query = event.target.value.toLocaleLowerCase();
      $$(".media-card").forEach((card) => { card.hidden = !card.dataset.name.includes(query); });
    }
  });
  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-status-filter],[data-language-filter]")) { state.pageNumber=1; renderList(); }
    if (event.target.matches("[data-media-input]")) {
      const files = [...event.target.files || []];
      if (!files.length) return;
      if (!demoMode) { showToast("Media upload is unavailable until the Agent 5 media endpoint is connected.","info"); return; }
      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const url = URL.createObjectURL(file);
        state.media.push({name:file.name,url,size:file.size});
      });
      renderMedia();
      showToast(files.length + " local preview(s) added. These files have not been uploaded.","info");
    }
  });
  const renderMedia = () => {
    const grid = $("[data-media-grid]");
    $("[data-media-count]").textContent = state.media.length + " local preview asset(s)";
    grid.innerHTML = state.media.length ? state.media.map((file) => '<article class="media-card" data-name="' + escapeHtml(file.name.toLocaleLowerCase()) + '"><img src="' + file.url + '" alt="" /><div><strong>' + escapeHtml(file.name) + '</strong><small>' + Math.round(file.size/1024) + ' KB · local preview</small><button class="text-button" type="button" data-action="select-media" data-url="' + file.url + '">Use image</button></div></article>').join("") : '<div class="media-empty"><span>▧</span><strong>Your media library is ready</strong><p>Uploaded assets will appear here after the media API is connected.</p></div>';
  };
  document.addEventListener("click", (event) => {
    const externalAction = event.target.closest("[data-action]");
    if (externalAction && !root.contains(externalAction)) {
      if (externalAction.dataset.action === "close-preview") $("[data-preview-dialog]").close();
      if (externalAction.dataset.action === "cancel-delete") $("[data-confirm-dialog]").close();
      if (externalAction.dataset.action === "confirm-delete") deleteContent();
    }
    const choose = event.target.closest("[data-action='select-media']");
    if (choose) {
      if (state.returnPage === "editor") { state.dirty=false; setPage("editor"); state.returnPage=null; }
      if (state.page !== "editor") { showToast("Open a content editor to select a cover image.","info"); return; }
      setField("coverImage",choose.dataset.url);
      markDirty();
      showToast("Local preview selected. Upload integration is still pending.","info");
    }
    const previewLocale = event.target.closest("[data-preview-language]");
    if (previewLocale) {
      state.previewLocale = previewLocale.dataset.previewLanguage;
      $$("[data-preview-language]").forEach((button) => button.classList.toggle("is-selected",button === previewLocale));
      preview(false);
    }
  });
  $("[data-page-prev]").addEventListener("click",() => {state.pageNumber=Math.max(1,state.pageNumber-1);renderList();});
  $("[data-page-next]").addEventListener("click",() => {state.pageNumber++;renderList();});
  $("[data-select-all]").addEventListener("change",(event) => $$("[data-content-rows] input[type=checkbox]").forEach((box) => {box.checked=event.target.checked;}));
  const dropzone = $("[data-dropzone]");
  ["dragenter","dragover"].forEach((eventName) => dropzone.addEventListener(eventName,(event) => {event.preventDefault();dropzone.classList.add("is-dragging");}));
  ["dragleave","drop"].forEach((eventName) => dropzone.addEventListener(eventName,(event) => {event.preventDefault();dropzone.classList.remove("is-dragging");if(eventName==="drop" && event.dataTransfer?.files?.length){const input=$("[data-media-input]");input.files=event.dataTransfer.files;input.dispatchEvent(new Event("change",{bubbles:true}));}}));
  window.addEventListener("beforeunload",(event) => {if(state.dirty){event.preventDefault();event.returnValue="";}});
  window.addEventListener("keydown",(event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase()==="k") {event.preventDefault();$("[data-global-search]").focus();}
    if (event.key==="Escape") $("#admin-sidebar").classList.remove("is-open");
  });
  // Exact route mapping and resource payloads are added only after Agent 0 approves
  // the API contract and Agent 5 publishes its matching implementation.
  if (demoMode) {
    setConnection("Development preview");
    renderDashboard();
    updateCounts();
  } else {
    setConnection("API contract pending");
    renderDashboard();
    updateCounts();
  }
  if (form) form.addEventListener("submit",(event) => event.preventDefault());
  // Keep the shared transport available for the contract integration without exposing credentials.
  window.__adminApiRequest = requestAdminApi;
  window.__adminApiErrorHandler = handleApiError;
}
