import { filterContent, paginate, parseTags, translationStatus, wordCount } from "../lib/admin-ui.mjs";
import { requestAdminApi, AdminApiError } from "../lib/admin-api.mjs";

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
    articles:{title:"Articles",singular:"article",subtitle:"Manage culture stories, editorial metadata and publication status."},
    lessons:{title:"Learning guides",singular:"learning guide",subtitle:"Organize the learning path and beginner-friendly lessons."},
    festivals:{title:"Festivals",singular:"festival",subtitle:"Manage festival guides, seasonal stories and traditions."},
    books:{title:"Books",singular:"book",subtitle:"Manage book introductions and reading guides."},
    events:{title:"Events",singular:"event",subtitle:"Publish verified events and community announcements."}
  };
  const state = {items:demoItems.slice(),page:"dashboard",collection:"articles",pageNumber:1,pageSize:8,selectedId:null,isNew:false,dirty:false,pendingDelete:null,previewLocale:"en",media:[],returnPage:null,returnDirty:false};
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
  const formData = () => ({
    id:formValue("id"),
    slug:formValue("slug"),
    type:formValue("type") || state.collection,
    title:{en:formValue("title.en"),zh:formValue("title.zh")},
    description:{en:formValue("description.en"),zh:formValue("description.zh")},
    body:{en:formValue("body.en"),zh:formValue("body.zh")},
    category:formValue("category"),
    tags:parseTags(formValue("tags")),
    status:formValue("status") || "draft",
    featured:Boolean(form.elements.namedItem("featured")?.checked),
    seo:{title:{en:formValue("seoTitle.en"),zh:formValue("seoTitle.zh")},description:{en:formValue("seoDescription.en"),zh:formValue("seoDescription.zh")}},
    coverImage:formValue("coverImage")
  });
  const setField = (name,value) => { const field = form.elements.namedItem(name); if (!field) return; if (field.type === "checkbox") field.checked = Boolean(value); else field.value = value ?? ""; };
  const markClean = () => { state.dirty = false; $("[data-save-state]").textContent = "All changes saved"; $("[data-save-state]").classList.remove("is-dirty"); };
  const markDirty = () => { state.dirty = true; $("[data-save-state]").textContent = "Unsaved changes"; $("[data-save-state]").classList.add("is-dirty"); };
  const openEditor = (item = null) => {
    state.selectedId = item?.id || null;
    state.isNew = !item;
    state.dirty = false;
    form.reset();
    const value = item || {id:"",slug:"",type:state.collection,title:{en:"",zh:""},description:{en:"",zh:""},body:{en:"",zh:""},category:"",tags:[],status:"draft",featured:false,seo:{title:{en:"",zh:""},description:{en:"",zh:""}},coverImage:""};
    setField("id",value.id);
    setField("slug",value.slug);
    setField("type",value.type || state.collection);
    setField("title.en",value.title?.en); setField("title.zh",value.title?.zh);
    setField("description.en",value.description?.en); setField("description.zh",value.description?.zh);
    setField("body.en",value.body?.en); setField("body.zh",value.body?.zh);
    setField("category",value.category); setField("tags",(value.tags || []).join(", "));
    setField("status",value.status || "draft"); setField("featured",value.featured);
    setField("seoTitle.en",value.seo?.title?.en); setField("seoTitle.zh",value.seo?.title?.zh);
    setField("seoDescription.en",value.seo?.description?.en); setField("seoDescription.zh",value.seo?.description?.zh);
    setField("coverImage",value.coverImage);
    $("[data-editor-heading]").textContent = item ? "Edit content" : "Create " + collectionNames[state.collection].singular;
    $("[data-action='delete-current']").hidden = !item;
    updateTranslationIndicators();
    setPage("editor");
    markClean();
  };
  const updateTranslationIndicators = () => {
    ["en","zh"].forEach((locale) => {
      const title = formValue("title." + locale);
      const desc = formValue("description." + locale);
      const body = formValue("body." + locale);
      const complete = Boolean(title.trim() && desc.trim() && body.trim());
      const node = $("[data-language-state='" + locale + "']");
      node.textContent = complete ? "Complete" : (title || desc || body ? "In progress" : "Not started");
      node.classList.toggle("is-missing",!complete);
      const count = $("[data-word-count='" + locale + "']");
      if (count) count.textContent = wordCount(body) + (locale === "zh" ? " 字" : " words");
    });
  };
  const preview = (openDialog = true) => {
    const value = formData();
    const locale = state.previewLocale;
    $("[data-preview-title]").textContent = value.title[locale] || (locale === "en" ? "Untitled story" : "尚未填写标题");
    $("[data-preview-description]").textContent = value.description[locale] || "";
    $("[data-preview-body]").textContent = value.body[locale] || "";
    $("[data-preview-category]").textContent = value.category || collectionNames[value.type]?.title || "Culture";
    const complete = Boolean(value.title[locale] && value.description[locale] && value.body[locale]);
    $("[data-preview-language-status]").textContent = complete ? "Translation complete" : "This language version is incomplete";
    if (openDialog && !$("[data-preview-dialog]").open) $("[data-preview-dialog]").showModal();
  };
  const apiNotReady = () => {
    showToast("The Agent 5 API contract is not available yet. No changes were sent or saved.", "info");
  };
  const saveContent = async (status) => {
    if (!form.reportValidity()) return;
    const payload = formData();
    payload.status = status;
    if (!demoMode) { apiNotReady(); return; }
    const now = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    payload.updatedAt = now;
    if (state.selectedId) {
      const index = state.items.findIndex((item) => item.id === state.selectedId);
      if (index >= 0) state.items[index] = {...state.items[index],...payload};
    } else {
      payload.id = "demo-" + Date.now().toString(36);
      payload.slug = payload.slug || payload.id;
      state.items.unshift(payload);
      state.selectedId = payload.id;
      setField("id",payload.id);
    }
    state.collection = payload.type;
    markClean();
    updateCounts();
    showToast(status === "published" ? "Content published in demo mode." : "Draft saved in demo mode.", "info");
    setCollection(payload.type);
  };
  const requestDelete = (id) => {
    state.pendingDelete = id;
    $("[data-confirm-dialog]").showModal();
  };
  const deleteContent = () => {
    if (!demoMode) { apiNotReady(); $("[data-confirm-dialog]").close(); return; }
    state.items = state.items.filter((item) => item.id !== state.pendingDelete);
    state.pendingDelete = null;
    $("[data-confirm-dialog]").close();
    showToast("Content deleted in demo mode.","info");
    if (state.page === "editor") setPage("content"); else renderList();
    updateCounts();
  };
  const handleApiError = (error) => {
    if (error instanceof AdminApiError && error.status === 401) {
      showToast(error.message,"error");
      setConnection("Authentication required");
      return;
    }
    if (error instanceof AdminApiError && error.status === 403) {
      showToast(error.message,"error");
      setConnection("Permission denied");
      return;
    }
    showToast(error.message || "The request failed.","error");
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
