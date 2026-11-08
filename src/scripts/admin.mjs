import { filterContent, paginate, parseTags, translationStatus, wordCount, localizedSeoPayload } from "../lib/admin-ui.mjs";
import {
  AdminApiError, clearAdminCsrfToken, getAdminSession, listContent,
  getContent, createContent, createTranslation, saveDraft, previewContent,
  uploadMedia, submitContent, discardDraft, getPullRequestStatus, syncPullRequest
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
  const state = {items:demoItems.slice(),capabilities:{publish:false,mediaUpload:false,preview:true},page:"dashboard",collection:"articles",pageNumber:1,pageSize:8,selectedId:null,isNew:false,dirty:false,pendingDelete:null,previewLocale:"en",media:[],returnPage:null,returnDirty:false,session:null,variants:{en:null,"zh-CN":null,es:null},etags:{en:null,"zh-CN":null,es:null},submissions:[]};
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
      if (node) node.textContent = String(state.items.filter((item) => item.type === name).length);
    });
    const published = state.items.filter((item) => item.statuses?.includes("published") || item.status === "published").length;
    const drafts = state.items.filter((item) => item.statuses?.includes("draft") || item.status === "draft").length;
    const incomplete = state.items.filter((item) => { const t = translationStatus(item); return !t.en || !t.zh || !t.es; }).length;
    const setStat = (name, value) => { const node = $("[data-stat='" + name + "']"); if (node) node.textContent = String(value); };
    setStat("total", state.items.length);
    setStat("published", published);
    setStat("drafts", drafts);
    setStat("translations", incomplete);
    setStat("coverage", state.items.length ? Math.round((state.items.length - incomplete) / state.items.length * 100) + "%" : "0%");
    setStat("missing", incomplete);
  };
  const languagePills = (item) => {
    const t = translationStatus(item);
    return '<div class="language-pills"><span class="language-pill ' + (t.en ? "" : "missing") + '">EN</span><span class="language-pill ' + (t.zh ? "" : "missing") + '">中文</span><span class="language-pill ' + (t.es ? "" : "missing") + '">ES</span></div>';
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
    if (!result.items.length) {
      rows.innerHTML = '<tr><td colspan="8" class="table-empty">No content matches these filters. Try another search or create a new item.</td></tr>';
    } else {
      rows.innerHTML = result.items.map((item) => '<tr data-row-id="' + escapeHtml(item.id) + '"><td><input type="checkbox" aria-label="Select ' + escapeHtml(item.title.en || item.title.zh || item.title.es) + '" /></td><td><div class="content-cell"><span class="content-thumb">' + (item.type === "books" ? "冊" : item.type === "festivals" ? "節" : item.type === "lessons" ? "學" : "文") + '</span><span><strong>' + escapeHtml(item.title.en || item.title.zh || item.title.es) + '</strong><small>' + escapeHtml(item.id) + '</small></span></div></td><td>' + languagePills(item) + '</td><td>' + escapeHtml(item.category || "—") + '</td><td>' + statusPill(item.status) + '</td><td><button class="row-action" type="button" data-action="feature" data-id="' + escapeHtml(item.id) + '" aria-label="Toggle featured">' + (item.featured ? '<span class="featured-star">★</span>' : "☆") + '</button></td><td>' + escapeHtml(item.updatedAt || "—") + '</td><td><div class="row-actions"><button class="row-action" type="button" data-action="edit" data-id="' + escapeHtml(item.id) + '" aria-label="Edit content">✎</button><button class="row-action" type="button" data-action="delete" data-id="' + escapeHtml(item.id) + '" aria-label="Delete content">⌫</button></div></td></tr>').join("");
    }
    const summary = $("[data-pagination-summary]");
    if (summary) summary.textContent = "Showing " + result.start + "–" + result.end + " of " + result.total + " items";
    const pageNumber = $("[data-page-number]");
    if (pageNumber) pageNumber.textContent = result.page + " / " + result.pages;
    $("[data-page-prev]").disabled = result.page <= 1;
    $("[data-page-next]").disabled = result.page >= result.pages;
    $("[data-action='feature']").forEach((button)=>{button.disabled=!demoMode && !state.capabilities.publish;});
  };
  const renderDashboard = () => {
    updateCounts();
    const recent = state.items.slice().sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,5);
    const rows = $("[data-recent-rows]");
    if (!recent.length) { rows.innerHTML = '<tr><td colspan="5" class="table-empty">No content has been added yet.</td></tr>'; return; }
    rows.innerHTML = recent.map((item) => '<tr><td><div class="content-cell"><span class="content-thumb">文</span><span><strong>' + escapeHtml(item.title.en || item.title.zh || item.title.es) + '</strong><small>' + escapeHtml(item.id) + '</small></span></div></td><td>' + escapeHtml(collectionNames[item.type].title) + '</td><td>' + statusPill(item.status) + '</td><td>' + escapeHtml(item.updatedAt) + '</td><td><button class="row-action" type="button" data-action="edit" data-id="' + escapeHtml(item.id) + '">→</button></td></tr>').join("");
  };
  const renderLanguages = () => {
    const tbody = $("[data-language-rows]");
    if (!state.items.length) { tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No content has been added yet.</td></tr>'; return; }
    tbody.innerHTML = Object.keys(collectionNames).map((name) => {
      const items = state.items.filter((item) => item.type === name);
      const en = items.filter((item) => translationStatus(item).en).length;
      const zh = items.filter((item) => translationStatus(item).zh).length;
      const es = items.filter((item) => translationStatus(item).es).length;
      const paired = items.filter((item) => { const t = translationStatus(item); return t.en && t.zh && t.es; }).length;
      return '<tr><td>' + collectionNames[name].title + '</td><td>' + en + ' / ' + items.length + '</td><td>' + zh + ' / ' + items.length + '</td><td>' + es + ' / ' + items.length + '</td><td>' + paired + '</td><td>' + (items.length - paired) + '</td></tr>';
    }).join("");
  };
  const formValue = (name) => form.elements.namedItem(name)?.value || "";
  const formChecked = (name) => Boolean(form.elements.namedItem(name)?.checked);
  const uiLocale = (locale) => locale === "zh-CN" ? "zh" : locale === "es" ? "es" : "en";
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
      imageUrl:formValue("imageUrl." + suffix).trim(),
      imageAlt:formValue("imageAlt." + suffix).trim(),
      mediaSrc:formValue("mediaSrc." + suffix).trim(),
      mediaAlt:formValue("mediaAlt." + suffix).trim(),
      mediaCredit:formValue("mediaCredit." + suffix).trim(),
      mediaLicense:formValue("mediaLicense." + suffix).trim(),
      mediaSource:formValue("mediaSource." + suffix).trim(),
      tags:parseTags(formValue("tags." + suffix)),
      seoTitle:formValue("seoTitle." + suffix).trim(),
      seoDescription:formValue("seoDescription." + suffix).trim()
    };
  };
  const formData = () => ({
    id:formValue("id"),
    type:formValue("type") || state.collection,
    locales:{en:localeFormData("en"),"zh-CN":localeFormData("zh-CN"),es:localeFormData("es")},
    seo:{title:{en:formValue("seoTitle.en"),"zh-CN":formValue("seoTitle.zh"),es:formValue("seoTitle.es")},description:{en:formValue("seoDescription.en"),"zh-CN":formValue("seoDescription.zh"),es:formValue("seoDescription.es")}}
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
      tags:value.tags,
      readingMinutes:value.readingMinutes,
      bodyMarkdown:value.bodyMarkdown,
      media,
      sources:existing?.sources || [],
      ...(value.imageUrl ? {imageUrl:value.imageUrl,imageAlt:value.imageAlt} : {})
    };
    Object.assign(payload,localizedSeoPayload(locale,value.seoTitle,value.seoDescription));
    if (value.level) payload.level = value.level;
    if (value.chinese) payload.chinese = value.chinese;
    if (value.pinyin) payload.pinyin = value.pinyin;
    if (typeof existing?.order === "number") payload.order = existing.order;
    return payload;
  };
  const mapCollectionToUi = (collection) => collection === "culture" ? "articles" : collection;
  const mergeSummaries = (...groups) => {
    const merged = new Map();
    const add = (summary) => {
      const id = summary.contentId;
      if (!merged.has(id)) merged.set(id,{id,slug:"",type:mapCollectionToUi(summary.collection),title:{en:"",zh:"",es:""},description:{en:"",zh:"",es:""},body:{en:"",zh:"",es:""},category:"",tags:[],status:"draft",statuses:[],featured:false,updatedAt:summary.updatedAt,translationLocales:summary.translationLocales || [],variants:{en:null,"zh-CN":null,es:null},categories:{en:"",zh:"",es:""},pullRequest:null,pullRequestState:null});
      const item = merged.get(id);
      const locale = summary.locale;
      const suffix = uiLocale(locale);
      item.variants[locale] = summary;
      item.title[suffix] = summary.title || "";
      item.description[suffix] = summary.description || "";
      item.categories[suffix] = summary.category || "";
      item.category = item.category || summary.category || "";
      item.tags = [...new Set([...(item.tags || []),...(summary.tags || [])])];
      item.slug = item.slug || summary.slug;
      item.statuses.push(summary.status);
      item.featured = item.featured || Boolean(summary.featured);
      if (!item.updatedAt || Date.parse(summary.updatedAt) > Date.parse(item.updatedAt)) item.updatedAt = summary.updatedAt;
      if (summary.pullRequest) item.pullRequest = summary.pullRequest;
      if (summary.pullRequestState) item.pullRequestState = summary.pullRequestState;
      item.translationLocales = [...new Set([...(item.translationLocales || []),...(summary.translationLocales || []),locale])];
    };
    groups.flat().forEach(add);
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
    const loadLocales = () => Promise.all([fetchAllSummaries("en"),fetchAllSummaries("zh-CN"),fetchAllSummaries("es")]);
    let [enItems,zhItems,esItems] = await loadLocales();
    state.items = mergeSummaries(enItems,zhItems,esItems);
    const trackedPullRequests = [...new Set(state.items.filter((item)=>item.pullRequest && ["pending","open"].includes(item.pullRequestState)).map((item)=>item.pullRequest))];
    if (trackedPullRequests.length) {
      const statuses = await Promise.all(trackedPullRequests.map(async (number)=>{const status=await getPullRequestStatus(number).catch(()=>null);if(status && ["merged","closed"].includes(status.state)) await syncPullRequest(number).catch(()=>null);return status;}));
      if (statuses.some((status)=>status && ["merged","closed"].includes(status.state))) {
        [enItems,zhItems,esItems] = await loadLocales();
        state.items = mergeSummaries(enItems,zhItems,esItems);
      }
    }
    updateCounts();
    if (state.page === "dashboard") renderDashboard();
    if (state.page === "content") renderList();
    if (state.page === "languages") renderLanguages();
  };
  const loadVariantDetails = async (contentId) => {
    const locales = ["en","zh-CN","es"];
    const results = await Promise.all(locales.map(async (locale) => {
      try {
        const result = await getContent(contentId,locale);
        return {locale,data:result.data,etag:result.etag};
      } catch (error) {
        if (error instanceof AdminApiError && error.status === 404) return {locale,data:null,etag:null};
        throw error;
      }
    }));
    state.variants = {en:null,"zh-CN":null,es:null};
    state.etags = {en:null,"zh-CN":null,es:null};
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
    ["en","zh-CN","es"].forEach((locale) => {
      const suffix = uiLocale(locale);
      const variant = value.variants?.[locale] || null;
      const demo = value.locales?.[locale] || null;
      setField("title." + suffix,variant?.title ?? demo?.title ?? value.title?.[suffix] ?? "");
      setField("slug." + suffix,variant?.slug ?? demo?.slug ?? value.slug ?? "");
      setField("description." + suffix,variant?.description ?? demo?.description ?? value.description?.[suffix] ?? "");
      setField("body." + suffix,variant?.bodyMarkdown ?? demo?.bodyMarkdown ?? value.body?.[suffix] ?? "");
      setField("category." + suffix,variant?.category ?? demo?.category ?? value.categories?.[suffix] ?? value.category ?? "");
      setField("tags." + suffix,(variant?.tags || demo?.tags || value.tags || []).join(", "));
      setField("seoTitle." + suffix,variant?.seoTitle ?? demo?.seoTitle ?? "");
      setField("seoDescription." + suffix,variant?.seoDescription ?? demo?.seoDescription ?? "");
      setField("featured." + suffix,variant?.featured ?? demo?.featured ?? value.featured ?? false);
      setField("readingMinutes." + suffix,variant?.readingMinutes ?? demo?.readingMinutes ?? 5);
      setField("level." + suffix,variant?.level ?? demo?.level ?? "");
      setField("imageUrl." + suffix,variant?.imageUrl ?? demo?.imageUrl ?? "");
      setField("imageAlt." + suffix,variant?.imageAlt ?? demo?.imageAlt ?? "");
      setField("mediaSrc." + suffix,variant?.media?.[0]?.src ?? demo?.mediaSrc ?? "");
      setField("mediaAlt." + suffix,variant?.media?.[0]?.alt ?? demo?.mediaAlt ?? "");
      setField("mediaCredit." + suffix,variant?.media?.[0]?.credit ?? demo?.mediaCredit ?? "");
      setField("mediaLicense." + suffix,variant?.media?.[0]?.license ?? demo?.mediaLicense ?? "");
      setField("mediaSource." + suffix,variant?.media?.[0]?.sourceUrl ?? demo?.mediaSource ?? "");
      if (locale === "en") { setField("chinese.en",variant?.chinese ?? demo?.chinese ?? ""); setField("pinyin.en",variant?.pinyin ?? demo?.pinyin ?? ""); }
    });
    setField("status","draft");
  };
  const renderVariantMedia = () => {
    ["en","zh-CN","es"].forEach((locale) => {
      const node=$('[data-variant-media-list="' + uiLocale(locale) + '"]');
      if(!node) return;
      const assets=state.variants[locale]?.media || [];
      node.innerHTML=assets.length ? assets.map((asset,index) => {
        const source=asset.src || "";
        return '<div class="variant-media-item"><img src="' + escapeHtml(source) + '" alt="' + escapeHtml(asset.alt || "") + '" /><div><strong>' + escapeHtml(source.split("/").pop()) + '</strong><small>' + escapeHtml(asset.license || "License not supplied") + '</small><button class="text-button" type="button" data-action="select-variant-media" data-locale="' + locale + '" data-src="' + escapeHtml(source) + '" data-alt="' + escapeHtml(asset.alt || "") + '" data-credit="' + escapeHtml(asset.credit || "") + '" data-license="' + escapeHtml(asset.license || "") + '" data-source="' + escapeHtml(asset.sourceUrl || "") + '">Use as cover</button></div></div>';
      }).join("") : '<p class="field-hint">No images attached to this language variant yet.</p>';
    });
  };
  const setEditorLock = (locked) => {
    form.querySelectorAll("input,textarea,select").forEach((field)=>{ if (!field.hasAttribute("data-variant-media-input")) field.disabled=locked; });
    $("[data-action='save-draft'],[data-action='delete-current']").forEach((button)=>{button.disabled=locked;});
    $("[data-action='publish'],[data-action='unpublish']").forEach((button)=>{button.disabled=locked || !state.capabilities.publish;});
    if (locked) showAdminBanner("This article has an open review pull request. Editing is locked until the pull request is merged or closed.", "warning");
    else showAdminBanner("", "success");
  };
  const updateStatusControls = () => {
    const variants = Object.values(state.variants).filter(Boolean);
    const hasPublished = variants.some((variant) => variant.status === "published");
    const hasDiscardableDraft = variants.some((variant) => variant.status === "draft" && !variant.pullRequest);
    $$("[data-action='unpublish']").forEach((button)=>{button.hidden=!hasPublished;});
    $$("[data-action='delete-current']").forEach((button)=>{button.hidden=!hasDiscardableDraft;});
  };
  const openEditor = async (item = null) => {
    state.selectedId = item?.id || null;
    state.isNew = !item;
    state.dirty = false;
    form.querySelectorAll("input,textarea,select").forEach((field)=>{if(!field.hasAttribute("data-variant-media-input"))field.disabled=false;});
    state.variants = {en:null,"zh-CN":null,es:null};
    state.etags = {en:null,"zh-CN":null,es:null};
    if (!demoMode && item) {
      setConnection("Loading content");
      try { await loadVariantDetails(item.id); }
      catch (error) { handleApiError(error); return; }
    } else if (demoMode && item) {
      state.variants = {
        en:item.title?.en ? {status:item.status,featured:item.featured} : null,
        "zh-CN":item.title?.zh ? {status:item.status,featured:item.featured} : null,
        es:item.title?.es ? {status:item.status,featured:item.featured} : null
      };
    }
    const editorItem = item ? {...item,variants:state.variants} : null;
    populateEditor(editorItem);
    state.submissions = [];
    const prLink=$("[data-pr-link]");
    if(prLink){prLink.hidden=true;prLink.removeAttribute("href");}
    $("[data-editor-heading]").textContent = item ? "Edit content" : "Create " + collectionNames[state.collection].singular;
    updateTranslationIndicators();
    updateStatusControls();
    setEditorLock(Object.values(state.variants).some((variant)=>variant && ["pending","open"].includes(variant.pullRequestState)));
    renderVariantMedia();
    $("[data-action='back-to-list']").dataset.backTo = state.collection;
    setPage("editor");
    markClean();
    if (!demoMode) setConnection(state.session ? "Connected as " + state.session.email : "API session pending");
  };
  const updateTranslationIndicators = () => {
    ["en","zh-CN","es"].forEach((locale) => {
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
    const locales = ["en","zh-CN","es"].filter((locale) => localeHasAnyContent(localeFormData(locale)));
    if (!locales.length) throw new Error("Add content in English, 简体中文 or Spanish before saving.");
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
    const locale = state.previewLocale === "zh" ? "zh-CN" : state.previewLocale === "es" ? "es" : "en";
    const variant = value.locales[locale];
    if (!variant.title || !variant.description || !variant.bodyMarkdown.trim()) {
      showToast("Complete the selected language before previewing it.","error");
      return;
    }
    if (demoMode) {
      $("[data-preview-title]", document).textContent = variant.title;
      $("[data-preview-description]", document).textContent = variant.description;
      $("[data-preview-body]", document).textContent = variant.bodyMarkdown;
      $("[data-preview-category]", document).textContent = variant.category || collectionNames[value.type]?.title || "Culture";
      $("[data-preview-frame]", document).hidden = true;
      $("[data-preview-body]", document).hidden = false;
      $("[data-preview-language-status]", document).textContent = "Development preview";
    } else {
      try {
        if (!state.selectedId) await saveLiveDrafts();
        const payload = toApiPayload(locale);
        const result = await previewContent(state.selectedId,{content:payload});
        $("[data-preview-title]", document).textContent = variant.title;
        $("[data-preview-description]", document).textContent = variant.description;
        $("[data-preview-category]", document).textContent = variant.category;
        $("[data-preview-frame]", document).srcdoc = result.html;
        $("[data-preview-frame]", document).hidden = false;
        $("[data-preview-body]", document).hidden = true;
        $("[data-preview-language-status]", document).textContent = (result.warnings || []).join(" · ") || "Sanitized server preview";
      } catch (error) { handleApiError(error); return; }
    }
    if (openDialog && !$("[data-preview-dialog]", document).open) $("[data-preview-dialog]", document).showModal();
  };
  const saveContent = async () => {
    if (demoMode) {
      const value = formData();
      const complete = ["en","zh-CN","es"].filter((locale)=>localeIsComplete(value.locales[locale]));
      if (!complete.length) { showToast("Complete at least one language version before saving.","error"); return; }
      const item = {
        id:state.selectedId || "demo-" + Date.now().toString(36),
        type:value.type,
        title:{en:value.locales.en.title,zh:value.locales["zh-CN"].title},
        description:{en:value.locales.en.description,zh:value.locales["zh-CN"].description},
        body:{en:value.locales.en.bodyMarkdown,zh:value.locales["zh-CN"].bodyMarkdown},
        slug:value.locales.en.slug || value.locales["zh-CN"].slug,
        category:value.locales.en.category || value.locales["zh-CN"].category,
        tags:[...new Set([...value.locales.en.tags,...value.locales["zh-CN"].tags])],status:"draft",featured:value.locales.en.featured || value.locales["zh-CN"].featured,
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
    if (!demoMode && !state.capabilities.publish) { showToast("Publication is not configured yet. A GitHub App with repository write access is required.", "error"); return; }
    if (demoMode) {
      await saveContent();
      showToast(intent === "publish" ? "Publish request previewed in development mode." : "Unpublish request previewed in development mode.","info");
      return;
    }
    try {
      const previouslyPublished = ["en","zh-CN","es"].filter((locale)=>state.variants[locale]?.status === "published");
      await saveLiveDrafts();
      const locales = ["en","zh-CN","es"].filter((locale)=>state.variants[locale] && (intent !== "unpublish" || previouslyPublished.includes(locale)));
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
      const firstPr = results[0]?.pullRequest;
      const prLink = $("[data-pr-link]");
      if (firstPr?.url) {
        try {
          const url = new URL(firstPr.url);
          if (url.hostname === "github.com" && url.pathname.startsWith("/JohnZhang-DataForge/chinese-culture/pull/")) {
            prLink.href = url.href;
            prLink.textContent = "View review PR #" + firstPr.number + " ↗";
            prLink.hidden = false;
          }
        } catch {}
      }
      const checkNotes = [];
      for (const result of results) {
        try {
          const prState = await getPullRequestStatus(result.pullRequest.number);
          const checks = prState.checks || [];
          const failed = checks.filter((check)=>check.status === "completed" && check.conclusion && check.conclusion !== "success").length;
          const pending = checks.filter((check)=>check.status !== "completed").length;
          checkNotes.push("PR #" + result.pullRequest.number + ": " + (failed ? failed + " failed check(s)" : pending ? pending + " check(s) pending" : checks.length ? "checks passed" : "checks pending"));
        } catch { checkNotes.push("PR #" + result.pullRequest.number + ": checks not yet available"); }
      }
      showToast((intent === "publish" ? "Publish" : "Unpublish") + " request submitted for review: " + prNumbers + ". " + checkNotes.join("; ") + ". A reviewer must merge the PR.","success");
      await loadAllContent();
      updateStatusControls();
    } catch (error) { handleApiError(error); }
  };
  const toggleFeatured = async (id) => {
    if (!demoMode && !state.capabilities.publish) { showToast("Featured changes require the GitHub App publication integration.", "error"); return; }
    if (demoMode) {
      const item=state.items.find((entry)=>entry.id===id);
      if(item){item.featured=!item.featured;renderList();showToast(item.featured?"Added to featured content.":"Removed from featured content.","info");}
      return;
    }
    try {
      await loadVariantDetails(id);
      const locales=["en","zh-CN","es"].filter((locale)=>state.variants[locale]);
      if(!locales.length) throw new Error("No editable language variants were found.");
      for(const locale of locales){
        const variant=state.variants[locale];
        let etag=state.etags[locale];
        if(!etag) etag=(await refreshVariant(locale)).etag;
        if(!etag) throw new Error("The server did not return a revision ETag. Refresh and retry.");
        const payload={
          locale,
          collection:variant.collection,
          slug:variant.slug,
          title:variant.title,
          description:variant.description,
          category:variant.category,
          featured:!variant.featured,
          tags:variant.tags || [],
          ...(variant.seoTitle ? {seoTitle:variant.seoTitle} : {}),
          ...(variant.seoDescription ? {seoDescription:variant.seoDescription} : {}),
          bodyMarkdown:variant.bodyMarkdown,
          readingMinutes:variant.readingMinutes || 5,
          media:variant.media || [],
          sources:variant.sources || [],
          ...(variant.imageUrl ? {imageUrl:variant.imageUrl,imageAlt:variant.imageAlt || ""} : {})
        };
        if(variant.order !== undefined) payload.order=variant.order;
        if(variant.level) payload.level=variant.level;
        if(variant.chinese) payload.chinese=variant.chinese;
        if(variant.pinyin) payload.pinyin=variant.pinyin;
        const saved=await saveDraft(id,locale,payload,etag);
        state.variants[locale]=saved.data;
        state.etags[locale]=saved.etag;
        if(!state.etags[locale]) await refreshVariant(locale);
        await submitContent(id,locale,state.etags[locale],variant.status==="published"?"publish":"review","Featured setting changed from the editorial CMS.");
      }
      await loadAllContent();
      showToast("Featured setting submitted for review. The public site changes after PR merge.","success");
    } catch(error) { handleApiError(error); }
  };
  const requestDelete = (id) => {
    state.pendingDelete = id;
    $("[data-confirm-dialog]", document).showModal();
  };
  const deleteContent = async () => {
    if (demoMode) {
      state.items = state.items.filter((item) => item.id !== state.pendingDelete);
      state.pendingDelete = null;
      $("[data-confirm-dialog]", document).close();
      showToast("Content deleted in development preview.","info");
      if (state.page === "editor") setPage("content"); else renderList();
      updateCounts();
      return;
    }
    try {
      await loadVariantDetails(state.pendingDelete);
      const drafts = ["en","zh-CN","es"].filter((locale)=>state.variants[locale]?.status === "draft" && !state.variants[locale]?.pullRequest);
      if (!drafts.length) throw new Error("Only an unsubmitted draft variant can be discarded. Published content must go through a reviewed unpublish workflow.");
      for (const locale of drafts) await discardDraft(state.pendingDelete,locale);
      state.pendingDelete = null;
      $("[data-confirm-dialog]", document).close();
      showToast("Unsubmitted draft variant(s) discarded.","success");
      if (state.page === "editor") { state.dirty=false; setPage("content"); }
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
      state.capabilities = session.capabilities || {preview:true,publish:false,mediaUpload:false};
      const email = $("[data-session-email]",document);
      const role = $("[data-session-role]",document);
      if (email) email.textContent = session.email;
      if (role) role.textContent = session.role;
      $("[data-action='publish'],[data-action='unpublish'],[data-action='feature']").forEach((button)=>{button.disabled=!state.capabilities.publish;button.title=state.capabilities.publish?"Create a reviewed GitHub publication pull request":"Configure the GitHub App integration to enable publication";});
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
  const uploadCurrentMedia = async (file, locale) => {
    if (!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type) || file.size > 8 * 1024 * 1024) {
      showToast("Choose a JPEG, PNG, WebP or AVIF image under 8 MiB.","error");
      return;
    }
    if (demoMode) {
      const url=URL.createObjectURL(file);
      state.media.push({name:file.name,url,size:file.size});
      setField("mediaSrc."+uiLocale(locale),url);
      markDirty();
      showToast("Local image preview selected. It has not been uploaded.","info");
      return;
    }
    if (state.returnDirty) {
      showToast("Save your current editor changes as a draft before uploading media.","error");
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
      if(result.metadata) {
        setField("mediaAlt."+suffix,result.metadata.alt);
        setField("mediaCredit."+suffix,result.metadata.credit);
        setField("mediaLicense."+suffix,result.metadata.license);
        setField("mediaSource."+suffix,result.metadata.sourceUrl || "");
      }
      await refreshVariant(locale);
      markClean();
      showToast("Image uploaded and attached to the " + (locale==="en" ? "English" : "Chinese") + " draft.","success");
      renderVariantMedia();
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
    if (name === "new-content") await openEditor();
    if (name === "open-articles") setCollection("articles");
    if (name === "back-to-list") setPage("content");
    if (name === "edit") {
      const item = state.items.find((entry) => entry.id === action.dataset.id);
      if (item) { state.collection = item.type; await openEditor(item); }
    }
    if (name === "delete") requestDelete(action.dataset.id);
    if (name === "delete-current") requestDelete(state.selectedId);
    if (name === "confirm-delete") deleteContent();
    if (name === "cancel-delete") $("[data-confirm-dialog]", document).close();
    if (name === "feature") await toggleFeatured(action.dataset.id);
    if (name === "preview") await preview();
    if (name === "close-preview") $("[data-preview-dialog]", document).close();
    if (name === "save-draft") await saveContent();
    if (name === "publish") await submitWorkflow("publish");
    if (name === "unpublish") await submitWorkflow("unpublish");
    if (name === "clear-filters") { $("[data-list-search]").value=""; $("[data-status-filter]").value=""; $("[data-language-filter]").value=""; state.pageNumber=1; renderList(); }
    if (name === "save-settings") {
      if (demoMode) showToast("Settings preview only in development mode.","info");
      else { showAdminBanner("Homepage and site-settings write APIs are not part of OpenAPI v1.0.0 yet. These controls are read-only until Agent 0 approves the extension.","warning"); showToast("No settings were saved; the API contract does not define this operation.","info"); }
    }
    if (name === "choose-upload") $("[data-media-input]").click();
    if (name === "upload-variant-media") {
      const locale=action.dataset.locale;
      const fileInput=root.querySelector('[data-variant-media-input="' + locale + '"]');
      if (!fileInput) return;
      if (!demoMode) {
        try { await saveLiveDrafts(); }
        catch(error) { handleApiError(error); return; }
      }
      fileInput.click();
    }
    if (name === "select-variant-media") {
      const suffix=uiLocale(action.dataset.locale);
      setField("mediaSrc."+suffix,action.dataset.src);
      setField("mediaAlt."+suffix,action.dataset.alt);
      setField("mediaCredit."+suffix,action.dataset.credit);
      setField("mediaLicense."+suffix,action.dataset.license);
      setField("mediaSource."+suffix,action.dataset.source);
      markDirty();
      showToast("Existing image selected for this language variant.","info");
    }
    if (name === "add-navigation") { if (demoMode) showToast("Navigation preview only in development mode.","info"); else showToast("Navigation API is not defined in the approved contract yet.","info"); }
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
  root.addEventListener("change", async (event) => {
    if (event.target.matches("[data-status-filter],[data-language-filter]")) { state.pageNumber=1; renderList(); }
    if (event.target.matches("[data-variant-media-input]")) {
      const file=event.target.files?.[0];
      const locale=event.target.dataset.variantMediaInput;
      event.target.value="";
      if(file) await uploadCurrentMedia(file,locale);
    }
  });
  const renderMedia = () => {
    const grid = $("[data-media-grid]");
    if (demoMode) {
      $("[data-media-count]").textContent = state.media.length + " local preview asset(s)";
      grid.innerHTML = state.media.length ? state.media.map((file) => '<article class="media-card" data-name="' + escapeHtml(file.name.toLocaleLowerCase()) + '"><img src="' + file.url + '" alt="" /><div><strong>' + escapeHtml(file.name) + '</strong><small>' + Math.round(file.size/1024) + ' KB · local preview</small><button class="text-button" type="button" data-action="select-media" data-url="' + file.url + '" data-locale="en">Use image</button></div></article>').join("") : '<div class="media-empty"><span>▧</span><strong>Local preview library is empty</strong><p>Demo uploads are not sent to a server.</p></div>';
      return;
    }
    const locale=$("[data-media-locale]").value || "en";
    const media=state.variants[locale]?.media || [];
    $("[data-media-count]").textContent = media.length + " asset(s) attached to this language variant";
    grid.innerHTML = media.length ? media.map((item,index) => '<article class="media-card" data-name="' + escapeHtml((item.src || "").toLocaleLowerCase()) + '"><img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.alt || "") + '" /><div><strong>' + escapeHtml(item.src.split("/").pop()) + '</strong><small>' + escapeHtml(item.license || "License not supplied") + '</small><button class="text-button" type="button" data-action="select-media" data-url="' + escapeHtml(item.src) + '" data-locale="' + locale + '" data-alt="' + escapeHtml(item.alt || "") + '" data-credit="' + escapeHtml(item.credit || "") + '" data-license="' + escapeHtml(item.license || "") + '" data-source="' + escapeHtml(item.sourceUrl || "") + '">Use as cover</button></div></article>').join("") : '<div class="media-empty"><span>▧</span><strong>No media attached to this variant</strong><p>Upload an image after saving this language as a draft.</p></div>';
  };
  document.addEventListener("click", (event) => {
    const externalAction = event.target.closest("[data-action]");
    if (externalAction && !root.contains(externalAction)) {
      if (externalAction.dataset.action === "close-preview") $("[data-preview-dialog]", document).close();
      if (externalAction.dataset.action === "cancel-delete") $("[data-confirm-dialog]", document).close();
      if (externalAction.dataset.action === "confirm-delete") deleteContent();
    }
    const choose = event.target.closest("[data-action='select-media']");
    if (choose) {
      if (state.returnPage === "editor") { state.dirty=false; setPage("editor"); state.returnPage=null; }
      if (state.page !== "editor") { showToast("Open a content editor to select a cover image.","info"); return; }
      const suffix=uiLocale(choose.dataset.locale || "en");
      setField("mediaSrc."+suffix,choose.dataset.url);
      if(choose.dataset.alt) setField("mediaAlt."+suffix,choose.dataset.alt);
      if(choose.dataset.credit) setField("mediaCredit."+suffix,choose.dataset.credit);
      if(choose.dataset.license) setField("mediaLicense."+suffix,choose.dataset.license);
      if(choose.dataset.source) setField("mediaSource."+suffix,choose.dataset.source);
      markDirty();
      showToast("Cover image selected for the " + (suffix==="zh"?"Chinese":"English") + " variant.","info");
    }
    const previewLocale = event.target.closest("[data-preview-language]");
    if (previewLocale) {
      state.previewLocale = previewLocale.dataset.previewLanguage;
      $$("[data-preview-language]", document).forEach((button) => button.classList.toggle("is-selected",button === previewLocale));
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
  if (form) form.addEventListener("submit",(event) => event.preventDefault());
  if (!demoMode) {
    $('[data-action="publish"], [data-action="unpublish"], [data-action="upload-variant-media"]').forEach((button)=>{button.disabled=true;button.title="This workflow requires the GitHub publication/media integration.";});
    $('[data-variant-media-input]').forEach((field)=>{field.disabled=true;});
    $('[data-page="homepage"] input, [data-page="homepage"] textarea, [data-page="homepage"] select').forEach((field)=>{field.disabled=true;});
    $$('[data-page="settings"] input, [data-page="settings"] textarea, [data-page="settings"] select').forEach((field)=>{field.disabled=true;});
    $$('[data-page="homepage"] [data-action="save-settings"], [data-page="settings"] [data-action="save-settings"], [data-page="settings"] [data-action="add-navigation"]').forEach((button)=>{button.disabled=true;});
  } else {
    $$('[data-page="homepage"] input, [data-page="homepage"] textarea, [data-page="homepage"] select').forEach((field)=>{field.disabled=false;});
    $$('[data-page="settings"] input, [data-page="settings"] textarea, [data-page="settings"] select').forEach((field)=>{field.disabled=false;});
    $$('[data-page="homepage"] [data-action="save-settings"], [data-page="settings"] [data-action="save-settings"], [data-page="settings"] [data-action="add-navigation"]').forEach((button)=>{button.disabled=false;});
  }
  if (demoMode) {
    setConnection("Development preview");
    renderDashboard();
    updateCounts();
  } else {
    setConnection("Connecting to CMS");
    renderDashboard();
    updateCounts();
    void bootstrapLive();
  }
}
