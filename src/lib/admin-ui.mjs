export function filterContent(items, options = {}) {
  const query = String(options.query || "").trim().toLocaleLowerCase();
  const status = options.status || "";
  const language = options.language || "";
  return items.filter((item) => {
    const title = [item.title?.zh, item.id, item.slug, item.category, ...(item.tags || [])].filter(Boolean).join(" ").toLocaleLowerCase();
    if (query && !title.includes(query)) return false;
    if (status && !(item.status === status || item.statuses?.includes(status))) return false;

    return true;
  });
}

export function paginate(items, page = 1, pageSize = 10) {
  const size = Math.max(1, Number(pageSize) || 10);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const startIndex = (current - 1) * size;
  return {
    items: items.slice(startIndex, startIndex + size),
    page: current,
    pages,
    total,
    start: total ? startIndex + 1 : 0,
    end: Math.min(startIndex + size, total)
  };
}

export function translationStatus(item) {
  if (Array.isArray(item.translationLocales)) {
    return { zh: item.translationLocales.includes("zh-TW") || item.translationLocales.includes("zh") };
  }
  const complete = (locale) => Boolean(item.title?.[locale]?.trim() && item.description?.[locale]?.trim() && item.body?.[locale]?.trim());
  return { zh: complete("zh") };
}

export function parseTags(value) {
  return [...new Set(String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean))];
}

export function wordCount(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = text.replace(/[\u3400-\u9fff]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return cjk + latin;
}


export function localizedSeoPayload(locale, title, description) {
  const payload = { locale };
  const seoTitle = String(title || "").trim();
  const seoDescription = String(description || "").trim();
  if (seoTitle) payload.seoTitle = seoTitle;
  if (seoDescription) payload.seoDescription = seoDescription;
  return payload;
}
